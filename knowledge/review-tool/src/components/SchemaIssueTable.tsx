'use client';

import { useState } from 'react';
import { VALID_WHEN_KEYS } from '@/lib/constants';

interface SchemaIssue {
  anglerId: string;
  anglerName: string;
  lure: string;
  ruleType: 'tip' | 'color' | 'modifier';
  ruleIndex: number;
  field: string;
  value: unknown;
  tip: string;
}

interface Props {
  field: string;
  issues: SchemaIssue[];
  onBatchAction: (items: SchemaIssue[], action: 'appendToTip' | 'delete') => void;
  onRemap: (issue: SchemaIssue, remapTo: string, remapValue?: unknown) => void;
}

interface FieldGuidance {
  what: string;
  recommended: 'append' | 'delete' | 'remap';
  remapTarget?: string;
  why: string;
}

/** Per-field-name guidance explaining what it is and what to do */
const FIELD_GUIDANCE: Record<string, FieldGuidance> = {
  structure: {
    what: 'Structure type where the tip applies (e.g. "pads", "isolated structure", "current").',
    recommended: 'append',
    why: 'StrikeZone uses a separate structureAdvice system, not when.structure. Appending preserves the context in the tip text. Consider also using the Structure tool to assign these to structure slots.',
  },
  species: {
    what: 'Target species (e.g. "smallmouth"). StrikeZone doesn\'t filter by species.',
    recommended: 'append',
    why: 'Species context is useful for the human reading the tip, but can\'t be matched by StrikeZone.',
  },
  cover: {
    what: 'Cover type (e.g. "lily pads", "vegetation", "heavy mats").',
    recommended: 'append',
    why: 'Cover is useful fishing context but not a ConditionPredicate field. Append keeps it visible.',
  },
  depth: {
    what: 'Depth descriptor (e.g. "deep", "shallow"). StrikeZone uses fishDepth with min/max numbers.',
    recommended: 'append',
    why: 'These are vague text values like "deep" — not numeric ranges that fishDepth expects. Append is safer than trying to guess numbers.',
  },
  isClear: {
    what: 'Water clarity boolean. StrikeZone uses waterClarity ("clear"/"stained"/"muddy"), not isClear.',
    recommended: 'remap',
    remapTarget: 'waterClarity',
    why: 'Remap to waterClarity. isClear: true → waterClarity: ["clear"]. You\'ll need to adjust the value format after remapping.',
  },
  weather: {
    what: 'General weather (e.g. "windy", "sunny"). StrikeZone has skyCondition, windSpeed, etc.',
    recommended: 'append',
    why: 'Weather is too vague to map reliably. "windy" could be windSpeed but what range? "sunny" could be skyCondition: "clear". Append to preserve, then manually set the right valid fields.',
  },
  sky: {
    what: 'Sky description (e.g. "sunny", "cloudy"). Similar to skyCondition but different values.',
    recommended: 'append',
    why: 'Values like "calm/sunny" don\'t match skyCondition enums ("clear", "partly-cloudy", "overcast", "rain"). Append to preserve.',
  },
  region: {
    what: 'Geographic region (e.g. "south", "north"). Not a StrikeZone field.',
    recommended: 'append',
    why: 'Regional context is useful but StrikeZone doesn\'t condition on geography.',
  },
  waterBody: {
    what: 'Specific lake/river name (e.g. "Lake Ontario"). Not a StrikeZone field.',
    recommended: 'append',
    why: 'Useful angler context but not matchable. Append preserves attribution.',
  },
  general: {
    what: 'Flag marking a rule as "general advice" (always true). Means the rule has no real condition.',
    recommended: 'delete',
    why: 'general: true adds no filtering — the rule fires on everything anyway. Safe to remove.',
  },
  forage: {
    what: 'Forage type (e.g. "shad"). Not a StrikeZone field.',
    recommended: 'append',
    why: 'Good context for why a lure works, but can\'t be matched.',
  },
  technique: {
    what: 'Technique name (e.g. "flipping"). Describes how, not when.',
    recommended: 'append',
    why: 'Technique is about presentation, not conditions. Append to keep in tip text.',
  },
  line: {
    what: 'Line type (e.g. "fluorocarbon", "braid"). Gear info, not a condition.',
    recommended: 'append',
    why: 'Line choice is gear context, not a condition StrikeZone can match on.',
  },
  fishingPressure: {
    what: 'Fishing pressure level (e.g. "high"). Not a StrikeZone field.',
    recommended: 'append',
    why: 'Useful context but not matchable.',
  },
  pressure: {
    what: 'Could mean fishing pressure or barometric pressure. Check values.',
    recommended: 'append',
    why: 'If it\'s "high"/"low" fishing pressure, append. If it were barometric, it\'d be pressureTrend.',
  },
  fishBehavior: {
    what: 'Fish behavior description (e.g. "fast-moving schools", "chasing").',
    recommended: 'append',
    why: 'Valuable context but not a ConditionPredicate field.',
  },
  current: {
    what: 'Water current level (e.g. "heavy"). Not a StrikeZone field.',
    recommended: 'append',
    why: 'Current is useful context but can\'t be matched.',
  },
  waterType: {
    what: 'Water body type (e.g. "highland reservoir", "TN River").',
    recommended: 'append',
    why: 'Geographic/water type context, not matchable.',
  },
  presentation: {
    what: 'Presentation style (e.g. "finesse", "weightless"). How, not when.',
    recommended: 'append',
    why: 'Presentation is technique context, not a condition.',
  },
  spawnStage: {
    what: 'Spawn stage (e.g. "pre-spawn/spawn"). Overlaps with season.',
    recommended: 'append',
    why: 'Could remap to season, but values like "pre-spawn/spawn" don\'t cleanly map. Append is safer.',
  },
  clarity: {
    what: 'Water clarity as text (e.g. "clear"). Duplicate of waterClarity.',
    recommended: 'remap',
    remapTarget: 'waterClarity',
    why: 'This is waterClarity by another name. Remap to waterClarity.',
  },
  targetSpecies: {
    what: 'Same as species — target species name.',
    recommended: 'append',
    why: 'Not a StrikeZone field. Append to preserve.',
  },
  coverType: {
    what: 'Same as cover — type of cover (e.g. "grass").',
    recommended: 'append',
    why: 'Not a StrikeZone field. Append to preserve.',
  },
};

