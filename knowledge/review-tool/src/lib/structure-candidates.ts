// ─── Structure Advice Candidate Extraction ───
import type { MergedReview } from './types';
import { STRUCTURE_KEYWORDS, STRUCTURE_TYPES, type StructureType } from './constants';

export interface StructureCandidate {
  anglerId: string;
  anglerName: string;
  source: 'knowledge' | 'tipRule';
  text: string;
  lure?: string;
  ruleIndex?: number;
  suggestedType: StructureType | null;
  confidence: number;
}

/** Map of keywords to their most likely structure type */
const KEYWORD_TO_TYPE: Record<string, StructureType> = {
  point: 'point',
  bluff: 'bluff',
  grass: 'grass',
  flat: 'flat',
  dock: 'dock',
  creek: 'creek-channel',
  channel: 'creek-channel',
  hump: 'hump',
  riprap: 'riprap',
  laydown: 'laydown',
  // These map to nearest type but with lower confidence
  ledge: 'hump',
  bank: 'bluff',
  brush: 'laydown',
  timber: 'laydown',
  rock: 'riprap',
};

/** Lower confidence for indirect keyword matches */
const INDIRECT_KEYWORDS = new Set(['ledge', 'bank', 'brush', 'timber', 'rock']);

function suggestType(text: string): { type: StructureType | null; confidence: number } {
  const lower = text.toLowerCase();
  let bestType: StructureType | null = null;
  let bestConfidence = 0;

  for (const keyword of STRUCTURE_KEYWORDS) {
    if (lower.includes(keyword)) {
      const mapped = KEYWORD_TO_TYPE[keyword];
      const conf = INDIRECT_KEYWORDS.has(keyword) ? 0.5 : 0.8;
      if (conf > bestConfidence) {
        bestType = mapped;
        bestConfidence = conf;
      }
    }
  }

  return { type: bestType, confidence: bestConfidence };
}

export function extractCandidates(
  anglers: Array<{ id: string; name: string; data: MergedReview }>
): StructureCandidate[] {
  const candidates: StructureCandidate[] = [];

  for (const { id, name, data } of anglers) {
    // Search knowledge entries
    for (const entry of data.knowledge) {
      const searchText = `${entry.category} ${entry.topic} ${entry.insight}`;
      const { type, confidence } = suggestType(searchText);
      if (type) {
        candidates.push({
          anglerId: id,
          anglerName: name,
          source: 'knowledge',
          text: entry.insight,
          suggestedType: type,
          confidence,
        });
      }
    }

    // Search tipRules with when.structure (directly names the type)
    for (const [lureName, opinion] of Object.entries(data.opinions)) {
      for (let i = 0; i < opinion.tipRules.length; i++) {
        const rule = opinion.tipRules[i];
        const when = rule.when as Record<string, unknown>;

        // Direct structure field reference
        if (when.structure) {
          const structVals = Array.isArray(when.structure) ? when.structure : [when.structure];
          for (const val of structVals) {
            const valStr = String(val).toLowerCase();
            // Check if it matches a structure type directly
            const matchedType = STRUCTURE_TYPES.find(t => valStr.includes(t)) ?? null;
            candidates.push({
              anglerId: id,
              anglerName: name,
              source: 'tipRule',
              text: rule.tip,
              lure: lureName,
              ruleIndex: i,
              suggestedType: matchedType,
              confidence: matchedType ? 0.9 : 0.4,
            });
          }
        } else {
          // Check tip text for structure keywords
          const { type, confidence } = suggestType(rule.tip);
          if (type) {
            candidates.push({
              anglerId: id,
              anglerName: name,
              source: 'tipRule',
              text: rule.tip,
              lure: lureName,
              ruleIndex: i,
              suggestedType: type,
              confidence,
            });
          }
        }
      }
    }
  }

  // Sort by confidence desc, then by angler
  candidates.sort((a, b) => b.confidence - a.confidence || a.anglerId.localeCompare(b.anglerId));
  return candidates;
}
