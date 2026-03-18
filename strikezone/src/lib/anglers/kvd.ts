// ─── Kevin VanDam (KVD): Crankbaits, Search Baits, All-Season Versatility ───
// Sources: kevinvandam.com, Bassmaster.com, MossyOak.com, Wired2Fish, BassPro 1source
import type { AnglerProfile } from './types';

export const KVD: AnglerProfile = {
  name: 'KVD',
  id: 'kvd',
  defaultCredibility: 0.5,
  credibility: {
    'Buzzbait': 0.7,
    'Bladed Jig': 0.9,
    'Crawfish Pattern Jig': 0.5,
    'Deep Diving Crankbait': 1.0,
    'Drop Shot': 0.9,
    'Lipless Crankbait': 0.95,
    'Medium Diving Crankbait': 1.0,
    'Ned Rig': 0.8,
    'Spinnerbait (Colorado/Willow)': 0.95,
    'Squarebill Crankbait': 1.0,
    'Suspending Jerkbait': 1.0,
    'Swim Jig': 0.7,
    'Walking Topwater': 0.8,
  },
  opinions: [
    // ─── Bladed Jig / Thunder Cricket ───
    {
      lure: 'Bladed Jig',
      // KVD: Thunder Cricket works in cold water as reaction bait — wider seasonal range
      seasonAdd: ['winter'],
      // KVD: Thunder Cricket triggers reaction bites even below Hackney's 55° threshold
      minTempOverride: 45,
      confidenceModifiers: [
        // KVD: warmer = higher base confidence (Hackney's 55°F rule still applies as a boost)
        { when: { waterTemp: { min: 55 } }, adjustment: 8 },
      ],
      tipRules: [
        { when: { waterTemp: { max: 55 } }, tip: 'KVD: Thunder Cricket triggers reaction bites in cold water. Keep bottom contact, change cadence often. Fish shallow first on windy days.', priority: 12 },
      ],
      defaultTip: 'Pop free from grass — erratic action triggers reaction strikes. KVD: Adjust rod angle to feel blade vibration without snagging.',
    },

    // ─── Squarebill Crankbait ───
    {
      lure: 'Squarebill Crankbait',
      // KVD: caught bass on squarebill in 38°F water — don't rule it out in cold
      minTempOverride: 42,
      confidenceModifiers: [
        // KVD: "Wind stirs everything up, makes it easier to trigger strikes"
        // (base already has wind modifiers, this reinforces)
      ],
      tipRules: [
        { when: { season: 'post-spawn' }, tip: 'Hackney: Target shad on hard bottom 5-8ft. KVD: Rod tip up = shallower, down = deeper. Deflect off everything.', priority: 10 },
      ],
      defaultTip: 'KVD: "The deflection triggers strikes." Rod tip down for max depth. 12-20lb fluoro — heavier for thicker cover.',
    },

    // ─── Medium Diving Crankbait ───
    {
      lure: 'Medium Diving Crankbait',
      tipRules: [],
      defaultTip: 'KVD: "Rip it out of weeds — that triggers bites." Pick a crank that runs 2ft deeper than target. 5.3:1 reel, 10-12lb fluoro, rod tip down.',
    },

    // ─── Deep Diving Crankbait ───
    {
      lure: 'Deep Diving Crankbait',
      tipRules: [],
      defaultTip: 'KVD: "Deep cranking outside weed edges is my absolute favorite." 6XD casts like a rocket. 14lb fluoro, 5.3:1 reel. Grind the bill into bottom.',
    },

    // ─── Lipless Crankbait ───
    {
      lure: 'Lipless Crankbait',
      tipRules: [
        { when: { season: 'pre-spawn' }, tip: 'KVD: "The FALL triggers bites, not the retrieve." Bump-and-flutter through grass — rip free, let it fall on semi-slack line. Won the \'10 Classic on this.', priority: 12 },
      ],
      defaultTip: 'KVD: "When the bait is falling, that\'s when I get bit." Yo-yo with rod sweeps, not the reel. 5.3:1 gear ratio, 17lb fluoro.',
    },

    // ─── Suspending Jerkbait ───
    {
      lure: 'Suspending Jerkbait',
      confidenceModifiers: [
        // KVD: suspending jerkbait is THE winter weapon if water clarity allows
        { when: { season: 'winter', waterClarity: ['clear', 'stained'] }, adjustment: 10 },
      ],
      tipRules: [
        { when: { frontalSystem: 'post-frontal' }, tip: 'KVD: "Jerkbaits get fish to bite in a negative mood." Post-frontal clear skies = jerkbait time. Longer pauses in cold.', priority: 12 },
        { when: { waterTemp: { max: 50 } }, tip: 'KVD: Pauses up to 1 MINUTE in cold water. Soft twitches. Fish won\'t go down — keep bait above or level. Check hook buoyancy in cold.', priority: 10 },
      ],
      defaultTip: 'KVD: Fish parallel to edges — "still efficient for covering water." Snap-snap-pause. Adjust pause length to water temp.',
    },

    // ─── Spinnerbait ───
    {
      lure: 'Spinnerbait (Colorado/Willow)',
      tipRules: [
        { when: { waterClarity: 'muddy' }, tip: 'KVD: Single Colorado in cold/muddy — max water displacement. Slow roll. Painted blade in very low light.', priority: 10 },
      ],
      defaultTip: 'KVD: "Wind is your friend" — fish the windblown bank. Willow leaf in clearer water. Tandem willow through grass = less lift, runs deeper.',
    },

    // ─── Drop Shot ───
    {
      lure: 'Drop Shot',
      tipRules: [
        { when: { frontalSystem: 'post-frontal' }, tip: 'KVD: "When the bite gets tough, refine your presentation." Drop shot as cleanup tool — Dream Shot or wacky-rigged Ocho for non-aggressive bass.', priority: 12 },
        { when: { season: 'winter' }, tip: 'KVD: "Cold water shrinks the strike zone to 1-2 feet." Vertical over deep schools. Tiny shakes — winter fish won\'t chase.', priority: 10 },
      ],
      defaultTip: 'KVD: Power finesse — 1/2oz tungsten deep, 1/8oz shallow. "Shake, don\'t swim." Keep bait in the strike zone.',
    },

    // ─── Ned Rig ───
    {
      lure: 'Ned Rig',
      tipRules: [
        { when: { waterTemp: { max: 50 } }, tip: 'KVD: Ned rig is "phenomenal when it gets really tough." Painfully slow on rock transitions — winter bass can\'t resist.', priority: 12 },
        { when: { frontalSystem: 'post-frontal' }, tip: 'KVD: "Ned Rig works everywhere — clear, stained, offshore, shallow breaks." Go-to when nothing else works post-frontal.', priority: 10 },
      ],
      defaultTip: 'KVD: Ned Ocho or Baby Z2 on Ned Head. Cast, sink, drag slowly. Mushroom head stands bait up on hard bottom.',
    },

    // ─── Walking Topwater ───
    {
      lure: 'Walking Topwater',
      tipRules: [
        { when: { season: 'post-spawn' }, tip: 'KVD: "Popper has tremendous drawing power during bluegill spawn/mayfly hatch." Walking bait for open water. 14-17lb mono.', priority: 10 },
      ],
      defaultTip: 'KVD: Walking bait for shad/herring spawns. Keep a weightless Senko ready for missed blowups. Walk-walk-pause.',
    },

    // ─── Buzzbait ───
    {
      lure: 'Buzzbait',
      tipRules: [
        { when: { waterClarity: 'clear' }, tip: 'KVD: "More subtle skirt color in clear water." 1/4oz size. Keep a weightless Senko ready for missed blowups.', priority: 8 },
      ],
    },

    // ─── Swim Jig ───
    {
      lure: 'Swim Jig',
      tipRules: [],
      defaultTip: 'KVD: Shake it along in the water up high. Rod tip elevated to keep bait in the upper strike zone through grass.',
    },

    // ─── Crawfish Pattern Jig ───
    {
      lure: 'Crawfish Pattern Jig',
      tipRules: [],
      defaultTip: 'Pre-spawn bass eat crawfish aggressively for spawning energy. KVD Chunk trailer in cold water, switch to Rage Craw above 65°F.',
    },
  ],
  structureAdvice: {
    'point': 'KVD: "Points are the interstate system for bass." Fan-cast a medium diver from shallow to deep — the crankbait tells you what depth they\'re using.',
    'bluff': 'KVD: Parallel a jerkbait tight to the bluff wall. Bass suspend at specific depths along vertical rock — cover the whole water column with long casts.',
    'grass': 'KVD: "Rip it out of the grass — that erratic action triggers reaction strikes." Lipless or squarebill through the tops, deep diver along the outside edge.',
    'flat': 'KVD: Flats are made for covering water fast. Lipless crankbait or bladed jig — keep moving until you find the active school, then pick them apart.',
    'dock': 'KVD: Squarebill deflecting off dock posts is deadly. Cast past the dock, crank it into the pilings — the deflection is what triggers the bite.',
    'creek-channel': 'KVD: Deep crank the channel swing where it bends closest to the bank. That inside turn concentrates fish — grind the bill right into the ledge.',
    'hump': 'KVD: Offshore humps are crankbait gold. Circle the hump with a deep diver, varying your cast angle until you find which side they\'re sitting on.',
    'riprap': 'KVD: "Riprap and crankbaits were made for each other." Squarebill parallel to the rocks — the deflection off chunk rock triggers violent reaction strikes.',
    'laydown': 'KVD: Squarebill or spinnerbait bumping through the branches. Don\'t try to avoid the wood — crash into it and let the bait deflect erratically.',
  },
};