const DEFAULT_GUIDANCE: FieldGuidance = {
  what: 'Extracted from transcript but not recognized by StrikeZone.',
  recommended: 'append',
  why: 'When in doubt, append to tip text to preserve the context.',
};

export default function SchemaIssueTable({ field, issues, onBatchAction, onRemap }: Props) {
  const [expanded, setExpanded] = useState(true);
  const guidance = FIELD_GUIDANCE[field] ?? DEFAULT_GUIDANCE;
  const tipIssues = issues.filter(i => i.ruleType === 'tip');

  const recLabel = guidance.recommended === 'append' ? 'Append all to tip text'
    : guidance.recommended === 'delete' ? 'Delete all'
    : `Remap all → ${guidance.remapTarget}`;

  const recColor = guidance.recommended === 'append' ? 'bg-yellow-900/50 border-yellow-800 text-yellow-300'
    : guidance.recommended === 'delete' ? 'bg-red-900/50 border-red-800 text-red-300'
    : 'bg-blue-900/50 border-blue-800 text-blue-300';

  const handleRecommended = () => {
    if (guidance.recommended === 'append') {
      onBatchAction(tipIssues.length > 0 ? tipIssues : issues, 'appendToTip');
    } else if (guidance.recommended === 'delete') {
      onBatchAction(issues, 'delete');
    } else if (guidance.recommended === 'remap' && guidance.remapTarget) {
      for (const issue of issues) {
        onRemap(issue, guidance.remapTarget);
      }
    }
  };

  return (
    <div className="mb-6 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-900 cursor-pointer hover:bg-gray-800"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500">{expanded ? '▼' : '▶'}</span>
          <code className="text-red-400 font-bold">{field}</code>
          <span className="text-gray-500 text-sm">{issues.length} issues</span>
        </div>
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleRecommended}
            className={`px-2 py-1 text-xs border rounded font-medium ${recColor}`}
            title={guidance.why}
          >
            ★ {recLabel}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Guidance bar */}
          <div className="px-4 py-2 bg-gray-900/50 border-b border-gray-800 text-xs">
            <div className="text-gray-400 mb-1">
              <span className="text-gray-300 font-medium">What is this?</span> {guidance.what}
            </div>
            <div className="text-gray-400">
              <span className="text-emerald-400 font-medium">Recommended:</span> {guidance.why}
            </div>
          </div>

          {/* Other batch actions */}
          <div className="px-4 py-2 border-b border-gray-800/50 flex gap-2 text-xs">
            <span className="text-gray-600">Other actions:</span>
            {guidance.recommended !== 'append' && tipIssues.length > 0 && (
              <button
                onClick={() => onBatchAction(tipIssues, 'appendToTip')}
                className="px-1.5 py-0.5 bg-yellow-900/30 border border-yellow-800/50 rounded hover:bg-yellow-900/50 text-yellow-400"
              >
                Append all to tip text
              </button>
            )}
            {guidance.recommended !== 'delete' && (
              <button
                onClick={() => onBatchAction(issues, 'delete')}
                className="px-1.5 py-0.5 bg-red-900/30 border border-red-800/50 rounded hover:bg-red-900/50 text-red-400"
              >
                Delete all
              </button>
            )}
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-left text-xs">
                <th className="px-4 py-2">Angler</th>
                <th className="px-4 py-2">Lure</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Tip/Rule</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-300">{issue.anglerName}</td>
                  <td className="px-4 py-2 text-gray-400">{issue.lure}</td>
                  <td className="px-4 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      issue.ruleType === 'tip' ? 'bg-blue-900 text-blue-300' :
                      issue.ruleType === 'color' ? 'bg-purple-900 text-purple-300' :
                      'bg-orange-900 text-orange-300'
                    }`}>
                      {issue.ruleType}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <code className="text-yellow-400 text-xs">
                      {JSON.stringify(issue.value)}
                    </code>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs max-w-xs truncate" title={issue.tip}>
                    {issue.tip}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      {issue.ruleType === 'tip' && (
                        <button
                          onClick={() => onBatchAction([issue], 'appendToTip')}
                          className="px-1.5 py-0.5 text-xs bg-yellow-900/50 border border-yellow-800 rounded hover:bg-yellow-900"
                          title="Move value into tip text as [field: value], remove from conditions"
                        >
                          →tip
                        </button>
                      )}
                      <select
                        className="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300"
                        defaultValue=""
                        onChange={e => {
                          if (e.target.value) onRemap(issue, e.target.value);
                          e.target.value = '';
                        }}
                      >
                        <option value="">remap→</option>
                        {VALID_WHEN_KEYS.map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => onBatchAction([issue], 'delete')}
                        className="px-1.5 py-0.5 text-xs bg-red-900/50 border border-red-800 rounded hover:bg-red-900"
                        title="Remove this field from the condition entirely"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
