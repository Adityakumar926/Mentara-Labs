/**
 * Mentara Labs | Mentp Learning Compass
 * The Eight Assessment Missions Architecture
 * 
 * Each mission is art-directed with its own distinct visual atmosphere,
 * pastel color palette, illustrated interactive challenge, and reflection probe:
 * 
 * 1. Pattern Planet (Spatial & Matrix Reasoning)
 * 2. Memory Forest (Working Memory & Sequence Tracking)
 * 3. Switch Lab (Cognitive Flexibility & Rule Switching)
 * 4. Story Ship (Narrative Comprehension & Verbal Reasoning)
 * 5. Inventor's Workshop (Creative Fluency & Divergent Thinking)
 * 6. Feelings Garden (Social Perception & Empathic Understanding)
 * 7. Friendship & Fairness (Cooperative Ethics & Balanced Problem-Solving)
 * 8. The Learning Detective (Deductive Logic & Metacognitive Synthesis)
 */

export const EIGHT_MISSIONS = [
  {
    id: 'mission-pattern-planet',
    index: 1,
    name: 'Pattern Planet',
    characterKey: 'orion',
    characterName: 'Orion',
    characterRole: 'Pattern Scout',
    object3D: 'polyhedral-constellation',
    object3dImg: 'assets/3d/object-pattern-planet.png',
    actionSubtitle: 'Observe • Find • Continue',
    animClass: 'anim-3d-planet',
    illustration: 'assets/illustrations/pattern-matrix.svg',
    dimension: 'Spatial & Matrix Intuition',
    dimensionKey: 'spatialIntuition',
    themeClass: 'theme-pattern-planet',
    icon: '🪐',
    accentColor: '#78BFA5',
    tagline: 'Floating geometric crystals and ancient matrix constellations',
    introDialogue: "Welcome to Pattern Planet! I'm Orion, your Pattern Scout. Look closely at the floating crystal tiles. Which piece completes the glowing constellation?",
    decorationsHtml: `
      <div class="mission-decorations">
        <svg width="40" height="40" viewBox="0 0 40 40" class="anim-float-slow">
          <polygon points="20,4 36,36 4,36" fill="#DFF4EA" stroke="#78BFA5" stroke-width="2" />
        </svg>
        <svg width="32" height="32" viewBox="0 0 32 32" class="anim-float-reverse">
          <circle cx="16" cy="16" r="14" fill="#EAE4FF" stroke="#9275D9" stroke-width="2" />
        </svg>
      </div>
    `,
    stem: "Study the celestial constellation grid. Look across each row and column. Which crystal star tile fits in the glowing spot (?)?",
    hint: "Notice how the outer shape stays the same along each column, while the center symbol changes across rows!",
    visualHtml: `
      <div style="background: #FFFFFF; border: 2px solid #C6E8D8; border-radius: 20px; padding: 20px; max-width: 480px; margin: 16px auto; box-shadow: inset 0 2px 6px rgba(0,0,0,0.02); text-align: center;">
        <div style="font-size: 0.85rem; font-weight: 800; color: #5E9B76; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px;">
          ✨ Planetary Constellation Grid (3 × 3)
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 330px; margin: 0 auto;">
          <!-- Row 1 -->
          <div style="background: #F4FAF7; border: 2px solid #A3D9BD; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 50 50" width="46" height="46"><circle cx="25" cy="25" r="20" fill="#EAF7F0" stroke="#78BFA5" stroke-width="2.5"/><circle cx="25" cy="25" r="5" fill="#E29B63"/></svg>
          </div>
          <div style="background: #F4FAF7; border: 2px solid #A3D9BD; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 50 50" width="46" height="46"><rect x="7" y="7" width="36" height="36" rx="6" fill="#EAF7F0" stroke="#78BFA5" stroke-width="2.5"/><circle cx="25" cy="25" r="5" fill="#E29B63"/></svg>
          </div>
          <div style="background: #F4FAF7; border: 2px solid #A3D9BD; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 50 50" width="46" height="46"><polygon points="25,6 45,42 5,42" fill="#EAF7F0" stroke="#78BFA5" stroke-width="2.5"/><circle cx="25" cy="30" r="5" fill="#E29B63"/></svg>
          </div>
          <!-- Row 2 -->
          <div style="background: #F4FAF7; border: 2px solid #A3D9BD; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 50 50" width="46" height="46"><circle cx="25" cy="25" r="20" fill="#EAF7F0" stroke="#78BFA5" stroke-width="2.5"/><line x1="15" y1="25" x2="35" y2="25" stroke="#E29B63" stroke-width="3.5" stroke-linecap="round"/><line x1="25" y1="15" x2="25" y2="35" stroke="#E29B63" stroke-width="3.5" stroke-linecap="round"/></svg>
          </div>
          <div style="background: #F4FAF7; border: 2px solid #A3D9BD; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 50 50" width="46" height="46"><rect x="7" y="7" width="36" height="36" rx="6" fill="#EAF7F0" stroke="#78BFA5" stroke-width="2.5"/><line x1="15" y1="25" x2="35" y2="25" stroke="#E29B63" stroke-width="3.5" stroke-linecap="round"/><line x1="25" y1="15" x2="25" y2="35" stroke="#E29B63" stroke-width="3.5" stroke-linecap="round"/></svg>
          </div>
          <div style="background: #F4FAF7; border: 2px solid #A3D9BD; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 50 50" width="46" height="46"><polygon points="25,6 45,42 5,42" fill="#EAF7F0" stroke="#78BFA5" stroke-width="2.5"/><line x1="15" y1="30" x2="35" y2="30" stroke="#E29B63" stroke-width="3.5" stroke-linecap="round"/><line x1="25" y1="20" x2="25" y2="40" stroke="#E29B63" stroke-width="3.5" stroke-linecap="round"/></svg>
          </div>
          <!-- Row 3 -->
          <div style="background: #F4FAF7; border: 2px solid #A3D9BD; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 50 50" width="46" height="46"><circle cx="25" cy="25" r="20" fill="#EAF7F0" stroke="#78BFA5" stroke-width="2.5"/><polygon points="25,16 34,25 25,34 16,25" fill="#E29B63"/></svg>
          </div>
          <div style="background: #F4FAF7; border: 2px solid #A3D9BD; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 50 50" width="46" height="46"><rect x="7" y="7" width="36" height="36" rx="6" fill="#EAF7F0" stroke="#78BFA5" stroke-width="2.5"/><polygon points="25,16 34,25 25,34 16,25" fill="#E29B63"/></svg>
          </div>
          <div style="background: #FFF9F1; border: 2.5px dashed #E29B63; border-radius: 12px; height: 66px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(226, 155, 99, 0.3);">
            <span style="font-size: 1.8rem; font-weight: 900; color: #E29B63;">?</span>
          </div>
        </div>
      </div>
    `,
    options: [
      {
        id: 'opt-p1-1',
        text: "Triangle with diamond center",
        correct: true,
        trait: 'spatial-systematic',
        icon: '▲',
        svgHtml: `<svg viewBox="0 0 54 54" width="46" height="46"><polygon points="27,6 49,44 5,44" fill="none" stroke="#10B981" stroke-width="3.2" stroke-linejoin="round"/><polygon points="27,24 35,32 27,40 19,32" fill="#F97316"/></svg>`
      },
      {
        id: 'opt-p1-2',
        text: "Triangle with dot center",
        correct: false,
        trait: 'row-slip',
        icon: '▲',
        svgHtml: `<svg viewBox="0 0 54 54" width="46" height="46"><polygon points="27,6 49,44 5,44" fill="none" stroke="#10B981" stroke-width="3.2" stroke-linejoin="round"/><circle cx="27" cy="32" r="5.5" fill="#F97316"/></svg>`
      },
      {
        id: 'opt-p1-3',
        text: "Square with diamond center",
        correct: false,
        trait: 'column-slip',
        icon: '■',
        svgHtml: `<svg viewBox="0 0 54 54" width="46" height="46"><rect x="8" y="8" width="38" height="38" rx="8" fill="none" stroke="#10B981" stroke-width="3.2"/><polygon points="27,17 37,27 27,37 17,27" fill="#F97316"/></svg>`
      },
      {
        id: 'opt-p1-4',
        text: "Circle with plus center",
        correct: false,
        trait: 'random-pick',
        icon: '●',
        svgHtml: `<svg viewBox="0 0 54 54" width="46" height="46"><circle cx="27" cy="27" r="21" fill="none" stroke="#10B981" stroke-width="3.2"/><line x1="16" y1="27" x2="38" y2="27" stroke="#F97316" stroke-width="4" stroke-linecap="round"/><line x1="27" y1="16" x2="27" y2="38" stroke="#F97316" stroke-width="4" stroke-linecap="round"/></svg>`
      }
    ],
    reflectionPrompt: "How did your eyes spot the matching crystal?",
    reflectionOptions: [
      { id: 'ref-row-col', text: "I looked row-by-row and column-by-column.", style: 'analytic' },
      { id: 'ref-shape-first', text: "I found the outer shape first, then checked the middle.", style: 'step-by-step' },
      { id: 'ref-instant-hunch', text: "It popped out to me right away without counting.", style: 'intuitive' }
    ]
  },
  {
    id: 'mission-memory-forest',
    index: 2,
    name: 'Memory Forest',
    characterKey: 'bramble',
    characterName: 'Bramble',
    characterRole: 'Forest Guardian',
    object3dImg: 'assets/3d/object-memory-forest.png',
    actionSubtitle: 'Remember • Explore • Grow',
    animClass: 'anim-3d-crystal',
    illustration: 'assets/illustrations/memory-forest-trail.svg',
    dimension: 'Working Memory & Sequencing',
    dimensionKey: 'workingMemory',
    themeClass: 'theme-memory-forest',
    icon: '🌲',
    accentColor: '#5E9B76',
    tagline: 'Singing fireflies, ancient oak trees, and lantern trails',
    introDialogue: "Welcome to Memory Forest! I'm Bramble the Forest Guardian. Three friendly animals ran down the mossy trail in order. Read their tracks to see who arrived first.",
    decorationsHtml: `
      <div class="mission-decorations">
        <span style="font-size: 1.8rem;" class="anim-float-slow">🍃</span>
        <span style="font-size: 1.4rem;" class="anim-float-reverse">⭐</span>
      </div>
    `,
    stem: "Three woodland companions crossed the whispering stream at dawn. Read the wooden path signs. Who made it across first?",
    hint: "Read Sign 1 first to eliminate who was behind the Badger, then verify with Sign 2!",
    visualHtml: `
      <div style="background: #FFFFFF; border: 2px solid #BFE0CB; border-radius: 20px; padding: 20px; max-width: 500px; margin: 16px auto;">
        <div style="display: flex; justify-content: space-around; align-items: center; background: #F4FAF7; border-radius: 14px; padding: 14px; border: 1px solid #D3EADB; margin-bottom: 16px;">
          <div style="text-align: center;"><div style="font-size: 2.2rem;">🦡</div><div style="font-size: 0.85rem; font-weight: 800; color: #293347;">Badger</div></div>
          <div style="font-size: 1.2rem; color: #78BFA5;">〰️</div>
          <div style="text-align: center;"><div style="font-size: 2.2rem;">🦉</div><div style="font-size: 0.85rem; font-weight: 800; color: #293347;">Owl</div></div>
          <div style="font-size: 1.2rem; color: #78BFA5;">〰️</div>
          <div style="text-align: center;"><div style="font-size: 2.2rem;">🦊</div><div style="font-size: 0.85rem; font-weight: 800; color: #293347;">Fox</div></div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: #FFF9F1; border: 1.5px solid #F3E0A2; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.3rem;">🪵</span>
            <span style="font-size: 0.95rem; font-weight: 600; color: #293347;"><strong>Sign 1:</strong> The <strong>Owl</strong> crossed after the <strong>Badger</strong>.</span>
          </div>
          <div style="background: #FFF9F1; border: 1.5px solid #F3E0A2; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.3rem;">🪵</span>
            <span style="font-size: 0.95rem; font-weight: 600; color: #293347;"><strong>Sign 2:</strong> The <strong>Fox</strong> crossed after the <strong>Owl</strong>.</span>
          </div>
        </div>
      </div>
    `,
    options: [
      { id: 'opt-p2-1', text: "The Badger", correct: true, trait: 'sequential-deduction', icon: '🦡' },
      { id: 'opt-p2-2', text: "The Owl", correct: false, trait: 'middle-capture', icon: '🦉' },
      { id: 'opt-p2-3', text: "The Fox", correct: false, trait: 'recency-bias', icon: '🦊' },
      { id: 'opt-p2-4', text: "They all crossed at the same time", correct: false, trait: 'harmony-bias', icon: '🐾' }
    ],
    reflectionPrompt: "How did you hold the animal order in your head?",
    reflectionOptions: [
      { id: 'ref-timeline', text: "I built a line in my head: 1st Badger, 2nd Owl, 3rd Fox.", style: 'linear-sequence' },
      { id: 'ref-movie', text: "I pictured a movie in my head of them walking across.", style: 'visual-narrative' },
      { id: 'ref-fast', text: "I knew immediately as soon as I read Sign 1.", style: 'quick-deduction' }
    ]
  },
  {
    id: 'mission-switch-lab',
    index: 3,
    name: 'Switch Lab',
    characterKey: 'ada',
    characterName: 'Dr. Ada',
    characterRole: 'Kinetic Inventor',
    object3D: 'kinetic-gears',
    object3dImg: 'assets/3d/object-switch-lab.png',
    actionSubtitle: 'Think • Try • Adapt',
    animClass: 'anim-3d-robot',
    illustration: 'assets/illustrations/switch-lab-gears.svg',
    dimension: 'Cognitive Flexibility & Rule Switching',
    dimensionKey: 'cognitiveFlexibility',
    themeClass: 'theme-switch-lab',
    icon: '🧪',
    accentColor: '#E5A83B',
    tagline: 'Whirring brass gears, colorful sorting trays, and surprise rule switches',
    introDialogue: "Welcome to the Switch Lab! I'm Dr. Ada. In this lab, we sort cards by one rule, but then the bell chimes and the rule flips! Can your brain switch smoothly?",
    decorationsHtml: `
      <div class="mission-decorations">
        <span style="font-size: 1.8rem;" class="anim-mascot-think">⚙️</span>
        <span style="font-size: 1.4rem;" class="anim-float-slow">🔬</span>
      </div>
    `,
    stem: "First Rule was: <strong>Sort by COLOR (Green to Tray A, Yellow to Tray B)</strong>.<br>🔔 <em>*Ding!*</em> The Lab Alarm sounds! The NEW Rule is: <strong>Sort by SHAPE (Stars to Tray A, Circles to Tray B)</strong>.<br>Where does this <strong>Yellow Star</strong> go now?",
    hint: "Ignore the old color rule completely—focus only on whether it is a Star or a Circle!",
    visualHtml: `
      <div style="background: #FFFFFF; border: 2px solid #F3E0A2; border-radius: 20px; padding: 20px; max-width: 500px; margin: 16px auto; text-align: center;">
        <div style="background: #FFF0BE; display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; color: #8A5F0F; margin-bottom: 12px;">
          🔔 ACTIVE RULE: SORT BY SHAPE ONLY
        </div>
        <div style="display: flex; justify-content: center; align-items: center; gap: 24px; margin: 16px 0;">
          <div style="background: #FFFDF0; border: 2px dashed #E5A83B; border-radius: 14px; padding: 14px 20px; min-width: 130px;">
            <div style="font-size: 1.8rem;">⭐</div>
            <div style="font-weight: 800; color: #293347; font-size: 0.95rem;">Tray A</div>
            <div style="font-size: 0.75rem; color: #647184;">(All Stars)</div>
          </div>
          <div style="font-size: 1.5rem; color: #E5A83B;">⇄</div>
          <div style="background: #FFFDF0; border: 2px dashed #78BFA5; border-radius: 14px; padding: 14px 20px; min-width: 130px;">
            <div style="font-size: 1.8rem;">●</div>
            <div style="font-weight: 800; color: #293347; font-size: 0.95rem;">Tray B</div>
            <div style="font-size: 0.75rem; color: #647184;">(All Circles)</div>
          </div>
        </div>
        <div style="background: #FFF9F1; border: 2px solid #E5A83B; border-radius: 12px; padding: 12px; max-width: 220px; margin: 0 auto; box-shadow: 0 4px 12px rgba(229, 168, 59, 0.2);">
          <div style="font-size: 2.2rem; color: #F59E0B;">⭐</div>
          <div style="font-weight: 800; color: #293347;">Card: Yellow Star</div>
        </div>
      </div>
    `,
    options: [
      { id: 'opt-p3-1', text: "Tray A (Because it's a Star, following the new shape rule)", correct: true, trait: 'flexible-inhibitory-control', icon: '⭐' },
      { id: 'opt-p3-2', text: "Tray B (Because it's Yellow, following the old color rule)", correct: false, trait: 'perseveration-error', icon: '🟡' },
      { id: 'opt-p3-3', text: "Throw it in the scrap box", correct: false, trait: 'avoidance', icon: '📦' }
    ],
    reflectionPrompt: "When the rule flipped, what did you do?",
    reflectionOptions: [
      { id: 'ref-switch-clean', text: "I cleared the old rule from my mind and only looked at shape.", style: 'flexible-adaptive' },
      { id: 'ref-switch-hesitate', text: "My brain wanted to pick color first, but I caught myself!", style: 'monitored-control' },
      { id: 'ref-switch-tricky', text: "It felt tricky because the color yellow was so bright.", style: 'perceptual-sensitive' }
    ]
  },
  {
    id: 'mission-story-ship',
    index: 4,
    name: 'Story Ship',
    characterKey: 'lyra',
    characterName: 'Captain Lyra',
    characterRole: 'Story Navigator',
    object3D: 'celestial-astrolabe',
    object3dImg: 'assets/3d/object-story-ship.png',
    actionSubtitle: 'Read • Imagine • Explore',
    animClass: 'anim-3d-ship',
    illustration: 'assets/illustrations/story-ship-galleon.svg',
    dimension: 'Verbal Reasoning & Inference',
    dimensionKey: 'verbalReasoning',
    themeClass: 'theme-story-ship',
    icon: '⛵',
    accentColor: '#4B8DC9',
    tagline: 'Sailing over cloud seas with storybooks, compasses, and character riddles',
    introDialogue: "Ahoy on the Story Ship! I'm Captain Lyra. Reading between the lines is the greatest navigational tool. Let's inspect this captain's journal.",
    decorationsHtml: `
      <div class="mission-decorations">
        <span style="font-size: 1.8rem;" class="anim-float-slow">☁️</span>
        <span style="font-size: 1.4rem;" class="anim-float-reverse">📖</span>
      </div>
    `,
    stem: "Read this entry from Maya's ship journal:<br><em>'When the salty wind dropped, Maya put on her sun hat, wiped the perspiration from her forehead, and poured cool water from the clay jug into three cups for her crew.'</em><br>What can we infer about the weather?",
    hint: "Look at Maya's actions: sun hat, wiping her forehead, drinking cool water. What kind of weather causes all three?",
    visualHtml: `
      <div style="background: #FFFFFF; border: 2px solid #BEDAF7; border-radius: 20px; padding: 22px; max-width: 520px; margin: 16px auto;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid #DDEEFF; padding-bottom: 8px;">
          <span style="font-size: 1.5rem;">📜</span>
          <span style="font-weight: 800; color: #293347; font-size: 0.95rem;">Ship Log: The Cloud Archipelago</span>
        </div>
        <p style="font-family: var(--font-serif); font-size: 1.05rem; line-height: 1.6; color: #293347; background: #F8FBFE; padding: 14px; border-radius: 12px; border-left: 4px solid #4B8DC9;">
          "When the salty wind dropped, Maya put on her wide-brim sun hat, wiped the perspiration from her forehead, and poured cool lemon water from the clay jug into three cups for her crew."
        </p>
      </div>
    `,
    options: [
      { id: 'opt-p4-1', text: "It had become very hot and sunny at sea.", correct: true, trait: 'contextual-inference', icon: '☀️' },
      { id: 'opt-p4-2', text: "A sudden icy thunderstorm was approaching.", correct: false, trait: 'misunderstood-clues', icon: '⛈️' },
      { id: 'opt-p4-3', text: "It was midnight and freezing on the deck.", correct: false, trait: 'literal-drift', icon: '🌙' },
      { id: 'opt-p4-4', text: "The ship was trapped in thick fog.", correct: false, trait: 'unsupported-guess', icon: '🌫️' }
    ],
    reflectionPrompt: "How did you know it was hot without the story saying the word 'hot'?",
    reflectionOptions: [
      { id: 'ref-clue-chain', text: "I connected the clues: sun hat + sweat + cold drink.", style: 'deductive-synthesizer' },
      { id: 'ref-lived-exp', text: "I remembered how I feel when I play in the summer heat.", style: 'experiential-empathic' },
      { id: 'ref-fast-scan', text: "I saw 'sun hat' and that was enough to decide.", style: 'fast-cue-scanner' }
    ]
  },
  {
    id: 'mission-inventor-workshop',
    index: 5,
    name: "Inventor's Workshop",
    characterKey: 'milo',
    characterName: 'Milo',
    characterRole: 'Creative Maker',
    object3D: 'isometric-puzzle-cube',
    object3dImg: 'assets/3d/object-inventor-workshop.png',
    actionSubtitle: 'Create • Build • Solve',
    animClass: 'anim-3d-bulb',
    illustration: 'assets/illustrations/inventor-blueprint.svg',
    dimension: 'Creative Fluency & Divergent Thinking',
    dimensionKey: 'creativeFluency',
    themeClass: 'theme-inventor-workshop',
    icon: '💡',
    accentColor: '#E08554',
    tagline: 'Blueprints, cardboard gears, paper cups, and boundless imagination',
    introDialogue: "Welcome to the Inventor's Workshop! I'm Milo the Maker. Real inventors see ordinary objects and imagine ten different ways to use them. Let's see your creativity!",
    decorationsHtml: `
      <div class="mission-decorations">
        <span style="font-size: 1.8rem;" class="anim-float-slow">✂️</span>
        <span style="font-size: 1.4rem;" class="anim-float-reverse">📐</span>
      </div>
    `,
    stem: "Look at this plain paper cup and piece of string. A beginner only sees a drinking cup. What is the most inventive thing you could create with it?",
    hint: "Think about sound, games, gardening, or secret messages!",
    visualHtml: `
      <div style="background: #FFFFFF; border: 2px solid #F7D2BA; border-radius: 20px; padding: 20px; max-width: 480px; margin: 16px auto; text-align: center;">
        <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 14px;">
          <div style="background: #FFF5EE; border: 2px solid #E08554; border-radius: 14px; padding: 14px 20px;">
            <div style="font-size: 2.2rem;">🥤</div>
            <div style="font-size: 0.85rem; font-weight: 800; color: #293347;">2 Paper Cups</div>
          </div>
          <div style="font-size: 1.8rem; color: #E08554;">+</div>
          <div style="background: #FFF5EE; border: 2px solid #E08554; border-radius: 14px; padding: 14px 20px;">
            <div style="font-size: 2.2rem;">🧶</div>
            <div style="font-size: 0.85rem; font-weight: 800; color: #293347;">A Ball of String</div>
          </div>
        </div>
        <p style="font-size: 0.95rem; color: #647184;">Invention Challenge: Divergent Possibilities</p>
      </div>
    `,
    options: [
      { id: 'opt-p5-1', text: "A secret tin-can telephone to whisper across rooms", correct: true, trait: 'divergent-inventive', icon: '📞' },
      { id: 'opt-p5-2', text: "A seedling sprout pot with a wick that drinks water", correct: true, trait: 'divergent-ecological', icon: '🌱' },
      { id: 'opt-p5-3', text: "A mini pulley elevator to lift Lego figures up the sofa", correct: true, trait: 'divergent-engineering', icon: '🏗️' },
      { id: 'opt-p5-4', text: "Just drink tap water and throw it away", correct: false, trait: 'convergent-routine', icon: '🗑️' }
    ],
    reflectionPrompt: "When you look at plain things, how do ideas spark?",
    reflectionOptions: [
      { id: 'ref-play', text: "I picture a story or game where I need a new gadget.", style: 'playful-inventor' },
      { id: 'ref-problem', text: "I think about a real problem I want to solve at home.", style: 'practical-engineer' },
      { id: 'ref-art', text: "I see shapes, colors, and sculptures I can build.", style: 'artistic-maker' }
    ]
  },
  {
    id: 'mission-feelings-garden',
    index: 6,
    name: 'Feelings Garden',
    characterKey: 'flora',
    characterName: 'Flora',
    characterRole: 'Heart-Gardener',
    object3dImg: 'assets/3d/object-feelings-garden.png',
    actionSubtitle: 'Understand • Express • Care',
    animClass: 'anim-3d-flower',
    illustration: 'assets/illustrations/feelings-garden-blooms.svg',
    dimension: 'Social-Emotional Perception',
    dimensionKey: 'emotionalPerception',
    themeClass: 'theme-feelings-garden',
    icon: '🌸',
    accentColor: '#9275D9',
    tagline: 'Quiet blossoms that respond to empathy, care, and kind choices',
    introDialogue: "Welcome to Feelings Garden. I'm Flora! The flowers bloom when we listen closely to how others are feeling on the inside.",
    decorationsHtml: `
      <div class="mission-decorations">
        <span style="font-size: 1.8rem;" class="anim-float-slow">🌺</span>
        <span style="font-size: 1.4rem;" class="anim-float-reverse">🦋</span>
      </div>
    `,
    stem: "During art class, Leo accidentally spilled blue paint over his favorite drawing. He crosses his arms, looks down at the floor, and goes completely quiet. How is Leo feeling, and what would help?",
    hint: "Crossing arms and looking down often means someone feels disappointed or embarrassed, rather than loud and angry.",
    visualHtml: `
      <div style="background: #FFFFFF; border: 2px solid #D8CEF7; border-radius: 20px; padding: 20px; max-width: 500px; margin: 16px auto;">
        <div style="display: flex; align-items: center; gap: 16px; background: #F6F3FC; border-radius: 14px; padding: 14px; border: 1px solid #EAE4FF;">
          <div style="font-size: 2.5rem;">😔</div>
          <div>
            <div style="font-weight: 800; color: #293347; font-size: 1.05rem;">Leo at the Art Table</div>
            <div style="font-size: 0.9rem; color: #647184; margin-top: 2px;">
              Looking down quietly with spilled paint on his paper.
            </div>
          </div>
        </div>
      </div>
    `,
    options: [
      { id: 'opt-p6-1', text: "He feels sad and discouraged. Give him a warm smile and paper towels.", correct: true, trait: 'high-empathy-support', icon: '🤝' },
      { id: 'opt-p6-2', text: "He is furious. Tell the teacher he is about to shout.", correct: false, trait: 'misread-emotion', icon: '⚠️' },
      { id: 'opt-p6-3', text: "He doesn't care at all. Just walk away and ignore him.", correct: false, trait: 'indifference', icon: '🚶' },
      { id: 'opt-p6-4', text: "Laugh because blue paint looks funny.", correct: false, trait: 'low-empathy', icon: '😆' }
    ],
    reflectionPrompt: "What clue showed you what Leo needed?",
    reflectionOptions: [
      { id: 'ref-body-posture', text: "His body language: looking down and being quiet.", style: 'nonverbal-decoder' },
      { id: 'ref-perspective-take', text: "I imagined how I would feel if I spilled paint on my art.", style: 'perspective-taker' },
      { id: 'ref-kind-instinct', text: "Whenever a friend goes quiet, they usually need kindness.", style: 'intuitive-carer' }
    ]
  },
  {
    id: 'mission-friendship-fairness',
    index: 7,
    name: 'Friendship & Fairness',
    characterKey: 'leo_kai',
    characterName: 'Leo & Kai',
    characterRole: 'Collaborative Duo',
    object3dImg: 'assets/3d/object-friendship-fairness.png',
    actionSubtitle: 'Share • Choose • Be Kind',
    animClass: 'anim-3d-duo',
    illustration: 'assets/illustrations/fairness-balance.svg',
    dimension: 'Collaborative Ethics & Fair Play',
    dimensionKey: 'collaborativeFairness',
    themeClass: 'theme-friendship-fairness',
    icon: '🤝',
    accentColor: '#DE7D66',
    tagline: 'Treehouse playgrounds where sharing, turns, and teamwork rule the day',
    introDialogue: "Welcome to Friendship & Fairness! We're Leo and Kai. Good explorers know that games are only fun when everyone feels included and treated fairly.",
    decorationsHtml: `
      <div class="mission-decorations">
        <span style="font-size: 1.8rem;" class="anim-float-slow">🎈</span>
        <span style="font-size: 1.4rem;" class="anim-float-reverse">🌳</span>
      </div>
    `,
    stem: "There is only one telescope on the observation deck, and four friends all want to look at the comet before bedtime. What is the fairest solution?",
    hint: "Fairness means equal opportunity and working together so no one is left out!",
    visualHtml: `
      <div style="background: #FFFFFF; border: 2px solid #F9D8C8; border-radius: 20px; padding: 20px; max-width: 500px; margin: 16px auto; text-align: center;">
        <div style="font-size: 2.8rem; margin-bottom: 8px;">🔭</div>
        <div style="font-weight: 800; color: #293347; font-size: 1.1rem; margin-bottom: 4px;">1 Telescope • 4 Curious Explorers</div>
        <div style="display: flex; justify-content: center; gap: 12px; margin-top: 10px;">
          <span style="font-size: 1.8rem;">🧒</span>
          <span style="font-size: 1.8rem;">👧</span>
          <span style="font-size: 1.8rem;">👦</span>
          <span style="font-size: 1.8rem;">🧒</span>
        </div>
      </div>
    `,
    options: [
      { id: 'opt-p7-1', text: "Set a 2-minute sand timer so everyone gets equal turns, then share what they saw.", correct: true, trait: 'equitable-rule-builder', icon: '⏳' },
      { id: 'opt-p7-2', text: "Whoever grabbed the telescope first keeps it all night.", correct: false, trait: 'finders-keepers', icon: '✋' },
      { id: 'opt-p7-3', text: "Pack the telescope away so nobody gets to look.", correct: false, trait: 'punitive-avoidance', icon: '🔒' },
      { id: 'opt-p7-4', text: "Only let the person who knows the most about space look.", correct: false, trait: 'elitist-preference', icon: '⭐' }
    ],
    reflectionPrompt: "Why does using a timer make games feel fair?",
    reflectionOptions: [
      { id: 'ref-equal-time', text: "Because everyone gets the exact same chance.", style: 'rule-fairness' },
      { id: 'ref-no-argue', text: "It stops fighting before anyone gets upset.", style: 'harmony-preserver' },
      { id: 'ref-fun-shared', text: "Sharing what you saw together makes it more fun.", style: 'community-builder' }
    ]
  },
  {
    id: 'mission-learning-detective',
    index: 8,
    name: 'The Learning Detective',
    characterKey: 'barnaby',
    characterName: 'Barnaby',
    characterRole: 'Learning Detective',
    object3dImg: 'assets/3d/object-learning-detective.png',
    actionSubtitle: 'Discover • Reflect • Shine',
    animClass: 'anim-3d-telescope',
    illustration: 'assets/illustrations/detective-clues.svg',
    dimension: 'Deductive Logic & Metacognition',
    dimensionKey: 'deductiveLogic',
    themeClass: 'theme-learning-detective',
    icon: '🔍',
    accentColor: '#5E7E89',
    tagline: 'Ancient maps, magnifying glasses, and discovering how your own mind works',
    introDialogue: "Welcome to the final mission: The Learning Detective! I'm Barnaby. You've navigated seven islands. Now combine all your clues to unlock the Compass Vault!",
    decorationsHtml: `
      <div class="mission-decorations">
        <span style="font-size: 1.8rem;" class="anim-float-slow">🧭</span>
        <span style="font-size: 1.4rem;" class="anim-float-reverse">🗝️</span>
      </div>
    `,
    stem: "To open the Compass Vault, you need the right key. Look at Detective Pip's notebook:<br>1. <em>The Vault key is NOT round.</em><br>2. <em>The Vault key has MORE than 3 teeth.</em><br>3. <em>The Vault key is made of bronze (golden-brown).</em><br>Which key unlocks the vault?",
    hint: "Rule out keys one-by-one: eliminate round keys first, then count teeth, then check material!",
    visualHtml: `
      <div style="background: #FFFFFF; border: 2px solid #D8DFE4; border-radius: 20px; padding: 20px; max-width: 520px; margin: 16px auto;">
        <div style="background: #FAF6ED; border-left: 4px solid #5E7E89; padding: 12px 16px; border-radius: 8px; margin-bottom: 14px;">
          <div style="font-weight: 800; color: #293347; font-size: 0.95rem; margin-bottom: 6px;">📋 Detective Clue Sheet:</div>
          <div style="font-size: 0.9rem; color: #647184; display: flex; flex-direction: column; gap: 4px;">
            <span>• Not round head</span>
            <span>• More than 3 teeth (4 or 5)</span>
            <span>• Golden Bronze material</span>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
          <div style="background: #F4FAF7; border: 1.5px solid #A3D9BD; border-radius: 10px; padding: 8px;">
            <div style="font-size: 2rem;">🔑</div>
            <div style="font-size: 0.75rem; font-weight: 700;">Key A (Round Silver, 4 teeth)</div>
          </div>
          <div style="background: #FFFDF0; border: 2px solid #E5A83B; border-radius: 10px; padding: 8px;">
            <div style="font-size: 2rem;">🗝️</div>
            <div style="font-size: 0.75rem; font-weight: 700;">Key B (Square Bronze, 4 teeth)</div>
          </div>
          <div style="background: #FFF5EE; border: 1.5px solid #F7D2BA; border-radius: 10px; padding: 8px;">
            <div style="font-size: 2rem;">🗝️</div>
            <div style="font-size: 0.75rem; font-weight: 700;">Key C (Square Bronze, 2 teeth)</div>
          </div>
        </div>
      </div>
    `,
    options: [
      { id: 'opt-p8-2', text: "Key B (Square head, Bronze, 4 teeth)", correct: true, trait: 'multi-constraint-solver', icon: '🗝️' },
      { id: 'opt-p8-1', text: "Key A (Silver with round head)", correct: false, trait: 'ignored-head-rule', icon: '🔑' },
      { id: 'opt-p8-3', text: "Key C (Only has 2 teeth)", correct: false, trait: 'ignored-count-rule', icon: '🗝️' }
    ],
    reflectionPrompt: "Final Reflection: Which mission did your brain enjoy the most today?",
    reflectionOptions: [
      { id: 'ref-patterns', text: "Puzzles and patterns (like Pattern Planet and Switch Lab)", style: 'pattern-seeker' },
      { id: 'ref-stories', text: "Stories and people (like Story Ship and Feelings Garden)", style: 'narrative-empath' },
      { id: 'ref-making', text: "Invention and detective clues (like Workshop and Keys)", style: 'investigative-creator' }
    ]
  }
];
