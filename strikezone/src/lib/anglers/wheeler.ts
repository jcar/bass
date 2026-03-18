// ─── Jacob Wheeler: Versatile Generalist, Moving Baits, Electronics Master ───
// Sources: WesternBass.com, Wired2Fish, Game & Fish, MLF, Bassmaster, BassBlaster
import type { AnglerProfile } from './types';

export const WHEELER: AnglerProfile = {
  name: 'Wheeler',
  id: 'wheeler',
  defaultCredibility: 0.5,
  credibility: {
    'Buzzbait': 0.8,
    'Carolina Rig': 0.6,
    'Bladed Jig': 0.7,
    'Deep Diving Crankbait': 0.8,
    'Drop Shot': 0.83,
    'Flipping Jig': 0.7,
    'Football Jig': 0.8,
    'Lipless Crankbait': 0.9,
    'Medium Diving Crankbait': 0.9,
    'Ned Rig': 0.73,
    'Spinnerbait (Colorado/Willow)': 0.7,
    'Squarebill Crankbait': 0.9,
    'Suspending Jerkbait': 0.9,
    'Swim Jig': 1.0,
    'Texas Rig (Creature Bait)': 0.78,
    'Walking Topwater': 0.78,
  },
  opinions: [
    // ─── Squarebill Crankbait ───
    {
      lure: 'Squarebill Crankbait',
      confidenceModifiers: [
        // Wheeler: spring most fish 6ft or shallower — prime squarebill zone
        { when: { season: 'pre-spawn' }, adjustment: 8 },
        // Wheeler: cranking lets you fish quickly and cover ground in fall
        { when: { season: 'fall' }, adjustment: 6 },
        // Wheeler: stained water 3-5ft = squarebill territory
        { when: { isStained: true }, adjustment: 5 },
      ],
      colorRules: [
        // Wheeler: stained/current = Parrot or Ike's Caribbean Shad
        { when: { isStained: true }, color: 'Parrot', hex: '#4a8e3c', priority: 9 },
        // Wheeler: clear = Live River Shad
        { when: { waterClarity: 'clear' }, color: 'Live River Shad', hex: '#b5c4b1', priority: 7 },
      ],
      tipRules: [
        { when: { isStained: true }, tip: 'Wheeler: Squarebill = "the four-wheeler of the crankbait world." Bang it into stumps, rocks, anything — deflection triggers strikes.', priority: 10 },
        { when: { season: 'fall' }, tip: 'Wheeler: Flat-sided crankbait around rocky banks in fall. Match the hatch — fish are keying on threadfin shad.', priority: 8 },
      ],
      defaultTip: 'Wheeler: "Most universal" shallow crank. Adjust line size: 12lb fluoro standard, 15-20lb mono for shallow buoyancy over laydowns.',
    },

    // ─── Medium Diving Crankbait ───
    {
      lure: 'Medium Diving Crankbait',
      confidenceModifiers: [
        // Wheeler: DT-6 works mid-40s through fall, all water types
        { when: { season: ['pre-spawn', 'fall'] }, adjustment: 6 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'Helsinki Shad', hex: '#c0d6e4', priority: 8 },
        { when: { isStained: true }, color: 'Parrot', hex: '#4a8e3c', priority: 8 },
      ],
      tipRules: [
        { when: { waterClarity: 'clear' }, tip: 'Wheeler: Flat-sided baits (OG Tiny, DT-6) in clearer/cooler water. Line controls depth — 8lb to go deeper, 15lb for shallow.', priority: 9 },
      ],
      defaultTip: 'Wheeler: DT-6 is "the most universal crankbait." Move boat closer/farther following bank contour so bait contacts bottom.',
    },

    // ─── Deep Diving Crankbait ───
    {
      lure: 'Deep Diving Crankbait',
      confidenceModifiers: [
        // Wheeler: wind creates current on ledges — offshore crank fires
        { when: { windSpeed: { min: 8 } }, adjustment: 6 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Wheeler: Start with loudest/most aggressive bait on offshore schools, work down to subtle. DT-20 on ledges with current.', priority: 9 },
      ],
      defaultTip: 'Wheeler: 12lb fluoro standard for deep cranks. Go to 8lb to reach max depth. Grind the bill into bottom structure.',
    },

    // ─── Lipless Crankbait ───
    {
      lure: 'Lipless Crankbait',
      confidenceModifiers: [
        // Wheeler: lipless catches them 1-25ft in cold water, 45-48°F range still productive
        { when: { waterTemp: { min: 45, max: 55 } }, adjustment: 12 },
        // Wheeler: "works great when water is clear, fish are pressured"
        { when: { waterClarity: 'clear' }, adjustment: 6 },
        // Wheeler: lipless on shallow flats in spring
        { when: { season: 'pre-spawn', fishDepth: { max: 8 } }, adjustment: 8 },
      ],
      tipRules: [
        { when: { waterTemp: { max: 48 } }, tip: 'Wheeler: Cold water lipless = vertical jigging style. Rip up and let fall. "Catches them 1ft to 25ft when water is cold."', priority: 12 },
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, tip: 'Wheeler: Arashi Vibe = "Shad Rap of lipless cranks" — tighter wiggle, subtler. Short pops, not aggressive rips. Slack-line fall for pressured fish.', priority: 10 },
      ],
      defaultTip: 'Wheeler: 3 retrieves — modified short pops, reel-reel-reel + slack fall, standard yo-yo. Match retrieve to fish mood.',
    },

    // ─── Suspending Jerkbait ───
    {
      lure: 'Suspending Jerkbait',
      confidenceModifiers: [
        // Wheeler: best winter bait, catches bass as deep as 15-20ft
        { when: { season: 'winter' }, adjustment: 12 },
        // Wheeler: works on suspended prespawn fish staging to move up
        { when: { season: 'pre-spawn' }, adjustment: 8 },
      ],
      colorRules: [
        // Wheeler: 3 color types — painted white (shad), translucent, flashy
        { when: { waterClarity: 'clear' }, color: 'Translucent Shad', hex: '#d0dce4', priority: 8 },
        { when: { isStained: true }, color: 'Painted White Shad', hex: '#e8e8e8', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'winter' }, tip: 'Wheeler: Jerk-jerk-jerk-PAUSE(4-5sec)-jerk-jerk, then 3sec before next cadence. Colder = slower. Long pauses give deep fish time to rise.', priority: 12 },
        { when: { season: 'pre-spawn' }, tip: 'Wheeler: Jerkbait on suspended prespawn bass staging to move up. Target bluff ends and transitional banks near creek channels.', priority: 10 },
      ],
      defaultTip: 'Wheeler: Shadow Rap Deep for the shimmy during pause. 12lb fluoro. Speed up cadence once fish approaches on forward-facing sonar.',
    },

    // ─── Buzzbait ───
    {
      lure: 'Buzzbait',
      // Wheeler: throws when water exceeds 55°F (some say 50-55°F)
      minTempOverride: 55,
      confidenceModifiers: [
        // Wheeler: skips under docks — reaction strike tool, fishes midday too
        { when: { season: ['post-spawn', 'summer', 'fall'] }, adjustment: 6 },
      ],
      colorRules: [
        // Wheeler: white or blue glimmer, 5/16oz Game Changer
        { when: {}, color: 'White', hex: '#f0f0f0', priority: 4 },
      ],
      tipRules: [
        { when: { season: 'fall' }, tip: 'Wheeler: No skirt — just soft plastic toad. Skip around docks, logs, bushes. "Be very efficient as you cover water." 17-20lb mono.', priority: 10 },
      ],
      defaultTip: 'Wheeler: Buzzbait isn\'t just a low-light bait — skip under docks midday for reaction bites. No skirt, just a toad trailer. Larger blade = slower retrieve.',
    },

    // ─── Spinnerbait ───
    {
      lure: 'Spinnerbait (Colorado/Willow)',
      confidenceModifiers: [
        // Wheeler: heavy 3/4oz in wind — easier to cast, feel bites
        { when: { windSpeed: { min: 10 } }, adjustment: 10 },
        // Wheeler: windy conditions = some of his best fishing days
        { when: { windSpeed: { min: 5, max: 10 } }, adjustment: 5 },
      ],
      tipRules: [
        { when: { windSpeed: { min: 10 } }, tip: 'Wheeler: Heavy 3/4oz spinnerbait in wind — easier to cast, blade resistance lets you feel bites. "Windy conditions produce many of my best days."', priority: 12 },
      ],
      defaultTip: 'Wheeler: Wheel\'s Deal (big willow blades) for flash or Spring Ding (orange kicker + gold Indiana) for thump. Match blade geometry to conditions.',
    },

    // ─── Bladed Jig ───
    {
      lure: 'Bladed Jig',
      confidenceModifiers: [
        // Wheeler: bladed jig as search tool in stained water
        { when: { isStained: true }, adjustment: 5 },
      ],
      colorRules: [
        // Wheeler: Black/Blue stained, Green Pumpkin for bluegill, Shad for clear
        { when: { isStained: true }, color: 'Black & Blue', hex: '#1a1a2e', priority: 7 },
        { when: { waterClarity: 'clear' }, color: 'Shad Pattern', hex: '#a8b5c2', priority: 7 },
      ],
      tipRules: [
        { when: { isStained: true }, tip: 'Wheeler: Minnow-profile trailer for natural hunting action. Black & Blue in stained. 17lb fluoro, longer MH rod with slow taper.', priority: 8 },
      ],
      defaultTip: 'Wheeler: Trailer selection makes or breaks success — minnow profile adds realism without impeding blade action. Match trailer color to clarity.',
    },

    // ─── Walking Topwater ───
    {
      lure: 'Walking Topwater',
      confidenceModifiers: [
        // Wheeler: early fall, smaller walking bait to match young shad
        { when: { season: 'fall' }, adjustment: 8 },
      ],
      tipRules: [
        { when: { season: 'fall' }, tip: 'Wheeler: Smaller walking bait (#8 size) to match 2-3" young shad. Constant steady retrieve with twitching. Keep working it after misses — don\'t kill the bait.', priority: 10 },
        { when: { season: 'post-spawn' }, tip: 'Wheeler: X-Rap Prop in Yellow Perch (orange throat like bluegill). 17lb Sufix Pro Mix mono — stretch prevents pulling bait from mouth.', priority: 8 },
      ],
      defaultTip: 'Wheeler: Topwater lets you fish fast around cover or open water. Frog in low 60s water near beds (looks like bluegill).',
    },

    // ─── Football Jig ───
    {
      lure: 'Football Jig',
      confidenceModifiers: [
        // Wheeler: football jig on offshore structure, drag slowly
        { when: { season: 'summer', fishDepth: { min: 12 } }, adjustment: 8 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Wheeler: "Nine times out of 10 the bite comes when the bait pops off a rock." Drag slowly — feel every rock and boulder. Start aggressive, work down to subtle.', priority: 10 },
      ],
      defaultTip: 'Wheeler: 4 jig colors cover everything — Sooner Magic, Green Pumpkin, White, Blue/Black. "Bass will always eat one of those four."',
    },

    // ─── Flipping Jig ───
    {
      lure: 'Flipping Jig',
      confidenceModifiers: [
        // Wheeler: prespawn and spawn = best flipping times
        { when: { season: ['pre-spawn', 'spawn'] }, adjustment: 6 },
      ],
      tipRules: [
        { when: { season: 'pre-spawn' }, tip: 'Wheeler: Flip channel banks with laydowns during prespawn. "Precise delivery, subtle splash, slack line fall." Multiple angles unlock more bites.', priority: 10 },
        { when: { season: 'spawn' }, tip: 'Wheeler: Flip to visible beds in pockets with bushes. Also try a weedless swimbait skipped into grass lanes — bass rarely see it.', priority: 8 },
      ],
      defaultTip: 'Wheeler: Different casting angles often produce different results. Approach cover from multiple directions before moving on.',
    },

    // ─── Swim Jig ───
    {
      lure: 'Swim Jig',
      tipRules: [
        { when: { season: 'summer' }, tip: 'Wheeler: Keitech 4.3" Fat Swing Impact or Menace Grub trailer — incredible action draws fish in. Fish through grass lanes and laydowns.', priority: 8 },
      ],
      defaultTip: 'Wheeler: Paddle tail swimbait on weedless jig head for grass. Skip into pockets and lanes. Stop mid-cast and let fall for +20-30% more bites.',
    },

    // ─── Texas Rig ───
    {
      lure: 'Texas Rig (Creature Bait)',
      confidenceModifiers: [
        // Wheeler: Biffle Bug is incredibly versatile — TX rig, flip, tube-style, jig trailer
        { when: { season: 'spawn' }, adjustment: 8 },
      ],
      tipRules: [
        { when: { season: 'spawn' }, tip: 'Wheeler: Biffle Bug on 1/2oz weight for flipping to beds. Remove swimming legs for tube-style sight fishing presentation.', priority: 8 },
      ],
      defaultTip: 'Wheeler: Green pumpkin Biffle Bug covers most situations. TX-rig, flip, swim, or use as jig trailer — one bait, many applications.',
    },

    // ─── Drop Shot ───
    {
      lure: 'Drop Shot',
      tipRules: [
        { when: { season: 'summer', fishDepth: { min: 15 } }, tip: 'Wheeler: TX-rigged drop shot for brush/timber — nose-hook hangs up more. Braid mainline to heavier fluoro leader.', priority: 8 },
      ],
      defaultTip: 'Wheeler: Hook sizing matters — #2 for 4" plastics, #1 for 5", 1/0 for 6"+. Sometimes finesse is the name of the game.',
    },

    // ─── Ned Rig ───
    {
      lure: 'Ned Rig',
      confidenceModifiers: [
        // Wheeler: prespawn ned rig is a key tool
        { when: { season: 'pre-spawn' }, adjustment: 5 },
      ],
      tipRules: [
        { when: { season: 'pre-spawn' }, tip: 'Wheeler: 3/16oz ned with 3" stick bait for prespawn. Chartreuse jig head in stained water for visual edge.', priority: 8 },
        { when: { isStained: true }, tip: 'Wheeler: Chartreuse jig head in stained water gives the bait a visual edge. Classic exposed jighead or swing head for snaggy cover.', priority: 6 },
      ],
      defaultTip: 'Wheeler: 4 ned rig techniques — classic exposed jighead, drop shot ned, TX-rigged swing head, wacky drop shot. Match to cover type.',
    },

    // ─── Carolina Rig ───
    {
      lure: 'Carolina Rig',
      confidenceModifiers: [
        // Wheeler: believes C-rig deserves a comeback, offshore staple
        { when: { season: 'summer', fishDepth: { min: 12 } }, adjustment: 6 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Wheeler: C-rig deserves a comeback. Clean-up bait = super-sized shaky head (1/2-3/4oz Rugby Head + 8" worm) on offshore structure.', priority: 8 },
      ],
      defaultTip: 'Wheeler: When first approaching offshore spots, start with loudest bait and work down to subtle. C-rig is a finesse cleanup option.',
    },
  ],
  structureAdvice: {
    'point': 'Wheeler: Scan the point with forward-facing sonar before your first cast. Start with a crankbait to cover water, then slow down to a football jig if fish are hugging bottom.',
    'bluff': 'Wheeler: Electronics show you exactly where fish suspend along bluff walls. Jerkbait at the depth they\'re sitting — adjust your line size to control running depth precisely.',
    'grass': 'Wheeler: Use your mapping to find irregular edges in the grass line — pockets, points, and indentations. Those irregularities concentrate fish and make your cast count.',
    'flat': 'Wheeler: Scan expansive flats for subtle bottom composition changes on your graph. A small shell bed or gravel patch on an otherwise featureless flat is a fish magnet.',
    'dock': 'Wheeler: Skip a buzzbait under docks for reaction strikes midday. Most anglers only flip docks — a buzzbait skipped underneath is something those fish rarely see.',
    'creek-channel': 'Wheeler: Mark the channel edges on your graph and target where bait schools stack on the ledge. Start aggressive with a deep crank, work down to a ned rig.',
    'hump': 'Wheeler: Circle the hump with your electronics and mark fish positions before casting. Approach from the upwind side and work every contour change systematically.',
    'riprap': 'Wheeler: Match your crankbait running depth to the base of the riprap. Parallel casts let the bait stay in the strike zone longest — adjust with line size.',
    'laydown': 'Wheeler: Multiple casting angles unlock more bites on laydowns. Work the shady side first, then hit it from the opposite bank — different angles trigger different fish.',
  },
};
