// ─── Matt Robertson: Offshore Specialist, Ledge Fishing, Moving Baits on Hard Bottom ───
// Sources: Bassmaster.com, MLF tournament coverage, _merged-review.json
import type { AnglerProfile } from './types';

export const ROBERTSON: AnglerProfile = {
  name: 'Robertson',
  id: 'robertson',
  defaultCredibility: 0.5,
  credibility: {
    'Deep Diving Crankbait': 1.0,
    'Swim Jig': 0.9,
    'Lipless Crankbait': 0.9,
    'Medium Diving Crankbait': 0.8,
    'Spinnerbait (Colorado/Willow)': 0.8,
    '10" Worm (Shakey/TX)': 0.8,
    'Squarebill Crankbait': 0.7,
    'Walking Topwater': 0.7,
    'Ned Rig': 0.7,
    'Neko Rig': 0.7,
  },
  opinions: [
    // ─── Lipless Crankbait ───
    {
      lure: 'Lipless Crankbait',
      confidenceModifiers: [
        // Robertson: Pre-spawn grass slow-roll specialist
        { when: { season: 'pre-spawn' }, adjustment: 12 },
        // Robertson: Stained water amplifies vibration advantage
        { when: { waterClarity: 'stained' }, adjustment: 8 },
      ],
      colorRules: [
        { when: { season: 'pre-spawn' }, color: 'Shad', hex: '#c0c0c0', priority: 10 },
      ],
      tipRules: [
        { when: { season: 'pre-spawn' }, tip: 'Robertson: Slow-roll a 3/8 or 1/2oz lipless just off bottom during prespawn. Keep it ticking the grass tops — rip free when it loads up.', priority: 12 },
        { when: { waterClarity: 'stained' }, tip: 'Robertson: Stained water lipless — the vibration calls fish in. Slow-roll near bottom, let it yo-yo on contact with cover.', priority: 8 },
        { when: { season: 'fall' }, tip: 'Robertson: Fall lipless over grass edges and hard bottom transitions. Match the shad migration with a steady retrieve.', priority: 7 },
      ],
      defaultTip: 'Robertson: Slow-roll specialist — 3/8 or 1/2oz lipless just off bottom. Keep it in the strike zone with a controlled, steady retrieve.',
    },

    // ─── Deep Diving Crankbait ───
    {
      lure: 'Deep Diving Crankbait',
      confidenceModifiers: [
        // Robertson: Summer offshore ledge cranking is his signature
        { when: { season: 'summer', fishDepth: { min: 15 } }, adjustment: 15 },
        // Robertson: Post-spawn fish transitioning offshore
        { when: { season: 'post-spawn' }, adjustment: 10 },
      ],
      colorRules: [
        // Robertson: Blue/Chartreuse for offshore
        { when: { season: 'summer' }, color: 'Blue/Chartreuse', hex: '#4169e1', priority: 10 },
        { when: { season: 'post-spawn' }, color: 'Blue/Chartreuse', hex: '#4169e1', priority: 9 },
        { when: { waterClarity: 'stained' }, color: 'Blue/Chartreuse', hex: '#4169e1', priority: 8 },
        { when: { waterClarity: 'clear' }, color: 'Natural Shad', hex: '#c0c0c0', priority: 7 },
      ],
      tipRules: [
        { when: { season: 'post-spawn' }, tip: 'Robertson: Dredger 20.5 or 25.5 following post-spawners off points. They\'re moving — intercept them where the point meets deep water.', priority: 12 },
        { when: { season: 'summer', fishDepth: { min: 15 } }, tip: 'Robertson: Summer offshore ledge cranking — cast at 45 degrees across points at ditch intersections. Grind the deep diver across hard bottom.', priority: 12 },
        { when: { season: 'summer' }, tip: 'Robertson: When the swimbait bite slows, switch to a deep diver. Covers more water and triggers reaction strikes from scattered fish.', priority: 10 },
        { when: { season: 'fall' }, tip: 'Robertson: Fall deep cranking on offshore structure. Fish follow the bait migration — target channel swings and ledge transitions.', priority: 8 },
      ],
      defaultTip: 'Robertson: "Cast at 45 degrees across points at ditch intersections." Grind the Dredger across hard bottom — deflection is the trigger.',
    },

    // ─── 10" Worm (Shakey/TX) ───
    {
      lure: '10" Worm (Shakey/TX)',
      colorRules: [
        { when: { waterClarity: 'stained' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 10 },
        { when: { waterClarity: 'clear' }, color: 'Watermelon Red', hex: '#4a7c59', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Robertson: Texas-rig a big worm when schools bust up and scatter. The 10-inch profile gets bites when grouped fish disperse off the ledge.', priority: 12 },
        { when: { season: 'post-spawn' }, tip: 'Robertson: Post-spawn schools on offshore structure — big worm drags through the zone when moving baits get refused.', priority: 10 },
      ],
    },

    // ─── Swim Jig ───
    {
      lure: 'Swim Jig',
      confidenceModifiers: [
        // Robertson: Summer offshore swimbaits on hard bottom
        { when: { season: 'summer', fishDepth: { min: 10 } }, adjustment: 10 },
      ],
      colorRules: [
        // Robertson: White for offshore, Ol' Smokey for clear
        { when: { season: 'summer' }, color: 'White', hex: '#f5f5f5', priority: 10 },
        { when: { waterClarity: 'clear' }, color: 'Ol\' Smokey', hex: '#708090', priority: 9 },
        { when: { season: 'pre-spawn' }, color: 'White', hex: '#f5f5f5', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'summer', fishDepth: { min: 10 } }, tip: 'Robertson: 7-inch swimbait on 1oz jighead for grouped fish on offshore structure. Slow-roll on hard bottom — match the depth to the school.', priority: 12 },
        { when: { season: 'pre-spawn' }, tip: 'Robertson: 3/8oz white swim jig for flipping flooded cover in spring. Pitch to isolated wood and let it swim through the branches on the fall.', priority: 10 },
        { when: { season: 'summer' }, tip: 'Robertson: Swimbait is the first tool in the offshore rotation. When fish are grouped tight on electronics, slow-roll through the school.', priority: 9 },
        { when: { season: 'post-spawn' }, tip: 'Robertson: Post-spawn swim jig as fish transition off the bank. Follow them from secondary points to main lake structure.', priority: 8 },
      ],
      defaultTip: 'Robertson: 7-inch swimbait on 1oz jighead is his offshore weapon. Slow-roll on hard bottom — when they\'re grouped, the swimbait gets the biggest bites.',
    },

    // ─── Medium Diving Crankbait ───
    {
      lure: 'Medium Diving Crankbait',
      colorRules: [
        // Robertson: Citrus for winter offshore
        { when: { season: 'winter' }, color: 'Citrus', hex: '#ffa500', priority: 10 },
        { when: { waterClarity: 'stained' }, color: 'Citrus', hex: '#ffa500', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'winter' }, tip: 'Robertson: SPRO Big John in citrus for winter offshore bass. Slow-roll on hard bottom — cold water fish want a slower presentation but still react to deflection.', priority: 12 },
        { when: { season: 'fall' }, tip: 'Robertson: Medium diver on offshore transitions in fall. Target the 8-12ft zone as fish begin staging on secondary structure.', priority: 8 },
      ],
    },

    // ─── Squarebill Crankbait ───
    {
      lure: 'Squarebill Crankbait',
      colorRules: [
        // Robertson: Kentucky Blue for post-spawn
        { when: { season: 'post-spawn' }, color: 'Kentucky Blue', hex: '#5b92e5', priority: 10 },
      ],
      tipRules: [
        { when: { season: 'post-spawn' }, tip: 'Robertson: Large-bodied squarebill for post-spawn bass on the highest spot of the bar. They sit shallow on top — deflect off rock and gravel.', priority: 12 },
        { when: { season: 'summer' }, tip: 'Robertson: Squarebill on shallow offshore bars. Target the shallowest spot on the structure — fish push up to feed.', priority: 8 },
      ],
    },

    // ─── Spinnerbait ───
    {
      lure: 'Spinnerbait (Colorado/Willow)',
      confidenceModifiers: [
        // Robertson: Wind activates the offshore spinnerbait bite
        { when: { windSpeed: { min: 10 } }, adjustment: 8 },
      ],
      colorRules: [
        // Robertson: White double willow for offshore
        { when: { season: 'summer' }, color: 'White', hex: '#f5f5f5', priority: 10 },
      ],
      tipRules: [
        { when: { windSpeed: { min: 10 } }, tip: 'Robertson: 1oz white double willow for offshore wind. Cast to windblown points and reel through the chop — the flash mimics disoriented shad.', priority: 12 },
        { when: { season: 'summer' }, tip: 'Robertson: Heavy spinnerbait is part of the offshore rotation. When fish scatter off the ledge, cover water with a 1oz double willow.', priority: 10 },
        { when: { season: 'fall' }, tip: 'Robertson: Fall spinnerbait on hard bottom points. White double willow matches the shad — burn it through wind-blown current.', priority: 8 },
      ],
      defaultTip: 'Robertson: 1oz white double willow is the offshore spinnerbait. Cast parallel to structure and reel through wind — heavy weight keeps it in the zone.',
    },

    // ─── Ned Rig ───
    {
      lure: 'Ned Rig',
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 10 },
      ],
      tipRules: [
        { when: { season: 'fall', fishDepth: { min: 15 } }, tip: 'Robertson: 1/4oz mushroom head on boulder bottom in 20ft+. Hop it slow through the rocks — fall smallmouth can\'t resist.', priority: 12 },
        { when: { waterClarity: 'clear' }, tip: 'Robertson: Green Pumpkin Ned rig in clear water on rock. Natural profile on a mushroom head — finesse when power baits get refused.', priority: 8 },
      ],
    },

    // ─── Neko Rig ───
    {
      lure: 'Neko Rig',
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 10 },
      ],
      tipRules: [
        { when: { season: 'fall', fishDepth: { min: 15 } }, tip: 'Robertson: Pair Neko rig with Ned targeting deep boulders. The nail weight keeps the worm nose-down — twitch and shake on the rocks.', priority: 12 },
        { when: { waterClarity: 'clear' }, tip: 'Robertson: Green Pumpkin Neko rig on clear-water boulders. Subtle nose-down action triggers bites when fish are finicky.', priority: 8 },
      ],
    },

    // ─── Walking Topwater ───
    {
      lure: 'Walking Topwater',
      colorRules: [
        { when: { season: 'fall' }, color: 'Sexy Shad', hex: '#b0c4de', priority: 10 },
        { when: { season: 'summer' }, color: 'Sexy Shad', hex: '#b0c4de', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'fall' }, tip: 'Robertson: Modified topwater with SuspenDots for slower action on fall pattern shifts. Work eelgrass edges where shad are staging.', priority: 12 },
        { when: { season: 'fall', timeOfDay: 'morning' }, tip: 'Robertson: Morning topwater over eelgrass flats after the shad spawn. Slow the walk with SuspenDots — let fish track it down.', priority: 11 },
        { when: { season: 'summer', timeOfDay: 'morning' }, tip: 'Robertson: Summer morning topwater over offshore flats. Target the shad spawn — work parallel to baitfish activity.', priority: 8 },
      ],
      defaultTip: 'Robertson: Modified walking bait with SuspenDots for a slower, more deliberate action. Sexy Shad pattern over eelgrass and baitfish areas.',
    },
  ],
  structureAdvice: {
    'point': 'Robertson: Follow the post-spawners off tapering points with a deep crank. Target the highest spot on the bar — sometimes just 3ft of water.',
    'flat': 'Robertson: Eelgrass flats hold baitfish. Work a topwater after the morning shad spawn, then transition to a crankbait as fish push deeper.',
    'creek-channel': 'Robertson: Where the creek channel meets a ditch intersection, cast at 45 degrees and grind a deep diver across the point.',
    'hump': 'Robertson: Offshore humps with hard bottom are gold. Rotate through swimbaits, deep cranks, and big spinnerbaits until you find what they want.',
    'ledge': 'Robertson: Ledge fishing is about the rotation — swimbait when they\'re grouped, deep crank when they scatter, big worm when they lock down.',
  },
};
