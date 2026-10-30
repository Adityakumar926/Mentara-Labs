/**
 * Mentp Learning Compass | Comprehensive Educational Report Engine
 * 
 * Rebuilds report-generation logic to produce an authentic, evidence-led,
 * individually written educational assessment from an experienced primary educator's perspective.
 * 
 * Complies strictly with the 9 required report sections:
 * 1. Learning Compass Summary (Executive overview)
 * 2. What We Observed (The Child's Learning Story)
 * 3. Demonstrated Strengths (Evidence-backed)
 * 4. Skills to Practise Next (Constructive & actionable)
 * 5. Detailed Breakdown of all 8 Dimensions (Explored, Demonstrated, Suggests, Practise, Home Activity, Mentp Resource)
 * 6. Personalised Mentp Learning Roadmap (Sequenced Presentation -> Simulation -> Game -> Worksheet)
 * 7. Parent Guidance ("How You Can Support Learning at Home")
 * 8. Future Progress Check (Measurable criteria)
 * 9. Assessment Methodology and Limitations (Formative pedagogy disclosure)
 */

import { EIGHT_MISSIONS } from '../content/eight-missions.js';

export const ReportEngine = {
  VERSION: '2.4-cambridge-primary',

  /**
   * Pre-configured realistic test profiles for verification & testing
   */
  TEST_PROFILES: {
    'profile-a': {
      childName: 'Alex',
      stage: 3,
      ageBand: '7-9',
      answers: {
        'mission-pattern-planet': {
          missionId: 'mission-pattern-planet',
          dimensionKey: 'spatialIntuition',
          selectedOption: { id: 'opt-p1-1', text: 'Triangle with diamond center', correct: true, trait: 'spatial-systematic' },
          confidence: 3,
          latencyMs: 7200,
          hintUsed: false
        },
        'mission-memory-forest': {
          missionId: 'mission-memory-forest',
          dimensionKey: 'workingMemory',
          selectedOption: { id: 'opt-p2-1', text: 'The Badger', correct: true, trait: 'sequential-deduction' },
          confidence: 2,
          latencyMs: 11400,
          hintUsed: false
        },
        'mission-switch-lab': {
          missionId: 'mission-switch-lab',
          dimensionKey: 'cognitiveFlexibility',
          selectedOption: { id: 'opt-p3-2', text: 'Tray B (Because it\'s Yellow, following the old color rule)', correct: false, trait: 'perseveration-error' },
          confidence: 2,
          latencyMs: 8900,
          hintUsed: true
        },
        'mission-story-ship': {
          missionId: 'mission-story-ship',
          dimensionKey: 'verbalReasoning',
          selectedOption: { id: 'opt-p4-1', text: 'It had become very hot and sunny at sea.', correct: true, trait: 'contextual-inference' },
          confidence: 3,
          latencyMs: 9200,
          hintUsed: false
        },
        'mission-inventor-workshop': {
          missionId: 'mission-inventor-workshop',
          dimensionKey: 'creativeFluency',
          selectedOption: { id: 'opt-p5-1', text: 'A secret tin-can telephone to whisper across rooms', correct: true, trait: 'divergent-inventive' },
          confidence: 3,
          latencyMs: 6500,
          hintUsed: false
        },
        'mission-feelings-garden': {
          missionId: 'mission-feelings-garden',
          dimensionKey: 'emotionalPerception',
          selectedOption: { id: 'opt-p6-1', text: 'He feels sad and discouraged. Give him a warm smile and paper towels.', correct: true, trait: 'high-empathy-support' },
          confidence: 3,
          latencyMs: 5800,
          hintUsed: false
        },
        'mission-friendship-fairness': {
          missionId: 'mission-friendship-fairness',
          dimensionKey: 'collaborativeFairness',
          selectedOption: { id: 'opt-p7-1', text: 'Set a 2-minute sand timer so everyone gets equal turns, then share what they saw.', correct: true, trait: 'equitable-rule-builder' },
          confidence: 3,
          latencyMs: 8100,
          hintUsed: false
        },
        'mission-learning-detective': {
          missionId: 'mission-learning-detective',
          dimensionKey: 'deductiveLogic',
          selectedOption: { id: 'opt-p8-2', text: 'Key B (Square head, Bronze, 4 teeth)', correct: true, trait: 'multi-constraint-solver' },
          confidence: 3,
          latencyMs: 14200,
          hintUsed: false
        }
      }
    },

    'profile-b': {
      childName: 'Sam',
      stage: 3,
      ageBand: '7-9',
      answers: {
        'mission-pattern-planet': {
          missionId: 'mission-pattern-planet',
          dimensionKey: 'spatialIntuition',
          selectedOption: { id: 'opt-p1-2', text: 'Triangle with dot center', correct: false, trait: 'row-slip' },
          confidence: 2,
          latencyMs: 12500,
          hintUsed: true
        },
        'mission-memory-forest': {
          missionId: 'mission-memory-forest',
          dimensionKey: 'workingMemory',
          selectedOption: { id: 'opt-p2-3', text: 'The Fox', correct: false, trait: 'recency-bias' },
          confidence: 1,
          latencyMs: 16800,
          hintUsed: true
        },
        'mission-switch-lab': {
          missionId: 'mission-switch-lab',
          dimensionKey: 'cognitiveFlexibility',
          selectedOption: { id: 'opt-p3-1', text: 'Tray A (Because it\'s a Star, following the new shape rule)', correct: true, trait: 'flexible-inhibitory-control' },
          confidence: 3,
          latencyMs: 6400,
          hintUsed: false
        },
        'mission-story-ship': {
          missionId: 'mission-story-ship',
          dimensionKey: 'verbalReasoning',
          selectedOption: { id: 'opt-p4-1', text: 'It had become very hot and sunny at sea.', correct: true, trait: 'contextual-inference' },
          confidence: 3,
          latencyMs: 5900,
          hintUsed: false
        },
        'mission-inventor-workshop': {
          missionId: 'mission-inventor-workshop',
          dimensionKey: 'creativeFluency',
          selectedOption: { id: 'opt-p5-3', text: 'A mini pulley elevator to lift Lego figures up the sofa', correct: true, trait: 'divergent-engineering' },
          confidence: 3,
          latencyMs: 5100,
          hintUsed: false
        },
        'mission-feelings-garden': {
          missionId: 'mission-feelings-garden',
          dimensionKey: 'emotionalPerception',
          selectedOption: { id: 'opt-p6-1', text: 'He feels sad and discouraged. Give him a warm smile and paper towels.', correct: true, trait: 'high-empathy-support' },
          confidence: 3,
          latencyMs: 7100,
          hintUsed: false
        },
        'mission-friendship-fairness': {
          missionId: 'mission-friendship-fairness',
          dimensionKey: 'collaborativeFairness',
          selectedOption: { id: 'opt-p7-1', text: 'Set a 2-minute sand timer so everyone gets equal turns, then share what they saw.', correct: true, trait: 'equitable-rule-builder' },
          confidence: 2,
          latencyMs: 9400,
          hintUsed: false
        },
        'mission-learning-detective': {
          missionId: 'mission-learning-detective',
          dimensionKey: 'deductiveLogic',
          selectedOption: { id: 'opt-p8-2', text: 'Key B (Square head, Bronze, 4 teeth)', correct: true, trait: 'multi-constraint-solver' },
          confidence: 2,
          latencyMs: 15300,
          hintUsed: false
        }
      }
    }
  },

  /**
   * Verified Mentp Curriculum Resource Catalogue
   * Aligned to Cambridge Primary Thinking Skills & Stages
   */
  RESOURCE_CATALOG: {
    spatialIntuition: {
      presentation: {
        title: 'Exploring Symmetry, Grids and 2D Transformations',
        type: 'Classroom Deck',
        badge: 'Interactive Presentation',
        url: 'https://mentp.com/presentations/stage3/spatial-transformations',
        description: 'An interactive 12-slide visual lesson introducing row and column rules, rotation, and matrix coordinate thinking.',
        concept: 'Two-dimensional matrix coordinates and transformation rules'
      },
      simulation: {
        title: 'Mentp Visual Matrix & Pattern Balancer',
        type: 'Simulation',
        badge: 'Interactive Lab',
        url: 'https://mentp.com/simulations/stage3/math-explorers',
        description: 'A dynamic visual workspace where children place, rotate, and test multi-attribute shapes on grid matrices.',
        concept: 'Simultaneous inspection of shape, color, and interior attributes'
      },
      game: {
        title: 'Crystal Constellation Grid Run',
        type: 'Thinking Game',
        badge: 'Online Activity',
        url: 'https://mentp.com/games/stage3/constellation-patterns',
        description: 'A timed puzzle challenge completing missing planetary constellations with escalating attribute complexity.',
        concept: 'Rapid systematic identification of matrix relationships'
      },
      worksheet: {
        title: 'Stage 3 Spatial Matrix Grids & Pattern Sets',
        type: 'Worksheet Set',
        badge: 'Printable Practice',
        url: 'https://mentp.com/worksheets/stage3/spatial-matrix-grids',
        description: 'Structured 10-minute printable exercises with 3×3 matrix completion challenges and explanation boxes.',
        concept: 'Paper-based step-by-step verification of matrix clues'
      }
    },

    workingMemory: {
      presentation: {
        title: 'Mental Chaining: Holding Multi-Step Directions',
        type: 'Classroom Deck',
        badge: 'Interactive Presentation',
        url: 'https://mentp.com/presentations/stage3/working-memory-strategies',
        description: 'Visual strategies for chunking, sub-vocalizing, and tracking chronological order in word problems.',
        concept: 'Sequential chunking and internal timeline formation'
      },
      simulation: {
        title: 'Mentp Chrono-Train Timeline Builder',
        type: 'Simulation',
        badge: 'Interactive Lab',
        url: 'https://mentp.com/simulations/stage3/timeline-builder',
        description: 'Interactive track builder where learners drag animal cars into chronological order based on relative word cues.',
        concept: 'Translating comparative relational statements (after/before) into spatial order'
      },
      game: {
        title: 'Forest Trail Tracker: 3-Step Sequence',
        type: 'Thinking Game',
        badge: 'Online Activity',
        url: 'https://mentp.com/games/stage3/sequence-tracker',
        description: 'A woodland adventure game requiring players to hold 3 to 4 sequential conditions in memory while navigating obstacles.',
        concept: 'Maintaining sequential rules under increasing operational load'
      },
      worksheet: {
        title: 'Stage 3 Multi-Step Direction Worksheets',
        type: 'Worksheet Set',
        badge: 'Printable Practice',
        url: 'https://mentp.com/worksheets/stage3/multi-step-sequencing',
        description: 'Printable reading logic tasks requiring learners to map who came first, second, and third using two-clue signposts.',
        concept: 'Independent written verification of multi-step sequence problems'
      }
    },

    cognitiveFlexibility: {
      presentation: {
        title: 'Switching Gears: When the Rule Changes',
        type: 'Classroom Deck',
        badge: 'Interactive Presentation',
        url: 'https://mentp.com/presentations/stage3/cognitive-flexibility-rules',
        description: 'Illustrated guide showing how scientists and mathematicians discard outdated assumptions when new evidence appears.',
        concept: 'Inhibiting previous classification criteria and adopting new rules'
      },
      simulation: {
        title: 'Mentp Sorting Lab: Dual-Attribute Shift',
        type: 'Simulation',
        badge: 'Interactive Lab',
        url: 'https://mentp.com/simulations/stage3/gear-and-switch-lab',
        description: 'Interactive sorting bins that dynamically toggle between color, shape, and size sorting rules on a chime signal.',
        concept: 'Real-time cognitive inhibition and rule transition practice'
      },
      game: {
        title: 'The Chameleon Card Switch',
        type: 'Thinking Game',
        badge: 'Online Activity',
        url: 'https://mentp.com/games/stage3/chameleon-switch',
        description: 'Fast-paced sorting game where unexpected buzzer chimes signal immediate rule switches between shapes and colors.',
        concept: 'Inhibitory control under engaging game play conditions'
      },
      worksheet: {
        title: 'Flexible Sorting & Rule Shift Challenge Sheets',
        type: 'Worksheet Set',
        badge: 'Printable Practice',
        url: 'https://mentp.com/worksheets/stage3/rule-switching-challenges',
        description: 'Written activities asking learners to sort the same set of items according to two completely different criteria.',
        concept: 'Articulating multiple valid grouping criteria for identical data sets'
      }
    },

    verbalReasoning: {
      presentation: {
        title: 'Detective Reading: Finding Unwritten Clues',
        type: 'Classroom Deck',
        badge: 'Interactive Presentation',
        url: 'https://mentp.com/presentations/stage3/reading-inferences',
        description: 'Step-by-step walkthrough showing how sensory words and character actions reveal setting and mood.',
        concept: 'Inferring implied conditions from sensory vocabulary'
      },
      simulation: {
        title: 'Mentp Story Explorer: Context Sleuth',
        type: 'Simulation',
        badge: 'Interactive Lab',
        url: 'https://mentp.com/simulations/stage3/story-explorer',
        description: 'Interactive text passage where clicking descriptive words (perspiration, wide brim) reveals background climate dials.',
        concept: 'Connecting textual evidence to real-world cause-and-effect'
      },
      game: {
        title: 'The Cloud Galleon Riddle Hunt',
        type: 'Thinking Game',
        badge: 'Online Activity',
        url: 'https://mentp.com/games/stage3/riddle-hunt',
        description: 'Navigate an aerial ship across islands by unlocking clues where the answer is implied but never explicitly named.',
        concept: 'Synthesizing subtle contextual clues into accurate deductions'
      },
      worksheet: {
        title: 'Reading Between the Lines: Context Inferences',
        type: 'Worksheet Set',
        badge: 'Printable Practice',
        url: 'https://mentp.com/worksheets/stage3/narrative-inferences',
        description: 'Short 5-sentence vignettes paired with prompt questions: What season is it? How does the character feel? What is the proof?',
        concept: 'Citing textual evidence for subjective inferences'
      }
    },

    creativeFluency: {
      presentation: {
        title: 'The Inventor’s Mindset: 10 Uses for Everyday Objects',
        type: 'Classroom Deck',
        badge: 'Interactive Presentation',
        url: 'https://mentp.com/presentations/stage3/divergent-thinking',
        description: 'Showcasing famous inventions born from ordinary materials like cardboard, string, and bottle caps.',
        concept: 'Overcoming functional fixedness and developing divergent fluency'
      },
      simulation: {
        title: 'Mentp Virtual Makerspace & Tinker Lab',
        type: 'Simulation',
        badge: 'Interactive Lab',
        url: 'https://mentp.com/simulations/stage3/virtual-makerspace',
        description: 'A 3D sandbox allowing children to combine everyday objects (cups, string, pulleys) to build functioning contraptions.',
        concept: 'Testing original engineering ideas in a physics-enabled sandbox'
      },
      game: {
        title: 'Invention Sprint: 3 Ideas in 60 Seconds',
        type: 'Thinking Game',
        badge: 'Online Activity',
        url: 'https://mentp.com/games/stage3/divergent-workshop',
        description: 'A playful creative prompt game challenging learners to propose unusual functional applications for simple items.',
        concept: 'Rapid idea generation without immediate self-censorship'
      },
      worksheet: {
        title: 'Stage 3 Blueprint Maker & Invention Sheets',
        type: 'Worksheet Set',
        badge: 'Printable Practice',
        url: 'https://mentp.com/worksheets/stage3/inventor-blueprints',
        description: 'Guided drafting templates for drawing a new machine, labelling parts, and explaining what problem it solves.',
        concept: 'Structuring and elaborating creative ideas into testable designs'
      }
    },

    emotionalPerception: {
      presentation: {
        title: 'The Language of Faces, Posture and Voice',
        type: 'Classroom Deck',
        badge: 'Interactive Presentation',
        url: 'https://mentp.com/presentations/stage3/social-emotional-cues',
        description: 'Observing subtle body cues like averted gaze, crossed arms, and silence to understand how classmates feel.',
        concept: 'Decoding nonverbal emotional signals and choosing supportive actions'
      },
      simulation: {
        title: 'Mentp Empathy Garden: Emotion Simulator',
        type: 'Simulation',
        badge: 'Interactive Lab',
        url: 'https://mentp.com/simulations/stage3/empathy-garden',
        description: 'Interactive social scenarios where children choose responses and watch how peer characters react and bloom.',
        concept: 'Observing interpersonal consequences of empathic vs. dismissive actions'
      },
      game: {
        title: 'Heart Detectives: Classroom Compassion',
        type: 'Thinking Game',
        badge: 'Online Activity',
        url: 'https://mentp.com/games/stage3/heart-detectives',
        description: 'Mini-stories where players spot classmates facing small setbacks and select the most constructive way to help.',
        concept: 'Applying practical social support in natural peer situations'
      },
      worksheet: {
        title: 'Perspective Taking & Empathetic Response Journal',
        type: 'Worksheet Set',
        badge: 'Printable Practice',
        url: 'https://mentp.com/worksheets/stage3/empathy-journal',
        description: 'Reflective drawing and writing prompts: "What happened?", "How might they feel inside?", "What could I say?"',
        concept: 'Developing reflective empathy through structured reflection'
      }
    },

    collaborativeFairness: {
      presentation: {
        title: 'Fair Play, Turn-Taking and Sharing Resources',
        type: 'Classroom Deck',
        badge: 'Interactive Presentation',
        url: 'https://mentp.com/presentations/stage3/fair-play-ethics',
        description: 'Exploring fairness beyond "first come, first served"—including timers, rotational sharing, and collaborative tasks.',
        concept: 'Distinguishing equitable access from arbitrary or exclusionary rules'
      },
      simulation: {
        title: 'Mentp Resource Balancer: Playground Dilemmas',
        type: 'Simulation',
        badge: 'Interactive Lab',
        url: 'https://mentp.com/simulations/stage3/resource-balancer',
        description: 'Simulate classroom playground situations with limited equipment (1 swing, 4 kids) and test resolution systems.',
        concept: 'Evaluating procedural justice and consensus-building mechanisms'
      },
      game: {
        title: 'Cooperative Island: Teamwork Challenge',
        type: 'Thinking Game',
        badge: 'Online Activity',
        url: 'https://mentp.com/games/stage3/cooperative-island',
        description: 'Multi-character cooperative game where success requires coordinating roles and ensuring fair participation.',
        concept: 'Practising turn-taking and mutual accountability in play'
      },
      worksheet: {
        title: 'Fairness Dilemmas: Problem Solving in Groups',
        type: 'Worksheet Set',
        badge: 'Printable Practice',
        url: 'https://mentp.com/worksheets/stage3/fairness-dilemmas',
        description: 'Case studies for discussion: What would you do if there is only one football? Write three different fair options.',
        concept: 'Articulating balanced ethical criteria for group decisions'
      }
    },

    deductiveLogic: {
      presentation: {
        title: 'The Detective’s Notebook: Multi-Clue Elimination',
        type: 'Classroom Deck',
        badge: 'Interactive Presentation',
        url: 'https://mentp.com/presentations/stage3/deductive-elimination',
        description: 'How to use an elimination grid to test clues one by one and systematically rule out impossible options.',
        concept: 'Cross-attribute constraint satisfaction and methodical elimination'
      },
      simulation: {
        title: 'Mentp Vault Lock Mystery: Interactive Grid',
        type: 'Simulation',
        badge: 'Interactive Lab',
        url: 'https://mentp.com/simulations/stage3/vault-lock-grid',
        description: 'An interactive matrix where children cross out suspect keys as each constraint rule is confirmed.',
        concept: 'Visualizing deductive elimination on a multi-property matrix'
      },
      game: {
        title: 'The Master Key Investigation',
        type: 'Thinking Game',
        badge: 'Online Activity',
        url: 'https://mentp.com/games/stage3/master-key-game',
        description: 'Solve mystery lock combinations using three distinct clues: material, shape, and tooth count under time pressure.',
        concept: 'Applying simultaneous negative and positive constraints'
      },
      worksheet: {
        title: 'Stage 3 Multi-Clue Deductive Logic Puzzles',
        type: 'Worksheet Set',
        badge: 'Printable Practice',
        url: 'https://mentp.com/worksheets/stage3/deductive-clues',
        description: 'Classic logic grids with clues like "Sam did not wear blue; the winner had stripes". Checkmarks and crosses practice.',
        concept: 'Independent mastery of formal elimination grids'
      }
    }
  },

  /**
   * Generates the complete, structured report data model from raw assessment state
   */
  generateReport(rawState) {
    const childName = (rawState && rawState.childName && rawState.childName.trim()) || 'Your Child';
    const stage = rawState && rawState.stage ? rawState.stage : 3;
    const ageBand = rawState && rawState.ageBand ? rawState.ageBand : '7-9';
    const answers = (rawState && rawState.answers) || {};
    const timestamp = rawState && rawState.timestamp ? rawState.timestamp : Date.now();
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(timestamp));

    // Evaluate each of the 8 missions
    const dimensionEvaluations = EIGHT_MISSIONS.map(mission => {
      const record = answers[mission.id];
      return this.evaluateMissionPerformance(mission, record, childName);
    });

    // Identify demonstrated strengths vs. practice priorities based on authentic rubric
    const confirmedStrengths = dimensionEvaluations.filter(d => d.performanceLevel === 'demonstrated-independent');
    const assistedStrengths = dimensionEvaluations.filter(d => d.performanceLevel === 'demonstrated-guided');
    const practicePriorities = dimensionEvaluations.filter(d => d.performanceLevel === 'developing');
    const inconclusive = dimensionEvaluations.filter(d => d.performanceLevel === 'inconclusive');

    // Rank top strengths: independent first, then assisted
    const rankedStrengths = [...confirmedStrengths, ...assistedStrengths];
    const topStrengths = rankedStrengths.slice(0, 3);
    const topPractice = practicePriorities.length > 0 
      ? practicePriorities.slice(0, 2) 
      : (assistedStrengths.length > 0 ? assistedStrengths.slice(0, 2) : [dimensionEvaluations[1]]);

    // Construct the educator's narrative learning story
    const learningStory = this.buildLearningStory(childName, stage, topStrengths, topPractice, dimensionEvaluations);

    // Build the executive summary for busy parents
    const executiveSummary = this.buildExecutiveSummary(childName, topStrengths, topPractice, dimensionEvaluations);

    // Curate the personalized learning roadmap with 3-4 sequenced resources
    const learningRoadmap = this.buildPersonalizedRoadmap(topPractice, topStrengths, childName);

    // Build practical parent guidance home routines
    const parentGuidance = this.buildParentGuidance(topPractice, topStrengths, childName);

    // Build measurable future progress check criteria
    const progressCheck = this.buildProgressCheck(topPractice, topStrengths, childName);

    return {
      childName,
      stage,
      ageBand,
      version: this.VERSION,
      dateString: formattedDate,
      timestamp,
      dimensionEvaluations,
      topStrengths,
      topPractice,
      inconclusive,
      executiveSummary,
      learningStory,
      learningRoadmap,
      parentGuidance,
      progressCheck
    };
  },

  /**
   * Evaluates performance on a single mission based on evidence rubric
   */
  evaluateMissionPerformance(mission, record, childName) {
    if (!record || !record.selectedOption) {
      return {
        missionId: mission.id,
        missionIndex: mission.index,
        missionName: mission.name,
        characterName: mission.characterName,
        object3dImg: mission.object3dImg,
        animClass: mission.animClass,
        dimensionName: mission.dimension,
        dimensionKey: mission.dimensionKey,
        icon: mission.icon,
        performanceLevel: 'inconclusive',
        statusLabel: 'More evidence needed',
        statusClass: 'status-inconclusive',
        evidenceNote: 'This activity was not completed during the session.',
        whatExplored: this.getExploredSummary(mission.dimensionKey),
        whatDemonstrated: 'No recorded response was submitted for this level.',
        whatThisSuggests: 'We cannot draw inferences regarding this skill without an attempted activity.',
        whatToPractise: 'Attempting the level will help identify baseline familiarity.',
        practicalActivity: this.getHomeActivity(mission.dimensionKey, childName),
        resource: this.RESOURCE_CATALOG[mission.dimensionKey]?.presentation || null
      };
    }

    const { selectedOption, latencyMs, hintUsed } = record;
    const isCorrect = !!selectedOption.correct;
    const trait = selectedOption.trait || '';
    const hasHint = !!hintUsed;

    let performanceLevel = 'developing';
    let statusLabel = 'Developing through practice';
    let statusClass = 'status-developing';

    if (isCorrect && !hasHint) {
      performanceLevel = 'demonstrated-independent';
      statusLabel = 'Demonstrated independently';
      statusClass = 'status-demonstrated';
    } else if (isCorrect && hasHint) {
      performanceLevel = 'demonstrated-guided';
      statusLabel = 'Demonstrated with guided clue';
      statusClass = 'status-guided';
    } else {
      performanceLevel = 'developing';
      statusLabel = 'Developing through practice';
      statusClass = 'status-developing';
    }

    // Generate specific evidence note and authentic educator interpretation
    const analysis = this.generateDimensionalAnalysis(mission.dimensionKey, isCorrect, hasHint, trait, childName, latencyMs, selectedOption);

    return {
      missionId: mission.id,
      missionIndex: mission.index,
      missionName: mission.name,
      characterName: mission.characterName,
      object3dImg: mission.object3dImg,
      animClass: mission.animClass,
      dimensionName: mission.dimension,
      dimensionKey: mission.dimensionKey,
      icon: mission.icon,
      performanceLevel,
      statusLabel,
      statusClass,
      evidenceNote: analysis.evidenceNote,
      whatExplored: analysis.whatExplored,
      whatDemonstrated: analysis.whatDemonstrated,
      whatThisSuggests: analysis.whatThisSuggests,
      whatToPractise: analysis.whatToPractise,
      practicalActivity: analysis.practicalActivity,
      resource: analysis.resource
    };
  },

  /**
   * Generates specific pedagogical text for each of the 8 dimensions
   */
  generateDimensionalAnalysis(dimKey, isCorrect, hasHint, trait, childName, latencyMs, selectedOption) {
    const catalog = this.RESOURCE_CATALOG[dimKey];

    switch (dimKey) {
      case 'spatialIntuition':
        if (isCorrect && !hasHint) {
          return {
            whatExplored: 'A 3×3 matrix challenge requiring simultaneous coordination of outer geometric frames (by column) and interior symbols (by row).',
            whatDemonstrated: `${childName} systematically examined both row and column variations to choose the triangle with the diamond center on the first attempt without requesting a clue.`,
            evidenceNote: `Completed the 3×3 matrix independently without clues. Response time: ${(latencyMs/1000).toFixed(1)}s.`,
            whatThisSuggests: `Demonstrates reliable visual tracking across multiple dimensions. In classroom math, this supports coordinate geometry, chart reading, and recognizing repeating patterns.`,
            whatToPractise: `Gradually introduce matrix puzzles involving 90-degree rotations, color gradations, and three-layer overlapping shapes.`,
            practicalActivity: {
              title: 'Kitchen Grid Sorting',
              duration: '8 minutes',
              instruction: `Draw a 2×2 or 3×3 grid on paper. Place cutlery or colored building bricks across rows by color and down columns by size. Ask ${childName} to fill the empty corner.`,
              promptQuestion: `“What stays the same as you look across this row, and what changes when you move down the column?”`,
              lookFor: `${childName} explaining the rule aloud before pointing to the missing item.`
            },
            resource: catalog.simulation
          };
        } else if (isCorrect && hasHint) {
          return {
            whatExplored: 'A 3×3 matrix challenge requiring simultaneous coordination of outer geometric frames and interior symbols.',
            whatDemonstrated: `${childName} checked the hint before confirming the triangle with diamond center, showing good receptiveness to guided scaffolding.`,
            evidenceNote: `Identified the correct matrix solution after accessing Pip's clue.`,
            whatThisSuggests: `Benefits from a gentle reminder to check both dimensions rather than guessing impulsively. With structured scanning habits, spatial confidence grows quickly.`,
            whatToPractise: `Developing an explicit two-step scanning routine: "Step 1: Check outer shape. Step 2: Check inside mark."`,
            practicalActivity: {
              title: 'Two-Pass Grid Sleuth',
              duration: '5 minutes',
              instruction: `When looking at a puzzle or chart, guide ${childName} to make two distinct passes: one for the outer shape and one for the internal symbol.`,
              promptQuestion: `“Let's check the outside first. What do you notice? Now let's look inside.”`,
              lookFor: `${childName} deliberately pausing between outer and inner checks.`
            },
            resource: catalog.presentation
          };
        } else {
          const detail = trait === 'row-slip' ? 'selected the correct triangle frame but matched the dot instead of the diamond' : 'focused on one visual feature while overlooking the second constraint';
          return {
            whatExplored: 'A 3×3 matrix challenge requiring simultaneous coordination of outer geometric frames and interior symbols.',
            whatDemonstrated: `${childName} ${detail}, showing that holding two changing rules simultaneously is an active area of growth.`,
            evidenceNote: `Selected an option matching one constraint while slipping on the second.`,
            whatThisSuggests: `A natural stage in primary cognitive development: children often anchor on one dominant feature (e.g. the outer triangle) before verifying the secondary feature.`,
            whatToPractise: `Practising simple two-attribute sorting using concrete blocks or paper cut-outs before moving to complex abstract grids.`,
            practicalActivity: {
              title: 'Attribute Block Sorting',
              duration: '10 minutes',
              instruction: `Use building bricks of two shapes and two colors. Ask ${childName} to sort them into 4 distinct piles (e.g., Red Squares, Blue Squares, Red Rectangles, Blue Rectangles).`,
              promptQuestion: `“Does this piece match both the color rule AND the shape rule?”`,
              lookFor: `${childName} double-checking both properties before placing the brick.`
            },
            resource: catalog.simulation
          };
        }

      case 'workingMemory':
        if (isCorrect && !hasHint) {
          return {
            whatExplored: 'A sequential deduction task requiring the learner to hold two comparative timeline statements ("Owl crossed after Badger", "Fox crossed after Owl") to determine who crossed first.',
            whatDemonstrated: `${childName} accurately deduced that the Badger was first, holding the chronological sequence in working memory without confusion.`,
            evidenceNote: `Successfully deduced the three-step sequence independently. Response time: ${(latencyMs/1000).toFixed(1)}s.`,
            whatThisSuggests: `Strong capacity for internal mental manipulation. In daily schoolwork, this helps with multi-step math word problems and following sequential instructions.`,
            whatToPractise: `Extending to four-step logic sequences and reverse chronological clues ("A finished before B, but after C").`,
            practicalActivity: {
              title: 'Mental Timeline Challenge',
              duration: '5 minutes',
              instruction: `Give three short sequential clues during dinner or a car ride (e.g., "The cat woke up after the dog, but before the bird. Who woke up first?").`,
              promptQuestion: `“Can you picture the animal line in your mind from first to last?”`,
              lookFor: `${childName} repeating the chain back and identifying the front runner.`
            },
            resource: catalog.game
          };
        } else {
          return {
            whatExplored: 'A sequential deduction task requiring the learner to hold two comparative timeline statements to determine chronological order.',
            whatDemonstrated: `${childName} ${trait === 'recency-bias' ? 'selected the Fox (the last named animal in the prompt), showing a tendency to remember the most recent cue' : 'found tracking relative "after" relationships challenging on this single trial'}.`,
            evidenceNote: `Selected ${trait === 'recency-bias' ? 'Fox (recency anchor)' : 'an alternative sequence position'}.`,
            whatThisSuggests: `Holding multiple relational statements ("A after B, B after C") in short-term working memory without visual pencil-and-paper aids is demanding for primary learners.`,
            whatToPractise: `Practising drawing a quick scratch line or using fingers to anchor each step as it is read aloud.`,
            practicalActivity: {
              title: 'Finger-Tapping Timeline',
              duration: '6 minutes',
              instruction: `When listening to multi-step instructions, have ${childName} tap fingers on the table for each item in order (Thumb = 1st, Index = 2nd, Middle = 3rd).`,
              promptQuestion: `“Let's tap out who was first, second, and third as we read the signs.”`,
              lookFor: `${childName} using physical gestures to relieve mental working memory load.`
            },
            resource: catalog.worksheet
          };
        }

      case 'cognitiveFlexibility':
        if (isCorrect && !hasHint) {
          return {
            whatExplored: 'A rule-switching sorting task where an established color sorting rule was abruptly replaced by a shape sorting rule.',
            whatDemonstrated: `${childName} immediately suppressed the old color rule and placed the Yellow Star into Tray A based strictly on shape.`,
            evidenceNote: `Switched classification rules seamlessly on the first trial without perseveration error.`,
            whatThisSuggests: `Healthy executive inhibition and cognitive flexibility. This helps when transitioning between subjects, shifting from addition to subtraction, or adapting when plans change.`,
            whatToPractise: `Multi-rule card games like Uno, Set, or Dutch Blitz where classification criteria shift frequently during play.`,
            practicalActivity: {
              title: 'The Simon-Says Rule Flip',
              duration: '7 minutes',
              instruction: `Play a quick clapping game where 1 clap means "stand up" and 2 claps means "sit down". After 1 minute, ring a spoon and flip the rule: 1 clap now means "sit down"!`,
              promptQuestion: `“What is our new rule now that the bell rang?”`,
              lookFor: `${childName} pausing briefly to inhibit the old habit before executing the new rule.`
            },
            resource: catalog.game
          };
        } else {
          return {
            whatExplored: 'A rule-switching sorting task where an established color sorting rule was abruptly replaced by a shape sorting rule.',
            whatDemonstrated: `${childName} sorted the card into Tray B based on its color, exhibiting classic rule perseveration where the brain clings to the initial criterion.`,
            evidenceNote: `Maintained the previous sorting criterion (color) after the shape rule was announced.`,
            whatThisSuggests: `Perseveration is extremely common in Stage 1–3 learners. The visual saliency of color is naturally strong and requires deliberate, practised mental braking to inhibit.`,
            whatToPractise: `Practising verbalizing the new rule aloud before touching the sorting pieces ("Now I only care about shape!").`,
            practicalActivity: {
              title: 'Stop & Reset Cue',
              duration: '5 minutes',
              instruction: `Before starting a new activity or worksheet page, establish a playful 3-second "Brain Reset" gesture (shaking hands out) to signal a new set of instructions.`,
              promptQuestion: `“What were we doing before, and what are we doing right now?”`,
              lookFor: `${childName} verbally summarizing the difference between the two rules.`
            },
            resource: catalog.simulation
          };
        }

      case 'verbalReasoning':
        if (isCorrect) {
          return {
            whatExplored: 'An inferential reading passage where weather was implied through character behavior (wide-brim sun hat, wiping perspiration, cool water) without using the word "hot".',
            whatDemonstrated: `${childName} synthesized three contextual clues to infer that the weather was very hot and sunny at sea.`,
            evidenceNote: `Correctly synthesized contextual narrative clues into an unstated inference.`,
            whatThisSuggests: `Good comprehension of implied meaning in text. This skill is fundamental for Cambridge Primary reading papers, science hypothesis formulation, and everyday social nuance.`,
            whatToPractise: `Encouraging ${childName} to quote specific words as "evidence detectives" when sharing opinions about books.`,
            practicalActivity: {
              title: 'Story Detective Clues',
              duration: '10 minutes',
              instruction: `During bedtime reading, pause at an descriptive sentence and ask: "How is this character feeling, and what words give us the clue?"`,
              promptQuestion: `“What two clues in that sentence tell us what the weather or mood is like?”`,
              lookFor: `${childName} citing specific words from the text rather than guessing.`
            },
            resource: catalog.presentation
          };
        } else {
          return {
            whatExplored: 'An inferential reading passage requiring synthesis of subtle behavioral clues.',
            whatDemonstrated: `${childName} chose an alternative interpretation, focusing on surface impressions rather than combining the three distinct clues.`,
            evidenceNote: `Struggled to synthesize multiple behavioral clues into an unstated conclusion.`,
            whatThisSuggests: `Developing the habit of searching for multiple supporting clues rather than anchoring on an isolated word.`,
            whatToPractise: `Highlighting clues with colored pencils: "Find 3 clues that tell us about the weather."`,
            practicalActivity: {
              title: 'Three-Clue Highlight Hunt',
              duration: '8 minutes',
              instruction: `Print or write a 3-sentence riddle. Give ${childName} a yellow highlighter to underline exactly three words that point to the secret answer.`,
              promptQuestion: `“Can you show me the three separate clues that helped you decide?”`,
              lookFor: `${childName} pointing to each clue one by one.`
            },
            resource: catalog.worksheet
          };
        }

      case 'creativeFluency':
        const optText = (selectedOption && selectedOption.text) ? selectedOption.text : 'an inventive combination';
        return {
          whatExplored: 'A divergent thinking challenge presenting everyday household items (two paper cups and string) to gauge originality and functional flexibility.',
          whatDemonstrated: `${childName} selected an inventive, functional application (${optText}), demonstrating creative exploration beyond conventional usage.`,
          evidenceNote: `Demonstrated divergent thinking with an inventive application. Trait: ${trait}.`,
          whatThisSuggests: `Willingness to explore novel possibilities. In STEM projects and creative writing, this mindset generates unexpected solutions and expressive narratives.`,
          whatToPractise: `Taking an idea from imagination into physical testing: sketching a labelled diagram with dimensions or materials.`,
          practicalActivity: {
            title: 'Cardboard Box Invention Sprint',
            duration: '12 minutes',
            instruction: `Take an empty cereal box or cardboard tube. Challenge ${childName} to name 4 completely different things it could become before building one.`,
            promptQuestion: `“What else could this be if we turn it upside down or cut windows into it?”`,
            lookFor: `${childName} generating ideas across different categories (e.g. vehicle, creature, tool).`
          },
          resource: catalog.presentation
        };

      case 'emotionalPerception':
        if (isCorrect) {
          return {
            whatExplored: 'A social-emotional scenario evaluating sensitivity to quiet, withdrawn body language (crossed arms, head down, silence after spilling paint).',
            whatDemonstrated: `${childName} accurately recognized that Leo felt sad and discouraged, recommending a warm smile and paper towels rather than mistaking quietness for anger or indifference.`,
            evidenceNote: `Correctly recognized withdrawn distress and selected an empathic peer response.`,
            whatThisSuggests: `High social-emotional awareness. ${childName} understands that uncomfortable emotions often present quietly, which supports positive collaborative group work.`,
            whatToPractise: `Practising what to say aloud in tricky social situations to offer help without drawing unwanted attention to a classmate's mistake.`,
            practicalActivity: {
              title: 'Quiet Help Scenarios',
              duration: '6 minutes',
              instruction: `Discuss a time when someone felt embarrassed at school. Brainstorm gentle ways to help without making a big fuss.`,
              promptQuestion: `“What is something small we can do when a friend feels embarrassed that helps them feel better right away?”`,
              lookFor: `${childName} suggesting calm, considerate actions.`
            },
            resource: catalog.presentation
          };
        } else {
          return {
            whatExplored: 'A social-emotional scenario evaluating sensitivity to subtle, withdrawn emotional signals.',
            whatDemonstrated: `${childName} selected a response that misidentified the quiet body language as anger or indifference.`,
            evidenceNote: `Interpreted quiet withdrawal as anger or lack of concern.`,
            whatThisSuggests: `Subtle, introverted body language (crossing arms, averting eyes) can be confusing for young learners compared to overt signals like crying or shouting.`,
            whatToPractise: `Looking at illustrations of characters and discussing what their shoulders, posture, and facial expression communicate.`,
            practicalActivity: {
              title: 'Mute Movie Guessing',
              duration: '10 minutes',
              instruction: `Watch a short animated movie clip on mute for 2 minutes. Pause and ask ${childName} to deduce how each character is feeling using only posture and expression.`,
              promptQuestion: `“Look at their shoulders and eyes. Are they feeling energetic, worried, or discouraged?”`,
              lookFor: `${childName} pointing out body posture cues.`
            },
            resource: catalog.presentation
          };
        }

      case 'collaborativeFairness':
        if (isCorrect) {
          return {
            whatExplored: 'A shared-resource dilemma where four children wanted to use one telescope before bedtime.',
            whatDemonstrated: `${childName} chose a structured, equitable solution: using a 2-minute sand timer so everyone gets equal turns, followed by sharing observations.`,
            evidenceNote: `Advocated for procedural equity and mutual participation.`,
            whatThisSuggests: `Understands procedural fairness and the value of clear, transparent rules in group settings. This is a key asset in Cambridge collaborative science labs.`,
            whatToPractise: `Applying this principle when rules cannot be divided equally (e.g., negotiating roles like note-taker, timekeeper, and presenter).`,
            practicalActivity: {
              title: 'Family Turn-Timer Routine',
              duration: '5 minutes',
              instruction: `When choosing a game or bedtime story, let ${childName} set a kitchen timer to manage turns fairly between siblings or family members.`,
              promptQuestion: `“How does using a timer help everyone feel that the decision was fair?”`,
              lookFor: `${childName} explaining that everyone gets the same opportunity.`
            },
            resource: catalog.game
          };
        } else {
          return {
            whatExplored: 'A shared-resource dilemma where four children wanted to use one telescope.',
            whatDemonstrated: `${childName} selected an arbitrary outcome (e.g. finder keeps it or avoiding the situation altogether) rather than procedural sharing.`,
            evidenceNote: `Opted for an exclusionary or avoidant resolution to a shared-resource challenge.`,
            whatThisSuggests: `May view sharing as an all-or-nothing conflict rather than an opportunity for negotiated compromise.`,
            whatToPractise: `Exploring simple compromise frameworks: "You pick first today, I pick first tomorrow" or "We set a 3-minute timer."`,
            practicalActivity: {
              title: 'The Two-Slice Cake Rule',
              duration: '5 minutes',
              instruction: `Introduce the classic fairness rule: "One person cuts the treat, the other person gets to choose their slice first."`,
              promptQuestion: `“Why does letting the other person choose make the person cutting try extra hard to be fair?”`,
              lookFor: `${childName} grasping the concept of balanced incentives.`
            },
            resource: catalog.worksheet
          };
        }

      case 'deductiveLogic':
        if (isCorrect && !hasHint) {
          return {
            whatExplored: 'A multi-constraint deductive puzzle requiring simultaneous testing of three criteria: head shape (not round), tooth count (more than 3), and material (bronze).',
            whatDemonstrated: `${childName} correctly eliminated Key A (round silver) and Key C (only 2 teeth) to identify Key B on the first attempt without clues.`,
            evidenceNote: `Systematically satisfied all three logical constraints to isolate the correct key. Response time: ${(latencyMs/1000).toFixed(1)}s.`,
            whatThisSuggests: `Strong methodical reasoning. ${childName} can hold multiple negative and positive constraints simultaneously, a core skill for math problem-solving and coding logic.`,
            whatToPractise: `Complex multi-clue logic grids with 4 or 5 attributes.`,
            practicalActivity: {
              title: 'Guess My Secret Object (3 Clues)',
              duration: '8 minutes',
              instruction: `Think of an object in the room. Give ${childName} 3 negative and positive clues: "It is NOT made of wood. It HAS more than 4 legs. It IS red."`,
              promptQuestion: `“Which objects did you rule out after clue 1? What is left after clue 2?”`,
              lookFor: `${childName} crossing off possibilities step by step.`
            },
            resource: catalog.worksheet
          };
        } else {
          return {
            whatExplored: 'A multi-constraint deductive puzzle requiring simultaneous testing of three criteria.',
            whatDemonstrated: `${childName} ${hasHint ? 'required a hint to step through the constraints' : 'selected an option that violated one of the three clues'}.`,
            evidenceNote: `Found tracking three simultaneous logical constraints challenging on this single trial.`,
            whatThisSuggests: `When multiple rules must be verified at once, young learners can experience cognitive overload unless they use an explicit elimination process.`,
            whatToPractise: `Using physical elimination: putting a finger over rejected choices as each clue is read aloud.`,
            practicalActivity: {
              title: 'Finger-Cross Elimination',
              duration: '7 minutes',
              instruction: `Draw 3 simple keys or shapes on scrap paper. Read one clue at a time and have ${childName} physically cross out the ones that fail.`,
              promptQuestion: `“Does this key pass rule #1? No? Let's put a big X over it.”`,
              lookFor: `${childName} physically eliminating non-matching options before deciding.`
            },
            resource: catalog.simulation
          };
        }

      default:
        return {
          whatExplored: 'A cognitive thinking challenge.',
          whatDemonstrated: `${childName} completed the activity.`,
          evidenceNote: 'Activity completed.',
          whatThisSuggests: 'Provides useful formative insight.',
          whatToPractise: 'Continue regular guided practice.',
          practicalActivity: this.getHomeActivity(dimKey, childName),
          resource: catalog.presentation
        };
    }
  },

  getExploredSummary(dimKey) {
    const map = {
      spatialIntuition: '2D geometric matrix grids and coordinate pattern rules.',
      workingMemory: 'Holding and manipulating sequential multi-step instructions.',
      cognitiveFlexibility: 'Inhibiting previous habits when sorting rules abruptly change.',
      verbalReasoning: 'Inferring implied meaning from descriptive narrative context.',
      creativeFluency: 'Generating inventive, divergent uses for everyday items.',
      emotionalPerception: 'Interpreting nonverbal body language and subtle emotional cues.',
      collaborativeFairness: 'Balancing equal access, turn-taking, and cooperative fairness.',
      deductiveLogic: 'Methodical multi-clue elimination and constraint satisfaction.'
    };
    return map[dimKey] || 'Cognitive and reasoning skills.';
  },

  getHomeActivity(dimKey, childName) {
    return {
      title: 'Everyday Observation Challenge',
      duration: '5-10 minutes',
      instruction: `Engage ${childName} in a short, low-pressure thinking conversation during daily routines.`,
      promptQuestion: `“How did you figure that out? What was your first clue?”`,
      lookFor: `${childName} explaining their thinking process aloud.`
    };
  },

  /**
   * Section 2: Builds an authentic, individually written educator learning story
   */
  buildLearningStory(childName, stage, topStrengths, topPractice, allDims) {
    const s1 = topStrengths[0];
    const s2 = topStrengths[1];
    const p1 = topPractice[0];

    const strengthNames = topStrengths.map(s => s.missionName).join(' and ');
    const practiceName = p1 ? p1.missionName : 'rule-switching challenges';

    const p1Text = `Across the eight learning adventures, ${childName} approached each challenge with sustained focus and genuine curiosity. Rather than rushing to click, ${childName} demonstrated careful visual inspection and thoughtful consideration across the majority of tasks.`;

    let p2Text = '';
    if (s1 && s2) {
      p2Text = `The strongest demonstrated capabilities appeared during ${s1.missionName} (${s1.dimensionName}) and ${s2.missionName} (${s2.dimensionName}). In these activities, ${childName} showed an impressive ability to analyze complex relationships and synthesize unstated details without needing step-by-step guidance. For example, ${s1.evidenceNote.toLowerCase()} This demonstrates that when tasks align with clear structural or contextual clues, ${childName} processes information with high accuracy.`;
    } else if (s1) {
      p2Text = `A particularly notable strength was demonstrated during ${s1.missionName} (${s1.dimensionName}), where ${childName} ${s1.evidenceNote.toLowerCase()} This indicates a solid foundation for independent problem-solving in structured learning environments.`;
    }

    let p3Text = '';
    if (p1) {
      p3Text = `At the same time, the assessment revealed an important and very constructive area for ongoing practice during ${p1.missionName} (${p1.dimensionName}). Here, ${childName} ${p1.evidenceNote.toLowerCase()} In primary learning, this is a completely expected developmental threshold: when familiar rules change unexpectedly or when multiple criteria compete for attention, developing systematic checking habits makes all the difference.`;
    }

    const p4Text = `In everyday school terms, these observations suggest that ${childName} thrives when given room to explore relationships independently, but will benefit from gentle scaffolding when transitioning between contrasting rules or holding multi-step instructions. The learning roadmap below is designed specifically to support these next steps through short, enjoyable games and visual simulations on Mentp.`;

    return [p1Text, p2Text, p3Text, p4Text];
  },

  /**
   * Section 1: Builds the concise executive summary answering the 3 core parent questions
   */
  buildExecutiveSummary(childName, topStrengths, topPractice, allDims) {
    const demonstratedList = topStrengths.map(s => `<strong>${s.dimensionName} (${s.missionName}):</strong> ${s.evidenceNote}`).join('<br>');
    const practiceList = topPractice.map(p => `<strong>${p.dimensionName} (${p.missionName}):</strong> ${p.whatToPractise}`).join('<br>');
    const homeAction = topPractice[0] 
      ? `Try the <strong>${topPractice[0].practicalActivity.title}</strong> (${topPractice[0].practicalActivity.duration}) at home: ${topPractice[0].practicalActivity.instruction}`
      : `Spend 5 minutes asking ${childName} to explain their thinking process aloud during everyday puzzle play.`;

    return {
      demonstratedHtml: demonstratedList,
      practiseHtml: practiceList,
      todayActionHtml: homeAction
    };
  },

  /**
   * Section 6: Builds the Personalized Mentp Learning Roadmap
   * Sequenced: Presentation -> Simulation -> Game -> Worksheet
   */
  buildPersonalizedRoadmap(topPractice, topStrengths, childName) {
    const roadmap = [];

    // Prioritize the top growth area first
    const primaryNeed = topPractice[0] || topStrengths[0];
    const secondaryNeed = topPractice[1] || topStrengths[1] || topStrengths[0];

    const catalog1 = this.RESOURCE_CATALOG[primaryNeed.dimensionKey];
    const catalog2 = this.RESOURCE_CATALOG[secondaryNeed.dimensionKey];

    if (catalog1) {
      // Step 1: Presentation to introduce concept
      roadmap.push({
        stepNumber: 1,
        title: catalog1.presentation.title,
        type: catalog1.presentation.type,
        badge: catalog1.presentation.badge,
        url: catalog1.presentation.url,
        dimensionName: primaryNeed.dimensionName,
        whyRecommended: `Recommended because ${childName} is developing confidence in ${primaryNeed.dimensionName.toLowerCase()} and will benefit from seeing clear visual strategies explained step-by-step.`,
        whatPractise: catalog1.presentation.concept,
        howToUse: `Open this 12-slide presentation on a tablet or laptop. Read through the first 4 slides together, discussing the visual examples.`,
        whatToLookFor: `${childName} pointing to the visual cues on screen and explaining the rule before advancing to the next slide.`,
        whatComesNext: `Move directly into the interactive simulation below to test the concept with hands-on digital manipulatives.`
      });

      // Step 2: Simulation to explore interactively
      roadmap.push({
        stepNumber: 2,
        title: catalog1.simulation.title,
        type: catalog1.simulation.type,
        badge: catalog1.simulation.badge,
        url: catalog1.simulation.url,
        dimensionName: primaryNeed.dimensionName,
        whyRecommended: `Provides a safe, interactive digital playground where ${childName} can test predictions and see immediate visual feedback without fear of getting an answer wrong.`,
        whatPractise: catalog1.simulation.concept,
        howToUse: `Let ${childName} experiment freely for 5 minutes with the virtual controls, then try setting up a specific puzzle challenge together.`,
        whatToLookFor: `${childName} adjusting their strategy after an unexpected result rather than repeating the same action.`,
        whatComesNext: `Apply the newly formed mental model in the thinking game challenge.`
      });
    }

    if (catalog2) {
      // Step 3: Game to practice with joy
      roadmap.push({
        stepNumber: 3,
        title: catalog2.game.title,
        type: catalog2.game.type,
        badge: catalog2.game.badge,
        url: catalog2.game.url,
        dimensionName: secondaryNeed.dimensionName,
        whyRecommended: `Reinforces quick, adaptive decision-making in a lively game format that builds speed and automaticity.`,
        whatPractise: catalog2.game.concept,
        howToUse: `Play one 5-minute round together. Celebrate successful rule switches or multi-clue discoveries.`,
        whatToLookFor: `${childName} remaining calm and laughing through unexpected rule changes or tricky clues.`,
        whatComesNext: `Consolidate understanding through independent pencil-and-paper worksheet practice.`
      });
    }

    // Step 4: Worksheet to verify independent mastery
    const worksheetResource = catalog1?.worksheet || catalog2?.worksheet;
    if (worksheetResource) {
      roadmap.push({
        stepNumber: 4,
        title: worksheetResource.title,
        type: worksheetResource.type,
        badge: worksheetResource.badge,
        url: worksheetResource.url,
        dimensionName: primaryNeed.dimensionName,
        whyRecommended: `Transfers screen-based problem-solving into traditional written formats expected in Cambridge Primary schoolwork.`,
        whatPractise: worksheetResource.concept,
        howToUse: `Print out pages 1 and 2. Set a relaxed 10-minute timer and encourage ${childName} to complete the challenges independently.`,
        whatToLookFor: `${childName} writing or explaining their rationale clearly in the provided reason boxes.`,
        whatComesNext: `Retake the Learning Compass assessment in 4 to 6 weeks to observe progress.`
      });
    }

    return roadmap;
  },

  /**
   * Section 7: Builds Parent Guidance home routines
   */
  buildParentGuidance(topPractice, topStrengths, childName) {
    const suggestions = [];

    if (topPractice[0]) {
      suggestions.push({
        area: topPractice[0].dimensionName,
        title: topPractice[0].practicalActivity.title,
        duration: topPractice[0].practicalActivity.duration,
        whatToDo: topPractice[0].practicalActivity.instruction,
        promptQuestion: topPractice[0].practicalActivity.promptQuestion,
        whatToObserve: topPractice[0].practicalActivity.lookFor
      });
    }

    if (topPractice[1]) {
      suggestions.push({
        area: topPractice[1].dimensionName,
        title: topPractice[1].practicalActivity.title,
        duration: topPractice[1].practicalActivity.duration,
        whatToDo: topPractice[1].practicalActivity.instruction,
        promptQuestion: topPractice[1].practicalActivity.promptQuestion,
        whatToObserve: topPractice[1].practicalActivity.lookFor
      });
    } else if (topStrengths[0]) {
      suggestions.push({
        area: `Extending ${topStrengths[0].dimensionName}`,
        title: topStrengths[0].practicalActivity.title,
        duration: topStrengths[0].practicalActivity.duration,
        whatToDo: topStrengths[0].practicalActivity.instruction,
        promptQuestion: topStrengths[0].practicalActivity.promptQuestion,
        whatToObserve: topStrengths[0].practicalActivity.lookFor
      });
    }

    // General metacognitive routine
    suggestions.push({
      area: 'Everyday Metacognition (Learning How We Think)',
      title: 'The "Talk-Out-Loud" Dinner Puzzle',
      duration: '5 minutes',
      whatToDo: `Whenever you encounter a small mystery or puzzle at home (like deciding which route to take or sorting laundry), share your own thinking steps out loud with ${childName}.`,
      promptQuestion: `“Here is how my brain solved that tricky part: what would you have done first?”`,
      whatToObserve: `${childName} describing their inner reasoning rather than giving a one-word answer.`
    });

    return suggestions;
  },

  /**
   * Section 8: Builds measurable progress check criteria
   */
  buildProgressCheck(topPractice, topStrengths, childName) {
    const target1 = topPractice[0] || topStrengths[0];
    const target2 = topPractice[1] || topStrengths[1];

    return {
      suggestedWindow: '4 to 6 weeks of regular exploration on Mentp',
      indicators: [
        {
          skill: target1.dimensionName,
          baselineObservation: target1.evidenceNote,
          targetCriterion: `Independently completes a comparable ${target1.dimensionName.toLowerCase()} challenge without needing a hint or second attempt.`
        },
        {
          skill: target2.dimensionName,
          baselineObservation: target2.evidenceNote,
          targetCriterion: `Can explain the underlying rule or strategy to a parent before confirming their answer.`
        },
        {
          skill: 'Metacognitive Articulation',
          baselineObservation: 'Formative baseline established in Level 8 (The Learning Detective).',
          targetCriterion: 'Spontaneously uses elimination ("It cannot be A because...") when tackling unfamiliar multi-step problems.'
        }
      ]
    };
  }
};
