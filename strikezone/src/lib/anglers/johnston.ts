// ─── Cory Johnston: Drop Shot Specialist, Smallmouth Expert, Finesse & Northern Fisheries ───
// Sources: Bassmaster.com, FLW/MLF tournament coverage, _merged-review.json
import type { AnglerProfile } from './types';

export const JOHNSTON: AnglerProfile = {
  name: 'Johnston',
  id: 'johnston',
  defaultCredibility: 0.5,
  credibility: {
    'Drop Shot': 1.0,
    'Ned Rig': 0.9,
    'Spy Bait': 0.9,
    'Suspending Jerkbait': 0.8,
    'Football Jig': 0.8,
    'Texas Rig (Creature Bait)': 0.8,
    'Flipping Jig': 0.7,
    'Deep Diving Crankbait': 0.7,
    'Walking Topwater': 0.6,
    'Carolina Rig': 0.6,
    'Chatterbait': 0.6,
    'Squarebill Crankbait': 0.6,
  },
  opinions: [
    // ─── Drop Shot ───
    {
      lure: 'Drop Shot',
      confidenceModifiers: [
        // Johnston: Summer deep smallmouth at 20-40ft is his bread and butter
        { when: { season: 'summer', fishDepth: { min: 20 } }, adjustment: 15 },
        // Johnston: Clear water = drop shot excels
        { when: { waterClarity: 'clear' }, adjustment: 10 },
        // Johnston: Post-frontal finesse excels when fish get lockjaw
        { when: { frontalSystem: 'post-frontal' }, adjustment: 8 },
      ],
      colorRules: [
        // Johnston: Green Pumpkin default, especially for smallmouth
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 10 },
        { when: { waterClarity: 'stained' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'summer', fishDepth: { min: 30 } }, tip: 'Johnston: Summer deep smallmouth on St. Lawrence at 40ft. Vertical drop shot — keep it in the strike zone. Heavier weight holds bottom in current.', priority: 12 },
        { when: { season: 'summer', fishDepth: { min: 20 } }, tip: 'Johnston: Deep Lake Ontario smallmouth at 33ft. Let the drop shot pendulum naturally — subtle movements trigger bites from pressured fish.', priority: 10 },
        { when: { frontalSystem: 'post-frontal' }, tip: 'Johnston: Post-frontal smallmouth get finicky. Downsize your hook and bait, slow your presentation — drop shot is the ultimate finesse tool.', priority: 9 },
        { when: { season: 'fall' }, tip: 'Johnston: Fall smallmouth transition deep. Follow them with drop shot on main lake structure — points, humps, and channel edges.', priority: 8 },
        { when: { season: 'winter' }, tip: 'Johnston: Winter drop shot for lethargic bass. Minimal movement — just enough to keep the bait off bottom with a slow shake.', priority: 7 },
      ],
      defaultTip: 'Johnston: "Drop shot is my #1 confidence bait." Vertical presentation for deep smallmouth — heavier weight in current, lighter in calm water.',
    },

    // ─── Spy Bait ───
    {
      lure: 'Spy Bait',
      colorRules: [
        // Johnston: Ghost Pearl in clear water for sight-fishing
        { when: { waterClarity: 'clear' }, color: 'Ghost Pearl', hex: '#e8e8e0', priority: 10 },
      ],
      tipRules: [
        { when: { waterClarity: 'clear', fishDepth: { max: 10 } }, tip: 'Johnston: Sight-fishing shallow smallmouth on rock piles with spy bait. Slow, steady retrieve — let the subtle rolling action do the work.', priority: 10 },
      ],
    },

    // ─── Walking Topwater ───
    {
      lure: 'Walking Topwater',
      colorRules: [
        // Johnston: Chartreuse Ghost for summer rock pile bass
        { when: { season: 'summer' }, color: 'Chartreuse Ghost', hex: '#7fff00', priority: 10 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Johnston: Summer rock pile bass crush topwater early. Chartreuse Ghost walking bait over shallow rock — locate fish, then follow up with drop shot.', priority: 10 },
      ],
    },

    // ─── Texas Rig (Creature Bait) ───
    {
      lure: 'Texas Rig (Creature Bait)',
      colorRules: [
        // Johnston: Green Pumpkin tubes for smallmouth
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 10 },
        { when: { waterClarity: 'stained' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 8 },
      ],
      tipRules: [
        { when: { waterClarity: 'clear' }, tip: 'Johnston: "Can\'t beat a tube jig for smallmouth on clean bottom." Drag it slow over rock and gravel — mimics a crawfish perfectly.', priority: 12 },
        { when: { season: 'spawn' }, tip: 'Johnston: Tube jig for bed fishing smallmouth. Pitch to visible beds on gravel flats — compact profile provokes territorial strikes.', priority: 10 },
        { when: { season: 'summer' }, tip: 'Johnston: Summer smallmouth on rock — tube jig dragged across transitions. Clean bottom with scattered boulders is prime.', priority: 8 },
        { when: { season: 'fall' }, tip: 'Johnston: Fall tube jig on main lake points. Smallmouth group up on rock as water cools — drag through the zone methodically.', priority: 7 },
      ],
      defaultTip: 'Johnston: Tube jig is the original smallmouth bait. Drag on bottom, hop off rocks — natural crawfish imitation on clean substrate.',
    },

    // ─── Flipping Jig ───
    {
      lure: 'Flipping Jig',
      colorRules: [
        { when: { waterClarity: 'muddy' }, color: 'Black', hex: '#1a1a1a', priority: 10 },
        { when: { waterClarity: 'stained' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 8 },
      ],
      tipRules: [
        { when: { season: 'pre-spawn' }, tip: 'Johnston: Compact mini jig for fast flipping. "Don\'t soak a jig. The more flips you can get in, the more fish you\'ll catch."', priority: 12 },
        { when: { season: 'summer' }, tip: 'Johnston: Speed-flip a compact jig to isolated cover. Efficiency wins — pitch, bump, reel, repeat.', priority: 10 },
        { when: { waterClarity: 'muddy' }, tip: 'Johnston: Black jig in dirty water. Compact profile, fast presentations — cover water and let the fish tell you where they are.', priority: 8 },
      ],
      defaultTip: 'Johnston: "Don\'t soak a jig. The more flips you can get in, the more bites you\'ll get." Compact mini jig, fast and efficient.',
    },

    // ─── Suspending Jerkbait ───
    {
      lure: 'Suspending Jerkbait',
      confidenceModifiers: [
        // Johnston: Winter largemouth in cold water — slow twitch at 40°F
        { when: { season: 'winter', waterTemp: { max: 45 } }, adjustment: 12 },
      ],
      colorRules: [
        // Johnston: Natural Shad for fall smallmouth
        { when: { season: 'fall' }, color: 'Natural Shad', hex: '#c0c0c0', priority: 10 },
      ],
      tipRules: [
        { when: { season: 'winter', waterTemp: { max: 45 } }, tip: 'Johnston: Cold water 40°F slow-twitch jerkbait for largemouth. Long pauses — 10 to 30 seconds between twitches. Let the suspending action do the work.', priority: 12 },
        { when: { season: 'fall' }, tip: 'Johnston: Fall smallmouth smash jerkbaits around rock and transitions. Natural Shad pattern, snappy cadence in 50-60°F water.', priority: 10 },
        { when: { season: 'pre-spawn' }, tip: 'Johnston: Pre-spawn smallmouth on jerkbait. Target wind-blown points with rock — aggressive cadence as water warms through the 40s.', priority: 8 },
      ],
    },

    // ─── Football Jig ───
    {
      lure: 'Football Jig',
      confidenceModifiers: [
        // Johnston: Winter cold water football jig
        { when: { season: 'winter', waterTemp: { max: 50 } }, adjustment: 10 },
      ],
      colorRules: [
        // Johnston: Green Pumpkin in winter
        { when: { season: 'winter' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 10 },
      ],
      tipRules: [
        { when: { season: 'winter', waterTemp: { max: 50 } }, tip: 'Johnston: 3/8-3/4oz football jig in cold water (40°F range). Bounce on bottom — the football head kicks off rocks for erratic action.', priority: 12 },
        { when: { season: 'summer' }, tip: 'Johnston: Summer offshore timber — football jig dragged through standing timber on ledges and humps. Let it fall into the gaps.', priority: 10 },
      ],
      defaultTip: 'Johnston: Football jig for hard bottom and rock. Drag and bounce — the head design translates bottom contact into triggering action.',
    },

    // ─── Ned Rig ───
    {
      lure: 'Ned Rig',
      confidenceModifiers: [
        // Johnston: Fall smallmouth follow-up bait
        { when: { season: 'fall' }, adjustment: 8 },
        // Johnston: Post-frontal finesse
        { when: { frontalSystem: 'post-frontal' }, adjustment: 5 },
      ],
      colorRules: [
        // Johnston: Green Pumpkin
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 10 },
      ],
      tipRules: [
        { when: { season: 'fall' }, tip: 'Johnston: "Perfect follow-up after reaction baits in mid-late fall." When smallmouth swipe at jerkbaits but won\'t commit, drop a Ned rig on them.', priority: 12 },
        { when: { frontalSystem: 'post-frontal' }, tip: 'Johnston: Post-frontal Ned rig for finicky smallmouth. Light touch — barely move it on bottom. Secondary to drop shot but deadly as a change-up.', priority: 10 },
        { when: { season: 'winter' }, tip: 'Johnston: Winter Ned rig on rock — subtle presentation for cold-water smallmouth. Slow drag with long pauses.', priority: 8 },
      ],
      defaultTip: 'Johnston: Ned rig is his secondary finesse tool — "perfect follow-up after reaction baits." Keep it simple on bottom with minimal movement.',
    },

    // ─── Deep Diving Crankbait ───
    {
      lure: 'Deep Diving Crankbait',
      colorRules: [
        // Johnston: Natural Shad
        { when: { season: 'fall' }, color: 'Natural Shad', hex: '#c0c0c0', priority: 10 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Johnston: 10XD in offshore timber. Deflect off standing wood — the erratic action triggers reaction strikes from grouped fish.', priority: 10 },
        { when: { season: 'fall', waterTemp: { min: 55, max: 65 } }, tip: 'Johnston: Burn a deep diver 10-15ft for fall smallmouth in 55-65°F water. Speed kills — reel fast and let deflections trigger strikes.', priority: 10 },
      ],
    },

    // ─── Carolina Rig ───
    {
      lure: 'Carolina Rig',
      tipRules: [
        { when: { season: 'summer' }, tip: 'Johnston: Summer offshore — 10-inch worms and magnum flukes on a Carolina rig for bigger fish. Big baits cull through the small ones.', priority: 10 },
      ],
    },

    // ─── Chatterbait ───
    {
      lure: 'Chatterbait',
      tipRules: [
        { when: { season: 'fall' }, tip: 'Johnston: 1/2oz chatterbait covers water fast for early fall smallmouth around grass and rock transitions. Search tool when fish are scattered.', priority: 10 },
      ],
    },

    // ─── Squarebill Crankbait ───
    {
      lure: 'Squarebill Crankbait',
      tipRules: [
        { when: { season: 'fall', waterTemp: { min: 45, max: 55 } }, tip: 'Johnston: Late fall smallmouth squarebill — deflect off rock in 45-55°F water. No grass needed — target bare rock and gravel transitions.', priority: 10 },
      ],
    },
  ],
  structureAdvice: {
    'point': 'Johnston: Smallmouth stack up on main lake points at 20-40ft. Vertical drop shot on the break, working both sides of the point.',
    'bluff': 'Johnston: Deep bluff walls hold suspended fish. Let the drop shot pendulum along the face at the depth fish are marking.',
    'flat': 'Johnston: Rock piles on flats are smallmouth magnets. Spy bait or topwater to locate, then drop shot to pick apart.',
    'creek-channel': 'Johnston: Channel swings concentrate bait and bass. Drift with the current, keeping your drop shot in the strike zone on the deep edge.',
    'hump': 'Johnston: Offshore humps are big-fish attractors. Circle the hump with electronics first, then target clusters with drop shot or football jig.',
  },
};
