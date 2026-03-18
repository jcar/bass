// ─── Greg Hackney: Power Fishing, Flipping, Shallow Specialist ───
// Sources: Bassmaster.com, Wired2Fish, MossyOak.com, StrikeKing.com, AdvancedAngler.com
import type { AnglerProfile } from './types';

export const HACKNEY: AnglerProfile = {
  name: 'Hackney',
  id: 'hackney',
  defaultCredibility: 0.5,
  credibility: {
    '10" Worm (Shakey/TX)': 0.7,
    'Buzzbait': 0.9,
    'Bladed Jig': 0.81,
    'Crawfish Pattern Jig': 0.8,
    'Flipping Jig': 1.0,
    'Football Jig': 0.8,
    'Hair Jig / Finesse Jig': 0.8,
    'Lipless Crankbait': 0.8,
    'Spinnerbait (Colorado/Willow)': 0.83,
    'Squarebill Crankbait': 0.6,
    'Structure Jig': 0.9,
    'Swim Jig': 0.9,
    'Texas Rig (Creature Bait)': 0.9,
    'Walking Topwater': 0.6,
  },
  opinions: [
    // ─── Swim Jig ───
    {
      lure: 'Swim Jig',
      confidenceModifiers: [
        { when: { season: 'pre-spawn' }, adjustment: 10 },
        // Hackney: post-spawn shad spawn = swim jig time
        { when: { season: 'post-spawn' }, adjustment: 8 },
        // Hackney: cold front = fish tighten to cover, switch to flipping jig
        { when: { frontalSystem: 'post-frontal' }, adjustment: -15 },
        { when: { frontalSystem: 'pre-frontal' }, adjustment: 5 },
        // Hackney: afternoon is best in summer for swim jig
        { when: { season: 'summer', timeOfDay: 'afternoon' }, adjustment: 5 },
      ],
      colorRules: [
        // Hackney: targets "bream eaters" — avoids white. Black & blue in dirty/stained.
        { when: { waterClarity: 'muddy' }, color: 'Black & Blue', hex: '#1a1a2e', priority: 10 },
        { when: { isStained: true }, color: 'Black & Blue', hex: '#1a1a2e', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'pre-spawn' }, tip: 'Hackney: "Covering water and being efficient is key." KVD: 3/8oz default — controls depth and speed for most situations.', priority: 10 },
        { when: { season: 'post-spawn' }, tip: 'Hackney: Target shad spawn areas. KVD: Rage Craw trailer for stained grass, KVD Chunk for clear/sparse cover.', priority: 8 },
      ],
    },

    // ─── Structure Jig ───
    {
      lure: 'Structure Jig',
      confidenceModifiers: [
        // Hackney: pre-spawn 40s-50s water = jig time, bass eating crawfish aggressively
        { when: { season: 'pre-spawn', waterTemp: { min: 45 } }, adjustment: 15 },
        { when: { season: 'summer', fishDepth: { min: 12 } }, adjustment: 12 },
        // Hackney: winter below 55 = best big-fish jig days, cloudy/nasty preferred
        { when: { season: 'winter', isLowLight: true }, adjustment: 12 },
        { when: { season: 'winter', waterTemp: { max: 55 } }, adjustment: 8 },
        { when: { frontalSystem: 'post-frontal' }, adjustment: -8 },
      ],
      colorRules: [
        // Hackney: black & blue almost exclusively in winter
        { when: { season: 'winter' }, color: 'Black & Blue', hex: '#1a1a2e', priority: 12 },
        { when: { isStained: true }, color: 'PB&J', hex: '#4a2040', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'winter' }, tip: 'Hackney: Drag — don\'t hop — in cold water. Maintain bottom contact. Fish the same spot 4-5 times before moving.', priority: 12 },
        { when: { season: 'pre-spawn' }, tip: 'Hackney: Pre-spawn bass eat aggressively for crawfish energy. Hop along channel swings and secondary points.', priority: 10 },
      ],
    },

    // ─── Spinnerbait ───
    {
      lure: 'Spinnerbait (Colorado/Willow)',
      confidenceModifiers: [
        // Hackney: spinnerbait is THE post-spawn shad spawn bait
        { when: { season: 'post-spawn' }, adjustment: 12 },
        // Hackney: post-frontal = abandon moving baits
        { when: { frontalSystem: 'post-frontal' }, adjustment: -15 },
        { when: { frontalSystem: 'pre-frontal' }, adjustment: 5 },
      ],
      tipRules: [
        { when: { season: 'post-spawn' }, tip: 'Hackney: THE shad spawn bait. KVD: Medium-slow retrieve — too fast pulls it away from baitfish. Use trailer hooks.', priority: 12 },
        { when: { isStained: true }, tip: 'KVD: Colorado/Willow combo for stained — vibration + flash. Hackney: More weedless than bladed jig in wood and pads.', priority: 8 },
      ],
    },

    // ─── Bladed Jig ───
    {
      lure: 'Bladed Jig',
      confidenceModifiers: [
        // Hackney: post-frontal = abandon moving baits
        { when: { frontalSystem: 'post-frontal' }, adjustment: -12 },
        { when: { frontalSystem: 'pre-frontal' }, adjustment: 5 },
      ],
      tipRules: [
        { when: { season: 'pre-spawn' }, tip: 'Hackney: Rip through emerging grass on staging flats. KVD: "Blade vibration mimics fleeing shad — triggers instinctual strikes."', priority: 10 },
        { when: { waterClarity: 'clear' }, tip: 'Hackney: Painted blade in clear water — vibration without flash. KVD: Blade Minnow/Swimmer trailer for clean water.', priority: 8 },
      ],
    },

    // ─── Flipping Jig ───
    {
      lure: 'Flipping Jig',
      confidenceModifiers: [
        // Hackney: cold front = fish tighten to cover = flipping jig excels
        { when: { frontalSystem: 'post-frontal' }, adjustment: 8 },
        { when: { frontalSystem: 'cold-front' }, adjustment: 10 },
        // Hackney: post-spawn heavy jig (3/4oz) purposely hung in laydowns near fry
        { when: { season: 'post-spawn' }, adjustment: 8 },
      ],
      colorRules: [
        // Hackney: post-spawn use green pumpkin with orange/chartreuse accents (mimics bluegill)
        { when: { season: 'post-spawn' }, color: 'Green Pumpkin/Orange', hex: '#6b8e23', priority: 6 },
      ],
      tipRules: [
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, tip: 'Hackney: Cold front = fish lock to cover. Switch from moving baits to flipping jig. Pitch tight and be patient.', priority: 12 },
        { when: { season: 'post-spawn' }, tip: 'Hackney: Heavy 3/4oz jig — purposely hang it in laydown branches near fry. Green pumpkin w/ orange accent mimics bluegill.', priority: 10 },
      ],
      defaultTip: 'Hackney: "Accurate bait placement" is everything. Pitch tight to cover on semi-slack line. 55-60lb braid for heavy vegetation.',
    },

    // ─── Buzzbait ───
    {
      lure: 'Buzzbait',
      confidenceModifiers: [
        // Hackney: low barometric pressure = buzzbait time
        { when: { pressureTrend: 'falling' }, adjustment: 8 },
        { when: { frontalSystem: 'pre-frontal' }, adjustment: 8 },
        // Hackney: "The only time I don't fish a buzzbait is severe cold front"
        { when: { frontalSystem: 'post-frontal' }, adjustment: -18 },
        { when: { frontalSystem: 'cold-front' }, adjustment: -20 },
        // Hackney: fall buzzbait is prime
        { when: { season: 'fall' }, adjustment: 10 },
      ],
      colorRules: [
        // Hackney: black buzzbait + black frog most productive in fall
        { when: { season: 'fall' }, color: 'Black w/ Frog', hex: '#1a1a1a', priority: 12 },
        { when: { isStained: true }, color: 'Black w/ Frog', hex: '#1a1a1a', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'fall' }, tip: 'Hackney: Remove skirt, use frog trailer — better hookups, slower retrieve. Black + black frog in fall. KVD: "Don\'t overlook buzzbaits."', priority: 12 },
        { when: { pressureTrend: 'falling' }, tip: 'Hackney: Low pressure = long bubble trails = buzzbait time. KVD: Downsize to 1/8oz in bright/little wind conditions.', priority: 10 },
      ],
      defaultTip: 'Hackney: Frog trailer = slower retrieve than skirt. KVD: "When fish use shallow cover, buzzbait flushes them out."',
    },

    // ─── Lipless Crankbait ───
    {
      lure: 'Lipless Crankbait',
      confidenceModifiers: [
        // Hackney: lipless catches really big fish between 45 and 55 degrees
        { when: { waterTemp: { min: 45, max: 55 } }, adjustment: 18 },
        { when: { season: 'pre-spawn', waterTemp: { min: 55, max: 62 } }, adjustment: 8 },
        { when: { season: 'fall' }, adjustment: 10 },
        // Hackney: post-frontal use SILENT version — still viable but lower confidence
        { when: { frontalSystem: 'post-frontal' }, adjustment: -6 },
      ],
      colorRules: [
        // Hackney: Delta Craw #1 early season
        { when: { season: 'pre-spawn' }, color: 'Delta Craw', hex: '#8b4513', priority: 10 },
        { when: { waterTemp: { max: 58 } }, color: 'Delta Craw', hex: '#8b4513', priority: 9 },
      ],
      tipRules: [
        { when: { frontalSystem: 'post-frontal' }, tip: 'Hackney: Switch to silent version post-frontal. KVD: Slow down — people over-reel lipless cranks. Let it yo-yo on bottom.', priority: 10 },
        { when: { season: 'fall' }, tip: 'Hackney: Larger bass on perimeter/creek channels. KVD: "Bait needs to hit bottom every time." Long rod sweeps, not steady cranking.', priority: 8 },
      ],
    },

    // ─── Texas Rig ───
    {
      lure: 'Texas Rig (Creature Bait)',
      confidenceModifiers: [
        // Hackney: during spawn, TX-rigged creature outperforms jig on bedding fish
        { when: { season: 'spawn' }, adjustment: 15 },
      ],
      tipRules: [
        { when: { season: 'spawn' }, tip: 'Hackney: TX-rigged creature catches bedding bass better than a jig. Compact profile — pitch to visible beds and feel for hard-bottom fans.', priority: 12 },
        { when: { season: 'summer' }, tip: 'Hackney: Summer = shade or current. Pitch 1/4-3/8oz to stumps, laydowns, docks in extremely shallow water.', priority: 10 },
      ],
    },

    // ─── Football Jig ───
    {
      lure: 'Football Jig',
      tipRules: [
        { when: { season: 'summer' }, tip: 'Hackney: Summer bass seek current or shade. Schools on hard spots and shell beds in 12-20ft — fire them up and catch every cast.', priority: 10 },
      ],
      defaultTip: 'Hackney: Football head kicks off rocks for erratic action. Drag on bottom transitions — rock-to-mud edges hold fish.',
    },

    // ─── Hair Jig ───
    {
      lure: 'Hair Jig / Finesse Jig',
      tipRules: [
        { when: { season: 'winter' }, tip: 'Hackney: Best jig days are Dec-Feb on cloudy, nasty days. Position over deep water, pitch shallow. Fish don\'t cross flats in cold — they move vertically.', priority: 10 },
      ],
    },

    // ─── Squarebill ───
    {
      lure: 'Squarebill Crankbait',
      tipRules: [
        { when: { season: 'post-spawn' }, tip: 'Hackney: Target shad on hard bottom 5-8ft. KVD: Rod tip up = shallower, down = deeper. Deflect off everything.', priority: 10 },
      ],
    },

    // ─── Walking Topwater ───
    {
      lure: 'Walking Topwater',
      tipRules: [
        { when: { season: 'fall' }, tip: 'Hackney: Jr. size early fall, upsize later. KVD: Walking bait covers water fast over grass flats and rocky points. Long casts with mono.', priority: 10 },
      ],
    },

    // ─── 10" Worm ───
    {
      lure: '10" Worm (Shakey/TX)',
      tipRules: [
        { when: { season: 'summer' }, tip: 'Hackney: Summer deep brushpiles 18-25ft with a big worm. The size triggers bites from fish ignoring finesse presentations.', priority: 10 },
      ],
    },
  ],
  structureAdvice: {
    'point': 'Hackney: Secondary points inside creek arms hold the biggest fish. Flip a jig to every piece of isolated cover on the point before moving on.',
    'bluff': 'Hackney: Pitch a jig tight to the bluff where rock meets water. Bass wedge into crevices — drop your bait right on their head with accurate placement.',
    'grass': 'Hackney: "Thick grass is where the big ones live." Punch a heavy jig or Texas rig through the mat — 1oz weight, 65lb braid, straight to the bottom.',
    'flat': 'Hackney: Flats seem empty but scattered stumps or shell beds hold fish. Flip every piece of isolated cover — one stump on a flat can hold a giant.',
    'dock': 'Hackney: Docks are my bread and butter. Pitch a jig to every post, cross-brace, and cable — skip it under the walkway where nobody else can reach.',
    'creek-channel': 'Hackney: Where the creek channel swings against a bank with laydowns, that\'s a highway interchange for bass. Flip every branch on that channel-side bank.',
    'hump': 'Hackney: Offshore humps with stumps or brush on top — flip a football jig or structure jig to each piece of cover. Drag it across the top and down the sides.',
    'riprap': 'Hackney: Riprap in spring is all about crawfish. Pitch a jig tight to the rocks and drag it slow — bass are pinned to that rock waiting for an easy meal.',
    'laydown': 'Hackney: Laydowns are made for flipping. Work the jig from the trunk out to every major branch. The biggest fish sit in the thickest part of the canopy.',
  },
};
