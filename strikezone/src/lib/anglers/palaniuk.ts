// ─── Brandon Palaniuk: Deep Finesse, Forward-Facing Sonar, Current Specialist ───
// Sources: Bassmaster, Wired2Fish, FLW/MLF, BassFan, Major League Lessons, Z-Man/Evergreen
import type { AnglerProfile } from './types';

export const PALANIUK: AnglerProfile = {
  name: 'Palaniuk',
  id: 'palaniuk',
  defaultCredibility: 0.4,
  credibility: {
    'Drop Shot': 0.95,
    'Ned Rig': 0.85,
    'Suspending Jerkbait': 0.85,
    'Spy Bait': 0.8,
    'Blade Bait': 0.7,
    'Jigging Spoon': 0.75,
    'Carolina Rig': 0.7,
    'Football Jig': 0.7,
    'Deep Diving Crankbait': 0.6,
    'Lipless Crankbait': 0.6,
    'Shakyhead': 0.7,
    'Swim Jig': 0.5,
  },
  opinions: [
    // ─── Drop Shot — His signature technique, deep and shallow ───
    {
      lure: 'Drop Shot',
      confidenceModifiers: [
        // Palaniuk: drop shot is his go-to when fish won't commit — any season
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 15 },
        // Palaniuk: deep drop shot on current breaks in summer is elite
        { when: { season: 'summer', fishDepth: { min: 15 } }, adjustment: 12 },
        // Palaniuk: winter deep finesse — vertical drop shot
        { when: { season: 'winter', waterTemp: { max: 48 } }, adjustment: 10 },
        // Palaniuk: pressured fish in clear water eat a drop shot when they won't eat anything else
        { when: { waterClarity: 'clear', pressureTrend: 'rising' }, adjustment: 8 },
        // Palaniuk: spotted bass specialist — drop shot is the tool
        { when: { season: ['summer', 'fall'], fishDepth: { min: 20 } }, adjustment: 8 },
        // Palaniuk: shallow drop shot is underrated — skips under docks
        { when: { season: ['spawn', 'post-spawn'], fishDepth: { max: 8 } }, adjustment: 5 },
      ],
      maxFishDepthOverride: 50, // Palaniuk fishes drop shots deeper than most
      colorRules: [
        // Palaniuk: morning dawn/natural in clear water
        { when: { waterClarity: 'clear' }, color: 'Morning Dawn', hex: '#e8c8c0', priority: 10 },
        // Palaniuk: green pumpkin is his #1 all-around
        { when: {}, color: 'Green Pumpkin', hex: '#5a6e3a', priority: 7 },
        // Palaniuk: bold colors in stained — black/blue, PB&J
        { when: { isStained: true }, color: 'PB&J', hex: '#8b5e3c', priority: 9 },
      ],
      tipRules: [
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, tip: 'Palaniuk: Post-frontal = drop shot time. Nose-hook a finesse worm, 6-8" leader, minimal movement. "Let the bait do the work — just shake it in place."', priority: 12 },
        { when: { season: 'summer', fishDepth: { min: 15 } }, tip: 'Palaniuk: Deep drop shot on current breaks — position upstream, let the sinker hold bottom while the bait drifts naturally. Forward-facing sonar to watch fish approach.', priority: 11 },
        { when: { season: 'winter' }, tip: 'Palaniuk: Vertical drop shot in winter — 1/2oz tungsten, 12" leader, dead-stick it. "Colder the water, less you move it." Electronics first, presentation second.', priority: 10 },
        { when: { waterClarity: 'clear' }, tip: 'Palaniuk: Clear water drop shot — light line (6-8lb fluoro), longer leader (18-24"), and the most natural bait you\'ve got. Distance matters — long casts.', priority: 9 },
      ],
      defaultTip: 'Palaniuk: "Drop shot catches them when nothing else will." Nose-hook for natural action, through-hook for heavy cover. Match leader length to fish position off bottom.',
    },

    // ─── Ned Rig — Deep finesse complement to drop shot ───
    {
      lure: 'Ned Rig',
      confidenceModifiers: [
        // Palaniuk: ned rig on offshore structure — unconventional but deadly
        { when: { season: 'summer', fishDepth: { min: 10 } }, adjustment: 10 },
        // Palaniuk: ned as a cleanup bait after moving baits
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 8 },
        // Palaniuk: smallmouth love the ned rig year-round
        { when: { waterClarity: 'clear' }, adjustment: 6 },
        // Palaniuk: pre-spawn staging areas — ned on channel swings
        { when: { season: 'pre-spawn' }, adjustment: 5 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'TRD Green Pumpkin', hex: '#5a6e3a', priority: 9 },
        { when: { isStained: true }, color: 'TRD PB&J', hex: '#8b5e3c', priority: 9 },
        { when: { season: 'winter' }, color: 'TRD Smokin Rooster', hex: '#6b4e3d', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'summer', fishDepth: { min: 10 } }, tip: 'Palaniuk: Deep ned rig is a sleeper — 1/3oz mushroom head, drag it on offshore ledges and humps. Bass see jigs and drop shots all day but rarely see a ned at 20ft.', priority: 11 },
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, tip: 'Palaniuk: Post-frontal ned rig — "the ultimate bail-out bait." Drag it painfully slow on a spinning rod. Light braid to fluoro leader.', priority: 10 },
      ],
      defaultTip: 'Palaniuk: Ned rig isn\'t just a shallow bait. Fish it deep on offshore structure where bass haven\'t seen it. 1/5-1/3oz head depending on depth and current.',
    },

    // ─── Suspending Jerkbait — Cold water prowess ───
    {
      lure: 'Suspending Jerkbait',
      confidenceModifiers: [
        // Palaniuk: jerkbait dominance in clear cold water
        { when: { season: 'winter', waterClarity: 'clear' }, adjustment: 12 },
        // Palaniuk: prespawn jerkbait on bluff ends and transition banks
        { when: { season: 'pre-spawn', waterTemp: { min: 45, max: 55 } }, adjustment: 10 },
        // Palaniuk: rising pressure + clear = jerkbait excels
        { when: { pressureTrend: 'rising', waterClarity: 'clear' }, adjustment: 6 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear', isLowLight: true }, color: 'Ghost Minnow', hex: '#d8e4e8', priority: 10 },
        { when: { waterClarity: 'clear' }, color: 'Sexy Shad', hex: '#b8c4cc', priority: 9 },
        { when: { isStained: true }, color: 'Chartreuse Shad', hex: '#c4d84c', priority: 9 },
      ],
      tipRules: [
        { when: { season: 'winter', waterTemp: { max: 45 } }, tip: 'Palaniuk: Sub-45° jerkbait — pause 10-15 seconds between cadences. "The colder it gets, the longer I pause." Fish are looking up but won\'t chase far.', priority: 12 },
        { when: { season: 'pre-spawn' }, tip: 'Palaniuk: Jerkbait on transitional banks where channel swings close to shore. Prespawn bass stage there and look up for easy meals. Erratic cadence — jerk-jerk-pause-twitch.', priority: 10 },
      ],
      defaultTip: 'Palaniuk: Match jerkbait depth to fish depth — have shallow, mid, and deep runners rigged. Line size controls depth as much as lip design. 8lb = max depth, 12lb = shallower.',
    },

    // ─── Spy Bait — Pressured/clear water finesse ───
    {
      lure: 'Spy Bait',
      confidenceModifiers: [
        // Palaniuk: spy bait for suspended fish in clear water
        { when: { waterClarity: 'clear', fishDepth: { min: 8, max: 25 } }, adjustment: 10 },
        // Palaniuk: post-frontal when fish suspend and won't feed
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 8 },
        // Palaniuk: spotted bass suspend — spy bait is the answer
        { when: { season: ['summer', 'fall'] }, adjustment: 5 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'Wakasagi', hex: '#c8d4dc', priority: 10 },
        { when: { isLowLight: true }, color: 'Bone', hex: '#e8e0d0', priority: 8 },
      ],
      tipRules: [
        { when: { waterClarity: 'clear' }, tip: 'Palaniuk: Spy bait on 8lb fluoro, straight slow retrieve — count it down to the target depth. "It\'s not about working the bait, it\'s about getting it in front of them." Long casts mandatory.', priority: 11 },
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, tip: 'Palaniuk: Post-frontal suspended fish — spy bait on the slowest retrieve you can manage. They won\'t chase but they\'ll eat something that drifts right past their face.', priority: 10 },
      ],
      defaultTip: 'Palaniuk: Spy bait is a confidence bait for pressured clear-water fish. Super slow retrieve, long fluorocarbon casts, and patience. Most anglers retrieve too fast.',
    },

    // ─── Blade Bait — Winter vertical specialist ───
    {
      lure: 'Blade Bait',
      confidenceModifiers: [
        // Palaniuk: winter blade bait on deep structure
        { when: { season: 'winter', waterTemp: { max: 48 } }, adjustment: 10 },
        // Palaniuk: blade bait on current — river ledges
        { when: { season: ['fall', 'winter'], fishDepth: { min: 15 } }, adjustment: 8 },
        // Palaniuk: works in stained water where spy bait won't
        { when: { waterClarity: ['stained', 'muddy'] }, adjustment: 5 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'Silver', hex: '#c0c8cc', priority: 8 },
        { when: { isStained: true }, color: 'Gold', hex: '#c4a84c', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'winter', waterTemp: { max: 45 } }, tip: 'Palaniuk: Blade bait in sub-45° water — snap-jigging 6-12" off bottom. "Lift, let it fall on a semi-slack line, feel the thump." Fish are lethargic but will eat vibration.', priority: 11 },
        { when: { waterClarity: ['stained', 'muddy'] }, tip: 'Palaniuk: Blade bait in stained water where spy bait visibility fails. Vibration carries further than flash. Slow snap-and-fall, not aggressive rips.', priority: 9 },
      ],
      defaultTip: 'Palaniuk: Blade bait is a winter/cold water staple. 3/8-1/2oz, snap up 6-12", let it fall on semi-slack line. Most bites on the fall — stay in contact.',
    },

    // ─── Jigging Spoon — Deep offshore vertical ───
    {
      lure: 'Jigging Spoon',
      confidenceModifiers: [
        // Palaniuk: jigging spoon on deep schools — summer and winter
        { when: { season: 'summer', fishDepth: { min: 20 } }, adjustment: 10 },
        { when: { season: 'winter', fishDepth: { min: 20 } }, adjustment: 10 },
        // Palaniuk: spoon when fish are stacked tight on humps
        { when: { season: 'fall', fishDepth: { min: 15 } }, adjustment: 6 },
      ],
      colorRules: [
        { when: {}, color: 'Chrome', hex: '#d0d4d8', priority: 8 },
        { when: { isStained: true }, color: 'Gold', hex: '#c4a84c', priority: 7 },
      ],
      tipRules: [
        { when: { season: 'summer', fishDepth: { min: 20 } }, tip: 'Palaniuk: Jigging spoon over schooling fish on humps — rip it up 3-4ft, let it flutter back. "When they\'re stacked 20-30ft deep and won\'t eat a crank, the spoon gets them."', priority: 11 },
        { when: { season: 'winter' }, tip: 'Palaniuk: Winter spoon on main lake humps — find them on electronics first. Shorter lifts (12-18"), slower fall. Stinger hook is mandatory — short strikers in cold water.', priority: 10 },
      ],
      defaultTip: 'Palaniuk: Jigging spoon for deep schooling fish. Electronics-driven — find the school, position directly over them, vertical presentation. Add a stinger hook for short strikers.',
    },

    // ─── Carolina Rig — Deep structure search tool ───
    {
      lure: 'Carolina Rig',
      confidenceModifiers: [
        // Palaniuk: C-rig to locate fish on offshore flats
        { when: { season: 'summer', fishDepth: { min: 10 } }, adjustment: 8 },
        // Palaniuk: post-spawn transition — fish leaving beds for offshore
        { when: { season: 'post-spawn' }, adjustment: 6 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'Watermelon Red', hex: '#5e7e48', priority: 8 },
        { when: { isStained: true }, color: 'Junebug', hex: '#3a2050', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Palaniuk: C-rig as a search tool on expansive flats — covers more water than a drop shot. 3/4oz weight, 3ft leader, French fry style lizard. Feel for bottom composition changes.', priority: 9 },
        { when: { season: 'post-spawn' }, tip: 'Palaniuk: Post-spawn C-rig on the first offshore break from spawning flats. Fish are transitioning and feeding — C-rig lets you cover the transition zone efficiently.', priority: 8 },
      ],
      defaultTip: 'Palaniuk: Carolina rig covers water and finds fish on featureless flats. "When you feel the weight go from gravel to mud, that\'s where they live." Read bottom with your sinker.',
    },

    // ─── Football Jig — Offshore bottom contact ───
    {
      lure: 'Football Jig',
      confidenceModifiers: [
        // Palaniuk: football jig on rock — summer ledge fishing
        { when: { season: 'summer', fishDepth: { min: 12 } }, adjustment: 8 },
        // Palaniuk: fall transition — fish following shad to main lake points
        { when: { season: 'fall', fishDepth: { min: 10 } }, adjustment: 6 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'PB&J', hex: '#8b5e3c', priority: 8 },
        { when: { isStained: true }, color: 'Black & Blue', hex: '#1a1a2e', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Palaniuk: Football jig on rock transitions — drag it until you feel the change from chunk rock to pea gravel. That seam is the strike zone. Craw trailer, let it soak 2-3 seconds on the rocks.', priority: 10 },
      ],
      defaultTip: 'Palaniuk: Football jig for offshore rock. "The bite is in the rocks — feel every bump." 3/4oz in deeper water, 1/2oz shallower. PB&J mimics crawfish on rock.',
    },

    // ─── Lipless Crankbait — Grass and current ───
    {
      lure: 'Lipless Crankbait',
      confidenceModifiers: [
        // Palaniuk: lipless over grass tops in spring
        { when: { season: 'pre-spawn', fishDepth: { max: 8 } }, adjustment: 8 },
        // Palaniuk: rip-and-fall in current situations
        { when: { windSpeed: { min: 10 } }, adjustment: 5 },
      ],
      tipRules: [
        { when: { season: 'pre-spawn' }, tip: 'Palaniuk: Lipless over grass tops in 3-6ft — let it fall into the grass, rip it free. "The strike comes within one second of the rip." Gold or red crawfish pattern.', priority: 10 },
      ],
      defaultTip: 'Palaniuk: Lipless is a year-round search bait. Yo-yo retrieve in cold water, steady crank in warm, rip through grass in spring. Match rattle intensity to pressure.',
    },

    // ─── Shakyhead — Finesse bottom contact ───
    {
      lure: 'Shakyhead',
      confidenceModifiers: [
        // Palaniuk: shakyhead on spotted bass — bread and butter
        { when: { waterClarity: 'clear', fishDepth: { min: 10 } }, adjustment: 8 },
        // Palaniuk: tough bite = shakyhead time
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 8 },
        // Palaniuk: winter shakyhead — slow drag on deep structure
        { when: { season: 'winter', waterTemp: { max: 50 } }, adjustment: 6 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#5a6e3a', priority: 9 },
        { when: { isStained: true }, color: 'Watermelon Red', hex: '#5e7e48', priority: 8 },
      ],
      tipRules: [
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, tip: 'Palaniuk: Shakyhead on a tough bite — 1/4oz head, 5" finesse worm, 8lb fluoro. Drag painfully slow on rocky points. "Shake it in place, let it sit, drag 6 inches, repeat."', priority: 10 },
        { when: { season: 'winter' }, tip: 'Palaniuk: Winter shakyhead on deep points — position over structure with electronics, vertical or near-vertical presentation. Minimal movement, maximum bottom contact.', priority: 9 },
      ],
      defaultTip: 'Palaniuk: Shakyhead is the ultimate bottom-contact finesse bait. "It catches fish everywhere — smallmouth, spots, largemouth." Keep it on the bottom and keep it moving slow.',
    },

    // ─── Deep Diving Crankbait — Ledge fishing ───
    {
      lure: 'Deep Diving Crankbait',
      confidenceModifiers: [
        // Palaniuk: deep crank on ledges when fish are aggressive
        { when: { season: 'summer', fishDepth: { min: 12 }, pressureTrend: 'falling' }, adjustment: 8 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Palaniuk: Deep crank as the "first cast" bait on a new offshore spot. If they eat it, stay power. If not, slow down to football jig, then finesse to drop shot.', priority: 8 },
      ],
      defaultTip: 'Palaniuk: Deep crank for aggressive offshore fish. Start fast and loud, work your way down to finesse. "Let the fish tell you what they want."',
    },

    // ─── Swim Jig — Shallow current applications ───
    {
      lure: 'Swim Jig',
      confidenceModifiers: [
        // Palaniuk: swim jig in current — river situations
        { when: { windSpeed: { min: 8 }, season: ['post-spawn', 'summer', 'fall'] }, adjustment: 5 },
      ],
      tipRules: [
        { when: { season: ['post-spawn', 'summer'] }, tip: 'Palaniuk: Swim jig parallel to current breaks — bass sit on the slack side and ambush. Cast upstream, let the current sweep the bait past the break naturally.', priority: 8 },
      ],
      defaultTip: 'Palaniuk: Swim jig in current situations — position the bait where slack water meets moving water. That seam concentrates both baitfish and bass.',
    },
  ],
  structureAdvice: {
    'point': 'Palaniuk: Drag a drop shot or shakyhead down the point from shallow to deep. Feel for the bottom composition change — where gravel meets mud is the strike zone.',
    'bluff': 'Palaniuk: Jerkbait parallel to bluff walls where the channel swings tight to vertical rock. Prespawn fish stage at specific depths — match your bait depth precisely.',
    'grass': 'Palaniuk: Lipless through grass tops in spring, rip and fall. Transition to a drop shot on the outside grass edge when fish move deeper in summer.',
    'flat': 'Palaniuk: Carolina rig is the ultimate flat-search tool. "When you feel the weight go from gravel to mud, that\'s where they live." Read the bottom with your sinker.',
    'dock': 'Palaniuk: Skip a drop shot under docks for pressured fish. Shallow drop shot is underrated — nose-hooked finesse worm on 8lb fluoro, let it sit in the shade.',
    'creek-channel': 'Palaniuk: Deep drop shot on current breaks along channel edges. Position upstream and let the sinker hold bottom while the bait drifts naturally in the current.',
    'hump': 'Palaniuk: Electronics first — circle the hump and mark every fish before casting. Jigging spoon vertically when they\'re stacked, drop shot when they\'re scattered.',
    'riprap': 'Palaniuk: Shakyhead dragged along riprap for finesse bottom contact. Feel every rock — bass wedge into gaps between the chunks waiting for crawfish to drift past.',
    'laydown': 'Palaniuk: Texas-rigged drop shot through laydowns — nose-hook presentation is weedless enough for wood. Work the shady side where current or wind pushes bait against the branches.',
  },
};
