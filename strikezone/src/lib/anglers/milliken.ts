// ─── Ben Milliken: Big Bait Specialist, Forward-Facing Sonar Master, Offshore ───
// Sources: Wired2Fish, BassBlaster, Bassmaster, 6th Sense Fishing, BassFan
import type { AnglerProfile } from './types';

export const MILLIKEN: AnglerProfile = {
  name: 'Milliken',
  id: 'milliken',
  defaultCredibility: 0.3,
  credibility: {
    'Suspending Jerkbait': 0.8,
    'Carolina Rig': 0.8,
    'Walking Topwater': 0.6,
    'Swim Jig': 0.5,
    'Chatterbait': 0.5,
    'Deep Diving Crankbait': 0.5,
    'Football Jig': 0.4,
    'Spy Bait': 0.5,
    'Drop Shot': 0.5,
    'Blade Bait': 0.4,
    'Texas Rig (Creature Bait)': 0.5,
  },
  opinions: [
    // ─── Suspending Jerkbait — One of few "small baits" he trusts for giants ───
    {
      lure: 'Suspending Jerkbait',
      confidenceModifiers: [
        // Milliken: jerkbait is one of few small baits effective for giant bass
        { when: { season: 'winter' }, adjustment: 8 },
        // Milliken: Provoke 106DD Silent designed for pressured/sonar-locked fish
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 5 },
        // Milliken: used jerkbait as primary at 2025 Classic
        { when: { season: 'pre-spawn' }, adjustment: 6 },
      ],
      colorRules: [
        // Milliken: ghost/translucent for clear water
        { when: { waterClarity: 'clear' }, color: 'Ghost Minnow', hex: '#d8e4e8', priority: 8 },
        // Milliken: matte/flasher for stained
        { when: { isStained: true }, color: 'Matte Minnow', hex: '#c0c8c4', priority: 8 },
      ],
      tipRules: [
        { when: { waterTemp: { max: 50 } }, tip: 'Milliken: Cold water jerkbait = slower retrieve, longer pauses. Water temp controls cadence. Provoke 106DD Silent for pressured fish on forward-facing sonar.', priority: 9 },
        { when: { season: 'pre-spawn' }, tip: 'Milliken: Jerkbait is one of few "small baits" effective for giant bass. Cover water on transitional banks — 5ft depth with 12lb fluoro on a long cast.', priority: 8 },
      ],
      defaultTip: 'Milliken: Jerkbait designed to "trigger violent strikes, especially when fish are locked onto forward-facing sonar." Adjust cadence to water temp — colder = slower.',
    },

    // ─── Carolina Rig — His proven backup/cleanup bait ───
    {
      lure: 'Carolina Rig',
      confidenceModifiers: [
        // Milliken: C-rig supplement pattern at Toledo Bend, Day 3 go-to on offshore spot
        { when: { season: ['pre-spawn', 'post-spawn'] }, adjustment: 6 },
        // Milliken: confident he can C-rig a limit as backup
        { when: { season: 'summer', fishDepth: { min: 8 } }, adjustment: 5 },
      ],
      colorRules: [
        // Milliken: Hogwalla in green pumpkin juice
        { when: {}, color: 'Green Pumpkin Juice', hex: '#5a6e3a', priority: 6 },
      ],
      tipRules: [
        { when: { season: ['pre-spawn', 'post-spawn'] }, tip: 'Milliken: C-rig clay points — "5-6 casts on a point first" before switching to big baits. 3/4-1oz tungsten, 17lb fluoro leader, brass clacker. Hogwalla stays perfectly horizontal on the fall.', priority: 9 },
        { when: { season: 'summer' }, tip: 'Milliken: C-rig as offshore cleanup bait. 20lb fluoro main, 7\'5" heavy rod. Multiple appendage types on creature bait create different fall actions — critical for triggering offshore fish.', priority: 7 },
      ],
      defaultTip: 'Milliken: Carolina rig is a proven limit-catcher backup. Creature bait must stay horizontal in the water column — that\'s "very important" for drawing strikes.',
    },

    // ─── Walking Topwater — Wake bait crossover ───
    {
      lure: 'Walking Topwater',
      confidenceModifiers: [
        // Milliken: wake bait = "very high percentage bait to get fish to come up and eat"
        { when: { season: ['post-spawn', 'summer', 'fall'] }, adjustment: 5 },
      ],
      tipRules: [
        { when: { season: ['post-spawn', 'summer'] }, tip: 'Milliken: Oversized topwater/wake bait — 6-7" size is "a very, very high percentage bait to get fish to come up and eat." Braided line for topwater. Bigger profile draws bigger fish.', priority: 8 },
      ],
      defaultTip: 'Milliken: Big topwater draws strikes from fish conditioned to smaller lures. Even 2-3 pounders react to oversized baits better than standard presentations.',
    },

    // ─── Swim Jig — Transitional to swimbaits ───
    {
      lure: 'Swim Jig',
      tipRules: [
        { when: {}, tip: 'Milliken: Swim jig is a natural transition bait toward bigger swimbaits. Same cover, same zones, but "big baits draw strikes from fish conditioned to these more common lures."', priority: 6 },
      ],
      defaultTip: 'Milliken: When swim jig bites slow down, size up to a 6"+ line-through swimbait in the same zone. Same cadence, bigger profile.',
    },

    // ─── Chatterbait — Transitional bait ───
    {
      lure: 'Chatterbait',
      tipRules: [
        { when: {}, tip: 'Milliken: Vibrating jig is a gateway to bigger presentations. When quality drops on standard-size baits, upsize to a swimbait for the same fish but better quality.', priority: 5 },
      ],
      defaultTip: 'Milliken: Chatterbait covers water efficiently but can be outsized by swimbaits when targeting quality. Match bait size to the forage you\'re imitating.',
    },

    // ─── Deep Diving Crankbait — Offshore sonar application ───
    {
      lure: 'Deep Diving Crankbait',
      confidenceModifiers: [
        // Milliken: crank-down baits are one of his 4 big bait categories
        { when: { season: 'summer', fishDepth: { min: 10 } }, adjustment: 5 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Milliken: Crank-down through wood cover — "hit the laydown the entire way through the cast and just burn it as quick as possible." Deflection triggers reaction strikes.', priority: 8 },
      ],
      defaultTip: 'Milliken: Deep cranking is a search tool for offshore structure. Use forward-facing sonar to identify fish, then burn crank-down through their zone.',
    },

    // ─── Football Jig — Offshore bottom contact ───
    {
      lure: 'Football Jig',
      confidenceModifiers: [
        // Milliken: offshore heavyweight approach
        { when: { season: 'summer', fishDepth: { min: 12 } }, adjustment: 4 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Milliken: When big baits aren\'t producing offshore, football jig is reliable for getting bites on structure. Use sonar to identify fish position before committing.', priority: 6 },
      ],
      defaultTip: 'Milliken: Football jig for offshore bottom contact when fish are relating to hard structure. Verify fish presence with electronics first.',
    },

    // ─── Spy Bait — Forward-facing sonar finesse ───
    {
      lure: 'Spy Bait',
      confidenceModifiers: [
        // Milliken: "rate of fall" and "rate of stall" are key concepts — spy bait excels here
        { when: { waterClarity: 'clear' }, adjustment: 5 },
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 4 },
      ],
      tipRules: [
        { when: { waterClarity: 'clear' }, tip: 'Milliken: "Rate of fall and rate of stall" are the two most important concepts with forward-facing sonar. Spy bait\'s slow fall and subtle action are ideal for sonar-spotted fish.', priority: 8 },
      ],
      defaultTip: 'Milliken: Spy bait for suspended fish spotted on forward-facing sonar. Slow, subtle presentation — let the bait hang in the strike zone.',
    },

    // ─── Drop Shot — Sonar finesse application ───
    {
      lure: 'Drop Shot',
      confidenceModifiers: [
        // Milliken: sonar-driven finesse for suspended and bottom fish
        { when: { season: ['summer', 'winter'] }, adjustment: 4 },
      ],
      tipRules: [
        { when: { season: ['summer', 'winter'] }, tip: 'Milliken: Use forward-facing sonar to watch fish react to your drop shot in real time. "Rate of fall and rate of stall" — adjust weight and leader length to match fish position.', priority: 7 },
      ],
      defaultTip: 'Milliken: Drop shot for sonar-spotted fish that won\'t commit to bigger baits. Watch the fish react on screen and adjust presentation accordingly.',
    },

    // ─── Blade Bait — Winter offshore vertical ───
    {
      lure: 'Blade Bait',
      confidenceModifiers: [
        // Milliken: winter offshore with slow presentations
        { when: { season: 'winter', waterTemp: { max: 45 } }, adjustment: 5 },
      ],
      tipRules: [
        { when: { season: 'winter' }, tip: 'Milliken: Winter offshore — slow vertical presentations. Forward-facing sonar lets you watch fish approach and adjust cadence in real time. Slower than usual in high 30s water.', priority: 7 },
      ],
      defaultTip: 'Milliken: Blade bait for winter vertical jigging on offshore structure. Electronics-driven approach — find them first, then present.',
    },

    // ─── Texas Rig — Stick bait / Clout application ───
    {
      lure: 'Texas Rig (Creature Bait)',
      confidenceModifiers: [
        // Milliken: Clout 6.3 stick bait as changeup at 2025 Classic
        { when: { season: 'pre-spawn' }, adjustment: 4 },
      ],
      tipRules: [
        { when: { season: 'pre-spawn' }, tip: 'Milliken: Oversized stick bait (6.3") on TX rig as a changeup from jerkbait. Cover the same transitional banks with a slower, bottom-contact presentation.', priority: 7 },
      ],
      defaultTip: 'Milliken: TX-rigged stick bait as a changeup when reaction baits slow down. Natural colors — match the forage.',
    },
  ],
  structureAdvice: {
    'point': 'Milliken: Scan the point with forward-facing sonar, then burn a big swimbait or crank-down past any fish you mark. Giant bass use points as ambush stations for baitfish schools.',
    'bluff': 'Milliken: Bluff ends concentrate big fish where the rock meets open water. Jerkbait or oversized spy bait parallel to the wall — watch your sonar for followers.',
    'grass': 'Milliken: Big swimbaits over grass edges draw strikes from fish that ignore standard-size baits. The larger profile triggers territorial responses from the biggest fish in the grass.',
    'flat': 'Milliken: Carolina rig a creature bait across flats to locate fish, then switch to a big topwater or wake bait once you know where they\'re sitting.',
    'dock': 'Milliken: Oversized topwater around dock shade — bigger profile draws bigger fish from under the cover. Bass under docks rarely see a 6-7" bait come through.',
    'creek-channel': 'Milliken: Use your sonar to find bait stacked on channel ledges, then burn a crank-down through the school. "Hit the structure the entire way through the cast."',
    'hump': 'Milliken: Forward-facing sonar on humps shows you exactly where fish are positioned. Circle the hump, mark everything, then present a big bait at the right depth and angle.',
    'riprap': 'Milliken: Crank-down banging off riprap triggers reaction strikes from fish that won\'t eat finesse presentations. Burn it fast — the deflection off rocks is the trigger.',
    'laydown': 'Milliken: Burn a crank-down through laydowns — "hit the laydown the entire way through the cast." The violent deflection off branches triggers reaction strikes from big fish.',
  },
};
