export interface BriefingConditions {
  season: string;
  waterClarity: string;
  pressureState: string;
  lure: string;
}

export interface BriefingApproach {
  lure: string;
  color: string;
  retrieve: string;
  targets: string;
  proSource: string;
}

export interface ProInsight {
  angler: string;
  insight: string;
}

export interface TacticalBriefing {
  conditions: BriefingConditions;
  briefing: {
    headline: string;
    gameplan: string;
    primaryApproach: BriefingApproach;
    alternateApproach: BriefingApproach;
    proInsights: ProInsight[];
    depthStrategy: string;
    adjustIf: string[];
  };
}

export interface BriefingsBundle {
  generated: string;  // ISO date
  count: number;
  briefings: TacticalBriefing[];
}
