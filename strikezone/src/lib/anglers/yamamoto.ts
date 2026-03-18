// ─── Gary Yamamoto: Soft Plastics Maestro, Finesse Specialist, Senko Inventor ───
// Sources: BassFan, Wired2Fish, Bassmaster, In-Fisherman, Gary Yamamoto Custom Baits
import type { AnglerProfile } from './types';

export const YAMAMOTO: AnglerProfile = {
  name: 'Yamamoto',
  id: 'yamamoto',
  defaultCredibility: 0.3,
  credibility: {
    '10" Worm': 0.8,
    'Carolina Rig': 0.8,
    'Bladed Jig': 0.6,
    'Drop Shot': 0.9,
    'Flipping Jig': 0.7,
    'Football Jig': 0.6,
    'Ned Rig': 0.8,
    'Neko Rig': 0.9,
    'Shakyhead': 0.9,
    'Spinnerbait (Colorado/Willow)': 0.4,
    'Swim Jig': 0.6,
    'Texas Rig (Creature Bait)': 1.0,
  },
  opinions: [
    // ─── Texas Rig (Creature Bait) — His domain ───
    {
      lure: 'Texas Rig (Creature Bait)',
      confidenceModifiers: [
        // Yamamoto: Senko is deadly year-round but especially prespawn/spawn
        { when: { season: ['pre-spawn', 'spawn'] }, adjustment: 10 },
        // Yamamoto: weightless Senko excels in clear water — subtle presentation
        { when: { waterClarity: 'clear' }, adjustment: 6 },
        // Yamamoto: "The slower you fish the Senko, the better" — cold water = slow = Senko time
        { when: { waterTemp: { max: 55 } }, adjustment: 5 },
        // Yamamoto: shallow weightless Senko is the bread and butter
        { when: { fishDepth: { max: 10 } }, adjustment: 5 },
      ],
      colorRules: [
        // Yamamoto: green pumpkin is the universal go-to
        { when: {}, color: 'Green Pumpkin', hex: '#5a6e3a', priority: 5 },
        // Yamamoto: black with blue flake for stained/muddy
        { when: { isStained: true }, color: 'Black w/ Blue Flake', hex: '#1a1a3e', priority: 8 },
        // Yamamoto: GP/watermelon laminate for clear water variety
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin/Watermelon Laminate', hex: '#6b7e4a', priority: 7 },
      ],
      tipRules: [
        { when: { fishDepth: { max: 8 } }, tip: 'Yamamoto: Weightless 5" Senko on 3/0 EWG — "the slower you fish the Senko, the better." Lift-and-drop, let it shimmy on the fall. The vibration IS the action.', priority: 12 },
        { when: { season: 'spawn' }, tip: 'Yamamoto: Wacky-rigged Senko on beds — shake softly, almost vibrating in place. Both sides flutter. Less movement = better for sight fishing.', priority: 10 },
        { when: { fishDepth: { min: 10 } }, tip: 'Yamamoto: Deep Senko — 1/8oz screw-lock weight creates spiral fall. 3/16-1/4oz for 10-20ft. "Glide & drop" — raise rod tip slowly like raising a flag, then horizontal drop.', priority: 9 },
        { when: { waterClarity: 'clear' }, tip: 'Yamamoto: Downsize to 4" Senko in gin-clear water. 6-10lb fluoro leader with braid main. Salt-and-pepper color "works any place in the world."', priority: 8 },
      ],
      defaultTip: 'Yamamoto: 5" Senko weightless TX rig is the most versatile soft plastic in existence. Green pumpkin covers 90% of situations. Snell knot is essential.',
    },

    // ─── Drop Shot ───
    {
      lure: 'Drop Shot',
      confidenceModifiers: [
        // Yamamoto: Kut Tail Worm on drop shot — finesse king
        { when: { waterClarity: 'clear' }, adjustment: 6 },
        // Yamamoto: finesse presentations shine when fish are pressured
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 5 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#5a6e3a', priority: 7 },
        { when: { isStained: true }, color: 'Black w/ Blue Flake', hex: '#1a1a3e', priority: 7 },
      ],
      tipRules: [
        { when: { waterClarity: 'clear' }, tip: 'Yamamoto: Kut Tail Worm on drop shot — "cut tail" vibration is subtler than curly tail. 6-10lb fluoro leader, light spinning gear. Let the bait do the work.', priority: 9 },
      ],
      defaultTip: 'Yamamoto: Softer plastic = more bites. Kut Tail Worm\'s subtle vibration outperforms flashier profiles on pressured fish.',
    },

    // ─── Ned Rig ───
    {
      lure: 'Ned Rig',
      confidenceModifiers: [
        // Yamamoto: finesse plastics shine on tough bites
        { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 5 },
      ],
      tipRules: [
        { when: { waterClarity: 'clear' }, tip: 'Yamamoto: Short Senko (4") on ned head — the shimmy fall that made the Senko famous, now in micro form. Lightest jig head possible for slowest fall.', priority: 8 },
      ],
      defaultTip: 'Yamamoto: Ned rig with soft Yamamoto plastic — the salt content gives it a faster fall rate than competitors. Green pumpkin covers everything.',
    },

    // ─── Neko Rig ───
    {
      lure: 'Neko Rig',
      confidenceModifiers: [
        // Yamamoto: neko rig with Senko or Kut Tail is deadly on clear water smallmouth and largemouth
        { when: { waterClarity: 'clear' }, adjustment: 6 },
      ],
      tipRules: [
        { when: { waterClarity: 'clear' }, tip: 'Yamamoto: Kut Tail Worm on neko rig — nose weight makes the tail wave vertically. Subtle shake, let the soft plastic do the work.', priority: 8 },
      ],
      defaultTip: 'Yamamoto: Neko-rigged Kut Tail or Senko. The softness of the plastic amplifies the subtle tail action that triggers bites.',
    },

    // ─── Shakyhead ───
    {
      lure: 'Shakyhead',
      confidenceModifiers: [
        // Yamamoto: Kut Tail Worm "power finesse" on shakey head
        { when: { season: 'summer', fishDepth: { min: 10 } }, adjustment: 6 },
      ],
      tipRules: [
        { when: { fishDepth: { min: 10 } }, tip: 'Yamamoto: 6.5-7.75" Kut Tail Worm as "power finesse" on 3/8-1/2oz shakey head. Bigger profile, deeper water, still finesse action.', priority: 8 },
      ],
      defaultTip: 'Yamamoto: Kut Tail Worm on shakey head — the cut tail vibration triggers bites when curly tails get ignored. Slow shake on bottom.',
    },

    // ─── Carolina Rig ───
    {
      lure: 'Carolina Rig',
      confidenceModifiers: [
        // Yamamoto: Hula Grub on C-rig is a classic deep-water searcher
        { when: { season: 'summer', fishDepth: { min: 12 } }, adjustment: 6 },
      ],
      colorRules: [
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#5a6e3a', priority: 6 },
        { when: { isStained: true }, color: 'Black w/ Blue Flake', hex: '#1a1a3e', priority: 6 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Yamamoto: Hula Grub on C-rig — double tails + rubber tentacles = maximum action on the free-floating leader. Lightest possible for slow glide.', priority: 8 },
      ],
      defaultTip: 'Yamamoto: Hula Grub or Senko on Carolina rig. The soft plastic\'s natural action shines with the free leader separation.',
    },

    // ─── Flipping Jig ───
    {
      lure: 'Flipping Jig',
      confidenceModifiers: [
        // Yamamoto: Flappin' Hog / Kreature as flipping trailer
        { when: { season: ['pre-spawn', 'spawn'] }, adjustment: 5 },
      ],
      colorRules: [
        { when: { isStained: true }, color: 'Black & Blue', hex: '#1a1a2e', priority: 6 },
        { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#5a6e3a', priority: 6 },
      ],
      tipRules: [
        { when: { isStained: true }, tip: 'Yamamoto: Kreature trailer — slim body penetrates cover, multiple appendages push water for vibration in stained water. 4" size for compact profile.', priority: 8 },
        { when: { waterClarity: 'clear' }, tip: 'Yamamoto: Flappin\' Hog trailer — appendages stay tight to body through cover, then flare on the fall. Compact profile = fewer snags.', priority: 7 },
      ],
      defaultTip: 'Yamamoto: Flappin\' Hog or Kreature as jig trailer. Soft plastic = more action on the fall. Green pumpkin or black/blue.',
    },

    // ─── Football Jig ───
    {
      lure: 'Football Jig',
      tipRules: [
        { when: { season: 'summer' }, tip: 'Yamamoto: Hula Grub on football jig — tentacles + twin tails create maximum movement dragging rock. Lightest head that maintains contact.', priority: 7 },
      ],
      defaultTip: 'Yamamoto: Cowboy or Hula Grub as football jig trailer. J-shaped legs (Cowboy) or twin tails (Hula Grub) — both excel dragged over structure.',
    },

    // ─── Swim Jig ───
    {
      lure: 'Swim Jig',
      tipRules: [
        { when: {}, tip: 'Yamamoto: Zako swimbait trailer — shad profile with accordion tail. NOT salt-laden like Senko, so it suspends/floats better behind a swim jig.', priority: 7 },
      ],
      defaultTip: 'Yamamoto: Zako swimbait as swim jig trailer. The non-salted body suspends naturally — critical for maintaining the right swim jig action.',
    },

    // ─── Bladed Jig ───
    {
      lure: 'Bladed Jig',
      tipRules: [
        { when: {}, tip: 'Yamamoto: Zako swimbait as bladed jig trailer — shad profile and accordion tail add realism. Non-salted body won\'t weigh down the blade action.', priority: 6 },
      ],
      defaultTip: 'Yamamoto: Zako or Cowboy as bladed jig trailer. Match profile to forage — Zako for shad, Cowboy for bluegill/crawfish.',
    },

    // ─── 10" Worm ───
    {
      lure: '10" Worm',
      confidenceModifiers: [
        // Yamamoto: big worms are his bread and butter for trophy fish
        { when: { season: ['post-spawn', 'summer'] }, adjustment: 6 },
      ],
      colorRules: [
        { when: {}, color: 'Green Pumpkin', hex: '#5a6e3a', priority: 5 },
        { when: { isStained: true }, color: 'Black w/ Blue Flake', hex: '#1a1a3e', priority: 7 },
      ],
      tipRules: [
        { when: { season: 'summer' }, tip: 'Yamamoto: 7" Kut Tail Worm as "power finesse" alternative to full 10" worm. Same slow presentation, slightly smaller profile for pressured fish.', priority: 7 },
      ],
      defaultTip: 'Yamamoto: Big worm, slow presentation. The softer the plastic, the more bites. Green pumpkin. Let the fall do the work.',
    },
  ],
  structureAdvice: {
    'point': 'Yamamoto: Weightless Senko on points — cast it out and let it shimmy down the slope. The natural fall along the contour change is irresistible to staging fish.',
    'bluff': 'Yamamoto: Drop shot a Kut Tail Worm vertically along bluff walls. The subtle cut-tail vibration draws fish out of rock crevices without spooking them.',
    'grass': 'Yamamoto: Weightless Senko over grass tops — let it fall into the pockets and openings. The slow shimmy through sparse grass triggers bites nothing else can.',
    'flat': 'Yamamoto: Wacky-rigged Senko is the ultimate flat bait. Cast it out, let it fall, twitch it up, let it fall again. Cover water with patience and the fish will find it.',
    'dock': 'Yamamoto: Skip a weightless Senko under docks — it glides and shimmies on the fall in ways no other bait can. Green pumpkin on 3/0 EWG, light fluorocarbon.',
    'creek-channel': 'Yamamoto: Carolina rig a Hula Grub along channel swings. The free-floating leader lets the soft plastic drift naturally along the ledge where bass stage.',
    'hump': 'Yamamoto: Shakyhead with a Kut Tail Worm dragged across offshore humps. Slow, bottom-contact presentation — the cut tail vibrates with every subtle movement.',
    'riprap': 'Yamamoto: Texas-rigged Senko dragged along riprap. The salt-impregnated body gives it a natural fall rate between the rocks where bass pin up waiting for crawfish.',
    'laydown': 'Yamamoto: Weightless Senko pitched into laydown branches. Let it pendulum through the limbs on a free fall — the shimmy action works through cover like nothing else.',
  },
};
