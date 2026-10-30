/**
 * Mentara Labs | Learning Profile Check
 * Diagnostic Learning Personality & Cognitive Style Engine
 * 
 * Includes:
 * 1. 6 Learner Archetypes
 * 2. 4 Core Cognitive Dimensions
 * 3. Honest, Plain-Language Drawbacks, Hurdles & Blind Spots (Safe-Sided Demerits)
 * 4. "How Their Mind Ticks" Educator Guide
 */

export const PersonalityEngine = {
  ARCHETYPES: {
    intuitive_explorer: {
      id: 'intuitive_explorer',
      title: 'The Intuitive Explorer',
      icon: '🧭',
      tagline: 'Big-picture thinker who learns best through pictures, patterns, and real examples',
      plainSummary: 'Your child understands things best when they can picture them in their mind. They like seeing the whole story before memorising the small rules.',
      superpowers: [
        'Quick at spotting visual patterns and puzzles',
        'Loves trying new things and exploring ideas on their own',
        'Thinks in pictures rather than just words or numbers'
      ],
      primaryDrawback: {
        title: 'Impatience with Step-by-Step Drills',
        plainExplanation: 'They get bored and tune out very quickly if they are asked to do repetitive paper drills without understanding why it matters.',
        schoolImpact: 'May rush through rote homework or make silly mistakes on simple calculations because their brain wants to move on to something interesting.',
        homeFix: 'Keep practice short (5–10 mins). Connect maths to real life—like cooking, maps, or building with LEGO.'
      }
    },
    thoughtful_investigator: {
      id: 'thoughtful_investigator',
      title: 'The Thoughtful Investigator',
      icon: '🔬',
      tagline: 'Careful thinker who takes their time, double-checks, and likes clear rules',
      plainSummary: 'Your child does not like to guess. They take a quiet pause to examine clues, rule out what is wrong, and make sure their answer makes sense.',
      superpowers: [
        'Rarely makes careless guesses—they think before they act',
        'Good at spotting little details that other children miss',
        'Stays calm and methodical on tricky problems'
      ],
      primaryDrawback: {
        title: 'Fear of Being Wrong & Second-Guessing',
        plainExplanation: 'They often know the right answer in their head, but they hesitate or hold back because they are afraid of making a mistake.',
        schoolImpact: 'May take a long time to finish worksheets or freeze up if a teacher suddenly calls on them for a quick answer.',
        homeFix: 'Stop asking "Are you sure?". Instead, say: "Tell me your first hunch—mistakes are just experiments!"'
      }
    },
    creative_spark: {
      id: 'creative_spark',
      title: 'The Creative Spark',
      icon: '💡',
      tagline: 'Inventive creator who comes up with lots of original, unusual ideas',
      plainSummary: 'Your child has a very active imagination. Where other children see only one way to do something, your child comes up with three or four wild ideas.',
      superpowers: [
        'Full of unusual, out-of-the-box ideas',
        'Brings artistic creativity and playfulness into problem solving',
        'Can turn ordinary objects into inventions and games'
      ],
      primaryDrawback: {
        title: 'Resisting Standard Instructions & Following Rules',
        plainExplanation: 'Because their mind is always inventing new ways, they sometimes ignore the actual question or refuse to follow standard steps.',
        schoolImpact: 'Can lose marks on school tests not because they didn’t know the math, but because they answered their own creative version of the question.',
        homeFix: 'Celebrate their creative way first, then challenge them: "Now show me how the teacher would want to see it done!"'
      }
    },
    empathetic_connector: {
      id: 'empathetic_connector',
      title: 'The Empathetic Connector',
      icon: '🤝',
      tagline: 'Kind, caring thinker who learns best through stories, feelings, and teamwork',
      plainSummary: 'Your child is deeply tuned into people and feelings. They learn best when problems are wrapped in stories about helping friends or animals.',
      superpowers: [
        'Notice how others feel and naturally tries to include everyone',
        'Strong story memory and language skills',
        'Works wonderfully in pairs and small groups'
      ],
      primaryDrawback: {
        title: 'Losing Focus on "Dry" Numbers & Emotional Sensitivity',
        plainExplanation: 'If a problem feels cold, dry, or disconnected from real life, they lose energy. They can also take criticism or a bad mark to heart.',
        schoolImpact: 'Can feel anxious or overwhelmed if the classroom atmosphere feels strict, competitive, or rushed.',
        homeFix: 'Wrap numbers into little stories: "We have 12 biscuits to share fairly between 3 hungry puppies..."'
      }
    },
    methodical_architect: {
      id: 'methodical_architect',
      title: 'The Methodical Architect',
      icon: '⚙️',
      tagline: 'Orderly builder who likes step-by-step structure and steady progress',
      plainSummary: 'Your child likes neatness, order, and clear instructions. They build their understanding block by block and take pride in doing things properly.',
      superpowers: [
        'Organised and follows instructions reliably',
        'Keeps trying even when a puzzle is difficult',
        'Enjoys building systems, charts, and clean solutions'
      ],
      primaryDrawback: {
        title: 'Freezing Up When Things Are Unclear or Messy',
        plainExplanation: 'If a task is open-ended with no clear rules (like "write anything you want"), they can feel lost and anxious about where to start.',
        schoolImpact: 'May struggle with open-ended creative prompts and demand: "Just tell me what to do first!"',
        homeFix: 'Give them a starter scaffold: "Step 1 is choosing your character, Step 2 is picking a setting."'
      }
    },
    dynamic_pioneer: {
      id: 'dynamic_pioneer',
      title: 'The Dynamic Pioneer',
      icon: '🚀',
      tagline: 'Energetic doer who learns by jumping straight in and trying things out',
      plainSummary: 'Your child doesn’t want to sit and listen to long explanations—they want to grab the tools and figure it out by testing and doing.',
      superpowers: [
        'Fearless about trying new challenges',
        'Bounces back quickly when an idea doesn’t work',
        'Lots of energy and enthusiasm for hands-on activities'
      ],
      primaryDrawback: {
        title: 'Careless Rushing & Missing Key Details',
        plainExplanation: 'Their excitement to get things done means they rush ahead without reading the full question, tripping over words like "not" or "except".',
        schoolImpact: 'Leaves questions half-finished or writes down answers before reading the second half of the instruction.',
        homeFix: 'Teach the "Two-Finger Check": Point to the last word of the question with your finger before picking your answer.'
      }
    }
  },

  diagnose(sessionData) {
    const events = sessionData.events || [];
    const ideas = sessionData.creativityIdeas || [];
    const drawing = sessionData.drawingDataUrl || null;
    const name = sessionData.parentData?.firstName || 'Learner';

    // 1. Calculate Core Cognitive Dimensions (0 to 100)
    let visualPoints = 0;
    let sequentialPoints = 0;
    let structuredPoints = 0;
    let exploratoryPoints = 0;

    events.forEach(e => {
      // Information processing: Visual vs Sequential
      if (e.reasoningId === 'ref-visual' || e.reasoningId === 'ref-visual-swap' || e.reasoningId === 'ref-visual-slice' || e.optTrait === 'spatial-systematic') {
        visualPoints += 3;
      }
      if (e.reasoningId === 'ref-rule' || e.reasoningId === 'ref-timeline' || e.reasoningId === 'ref-calc' || e.optTrait === 'sequential-deduction' || e.strategyUsed === 'splitting') {
        sequentialPoints += 3;
      }

      // Task orientation: Structured vs Open/Exploratory
      if (e.optTrait === 'deliberate-structured' || e.reasoningId === 'ref-p1' || e.reasoningId === 'ref-progress' || e.optTrait === 'protective-scaffolding') {
        structuredPoints += 4;
      }
      if (e.optTrait === 'adventurous-exploratory' || e.optTrait === 'autonomous-inventor' || e.reasoningId === 'ref-p2' || e.reasoningId === 'ref-p3' || e.reasoningId === 'ref-joy') {
        exploratoryPoints += 4;
      }
    });

    if (ideas.length >= 3) exploratoryPoints += (ideas.length * 2);
    if (drawing) exploratoryPoints += 4;

    const totalInfo = visualPoints + sequentialPoints || 1;
    const dimInformation = Math.max(15, Math.min(85, Math.round((sequentialPoints / totalInfo) * 100)));

    const validLatencies = events.filter(e => e.latencyMs && !e.skipped).map(e => e.latencyMs);
    const avgLatency = validLatencies.length > 0 ? validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length : 10000;
    let dimTempo = Math.max(15, Math.min(85, Math.round(95 - (avgLatency / 220))));

    const totalOrient = structuredPoints + exploratoryPoints || 1;
    const dimOrientation = Math.max(15, Math.min(85, Math.round((exploratoryPoints / totalOrient) * 100)));

    let unsureCount = events.filter(e => e.confidence === 1).length;
    let sureCount = events.filter(e => e.confidence === 3).length;
    let totalConf = unsureCount + sureCount + (events.filter(e => e.confidence === 2).length * 0.5) || 1;
    const dimCompass = Math.max(15, Math.min(85, Math.round((unsureCount / totalConf) * 100)));

    // 2. Comprehensive Archetype Scoring
    let archetypeScores = {
      intuitive_explorer: 0,
      thoughtful_investigator: 0,
      creative_spark: 0,
      empathetic_connector: 0,
      methodical_architect: 0,
      dynamic_pioneer: 0
    };

    events.forEach(e => {
      // Mosaic probe
      if (e.itemId === 'diag-spatial-pattern') {
        if (e.correct) {
          archetypeScores.intuitive_explorer += 3;
          archetypeScores.thoughtful_investigator += 2;
        }
        if (e.reasoningId === 'ref-visual') archetypeScores.intuitive_explorer += 4;
        if (e.reasoningId === 'ref-rule') archetypeScores.methodical_architect += 4;
        if (e.reasoningId === 'ref-gut') archetypeScores.dynamic_pioneer += 4;
        if (e.reasoningId === 'ref-elim') archetypeScores.thoughtful_investigator += 4;
      }

      // Footprints probe
      if (e.itemId === 'diag-detective-logic') {
        if (e.correct) archetypeScores.thoughtful_investigator += 3;
        if (e.reasoningId === 'ref-timeline') archetypeScores.methodical_architect += 4;
        if (e.reasoningId === 'ref-story') archetypeScores.empathetic_connector += 4;
        if (e.reasoningId === 'ref-elim') archetypeScores.thoughtful_investigator += 4;
        if (e.reasoningId === 'ref-quick') archetypeScores.dynamic_pioneer += 4;
      }

      // Fork in forest probe (temperament)
      if (e.itemId === 'diag-ambiguity-fork') {
        if (e.optTrait === 'deliberate-structured') archetypeScores.methodical_architect += 5;
        if (e.optTrait === 'adventurous-exploratory') archetypeScores.intuitive_explorer += 5;
        if (e.optTrait === 'autonomous-inventor') archetypeScores.creative_spark += 5;
        if (e.optTrait === 'collaborative-observational') archetypeScores.thoughtful_investigator += 4;

        if (e.reasoningId === 'ref-p1') archetypeScores.methodical_architect += 4;
        if (e.reasoningId === 'ref-p2') archetypeScores.intuitive_explorer += 4;
        if (e.reasoningId === 'ref-p3') archetypeScores.creative_spark += 4;
        if (e.reasoningId === 'ref-p4') archetypeScores.thoughtful_investigator += 4;
      }

      // Balance scale probe
      if (e.itemId === 'diag-balance-weights') {
        if (e.correct) {
          archetypeScores.methodical_architect += 3;
          archetypeScores.intuitive_explorer += 2;
        }
        if (e.reasoningId === 'ref-visual-swap') archetypeScores.intuitive_explorer += 4;
        if (e.reasoningId === 'ref-calc') archetypeScores.methodical_architect += 4;
        if (e.reasoningId === 'ref-double') archetypeScores.thoughtful_investigator += 4;
      }

      // Fraction probe
      if (e.itemId === 'diag-cake-fractions') {
        if (e.correct) archetypeScores.thoughtful_investigator += 2;
        if (e.reasoningId === 'ref-visual-slice') archetypeScores.intuitive_explorer += 3;
        if (e.reasoningId === 'ref-sharing') archetypeScores.empathetic_connector += 3;
      }

      // Peer partner probe
      if (e.itemId === 'diag-empathy-peer') {
        if (e.optTrait === 'empowering-invitation') archetypeScores.empathetic_connector += 5;
        if (e.optTrait === 'empathetic-checking') archetypeScores.empathetic_connector += 6;
        if (e.optTrait === 'protective-scaffolding') archetypeScores.methodical_architect += 4;
        if (e.optTrait === 'enthusiastic-inspiring') {
          archetypeScores.creative_spark += 4;
          archetypeScores.dynamic_pioneer += 3;
        }

        if (e.reasoningId === 'ref-care') archetypeScores.empathetic_connector += 5;
        if (e.reasoningId === 'ref-agency') archetypeScores.empathetic_connector += 3;
        if (e.reasoningId === 'ref-progress') archetypeScores.methodical_architect += 4;
        if (e.reasoningId === 'ref-joy') archetypeScores.creative_spark += 4;
      }
    });

    // Room 2 impact
    if (ideas.length >= 4) archetypeScores.creative_spark += (ideas.length * 2);
    else if (ideas.length >= 2) archetypeScores.creative_spark += 3;
    if (drawing) {
      archetypeScores.creative_spark += 4;
      archetypeScores.intuitive_explorer += 2;
    }

    // Room 3 persistence impact
    const puzzle = events.find(e => e.itemId === 'persistence-stone-puzzle');
    if (puzzle && puzzle.attempts >= 3) {
      archetypeScores.methodical_architect += 4;
      archetypeScores.thoughtful_investigator += 3;
    }

    // Tempo adjustments
    if (avgLatency > 14000) archetypeScores.thoughtful_investigator += 4;
    else if (avgLatency < 5500) archetypeScores.dynamic_pioneer += 5;

    const sorted = Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]);
    const primaryKey = sorted[0][1] > 0 ? sorted[0][0] : 'intuitive_explorer';
    const secondaryKey = sorted[1][1] > 0 && sorted[1][0] !== primaryKey ? sorted[1][0] : (primaryKey === 'intuitive_explorer' ? 'thoughtful_investigator' : 'intuitive_explorer');

    const primaryArchetype = this.ARCHETYPES[primaryKey];
    const secondaryArchetype = this.ARCHETYPES[secondaryKey];

    // 3. HONEST & SAFE-SIDED DRAWBACKS / DEMERITS ANALYSIS
    const detectedDrawbacks = [];

    // Demerit 1: Second-guessing / Lack of self-trust
    const unsureCorrects = events.filter(e => e.confidence === 1 && e.correct && !e.skipped);
    if (unsureCorrects.length >= 1) {
      detectedDrawbacks.push({
        title: "Second-Guessing Their Own Answers",
        severity: "Common",
        whatHappened: `On ${unsureCorrects.length} question${unsureCorrects.length > 1 ? 's' : ''}, ${name} had the right answer in their head, but selected "Not sure yet".`,
        whyItHurts: "When children don’t trust their inner grasp, they can spend too long doubting themselves or erasing good work in class.",
        howToHelp: `Tell ${name}: "Trust your first hunch! Even if you are wrong, you will learn faster than sitting and worrying."`
      });
    }

    // Demerit 2: Rushing / Careless Slips
    const confidentErrors = events.filter(e => e.confidence === 3 && !e.correct && !e.skipped);
    const fastErrors = events.filter(e => e.latencyMs < 4500 && !e.correct && !e.skipped);
    if (confidentErrors.length >= 1 || fastErrors.length >= 1) {
      detectedDrawbacks.push({
        title: "Over-Confident Rushing on Tricky Details",
        severity: "Watch out",
        whatHappened: `${name} answered very quickly or marked "Very sure" on questions that had subtle twists.`,
        whyItHurts: "They trust their quick first glance so much that they miss key details like 'not', 'except', or smaller fractions.",
        howToHelp: "Teach them to point with their finger to the last word of any question before clicking their answer."
      });
    }

    // Demerit 3: Fraction Denominator Confusion (1/8 vs 1/4)
    const fracError = events.find(e => (e.itemId === 'diag-cake-fractions' || e.strand === 'fractions') && !e.correct && !e.skipped);
    if (fracError) {
      detectedDrawbacks.push({
        title: "Fraction Denominator Confusion (1/8 vs 1/4)",
        severity: "Academic Gap",
        whatHappened: `${name} selected Noah's 1/8 slice, assuming that because 8 is a bigger number than 4, 1/8 must be bigger.`,
        whyItHurts: "This is the most common hurdle at Cambridge Primary Stage 3. It happens when children apply whole-number rules to fractions.",
        howToHelp: "Use real pizza or fold paper strips: show that cutting a pizza for 8 people means each slice must be smaller than cutting for 4."
      });
    }

    // Demerit 4: Anxiety with Open-Ended Ambiguity
    const seeksStructure = events.find(e => e.reasoningId === 'ref-p1' || e.optTrait === 'deliberate-structured');
    if (seeksStructure && primaryKey === 'methodical_architect') {
      detectedDrawbacks.push({
        title: "Hesitation with Open-Ended or Ambiguous Tasks",
        severity: "Temperament",
        whatHappened: `${name} strongly prefers clear rules and steps. When a prompt is open-ended with no clear instructions, they can feel lost.`,
        whyItHurts: "In school writing prompts or creative science projects, they might sit waiting and say: 'Just tell me what to do first.'",
        howToHelp: "Give them a two-step starter scaffold: 'Step 1 is choosing your favourite color, Step 2 is drawing the outline.'"
      });
    }

    // Demerit 5: Frustration / Giving up on tricky multi-step puzzles
    if (puzzle && (puzzle.skipped || puzzle.attempts <= 1)) {
      detectedDrawbacks.push({
        title: "Lower Frustration Threshold When Puzzles Get Messy",
        severity: "Hurdle",
        whatHappened: `When the stone balance puzzle didn't work on the first try, ${name} decided to skip or stop quickly.`,
        whyItHurts: "They prefer tasks where they know the answer immediately, and feel uncomfortable sitting in the 'messy middle' of solving a puzzle.",
        howToHelp: "Praise the struggle: 'I love seeing you get stuck, because that is the exact moment your brain is growing!'"
      });
    }

    // Demerit 6: Perfectionism / Reluctance to Risk Making a Mistake
    if (detectedDrawbacks.length === 0) {
      detectedDrawbacks.push({
        title: "Perfectionism & Reluctance to Risk Being Wrong",
        severity: "Growth Edge",
        whatHappened: `${name} worked very carefully and avoided guesses, preferring safe, familiar territory.`,
        whyItHurts: "Fear of being wrong can prevent capable children from trying advanced problems or volunteering answers in class discussions.",
        howToHelp: "Normalize mistakes at home: share funny mistakes you made at work and celebrate 'glorious mistakes' as learning steps."
      });
    }

    // 4. Concrete observed moments in simple plain English
    const plainObserved = [
      `Took an average of ${Math.round(avgLatency / 1000)} seconds per question—showing ${avgLatency > 14000 ? 'careful, quiet reflection' : (avgLatency < 6000 ? 'fast, spontaneous action' : 'steady, balanced pacing')}.`,
      ideas.length > 0 ? `Showed creative imagination by inventing ${ideas.length} different uses for a paper cup.` : 'Preferred focusing purely on logic puzzles rather than open drawing.',
      puzzle?.attempts > 1 ? `Tested ${puzzle.attempts} different combinations on the stepping stone balance.` : 'Preferred to move forward when puzzles became complex.'
    ];

    return {
      childName: name,
      primaryArchetype,
      secondaryArchetype,
      dimensions: {
        information: {
          score: dimInformation,
          leftLabel: 'Pictures & Real Models',
          rightLabel: 'Rules & Step-by-Step Logic'
        },
        tempo: {
          score: dimTempo,
          leftLabel: 'Slow, Quiet Reflection',
          rightLabel: 'Fast, Spontaneous Action'
        },
        orientation: {
          score: dimOrientation,
          leftLabel: 'Clear Rules & Structure',
          rightLabel: 'Open-Ended & Creative'
        },
        compass: {
          score: dimCompass,
          leftLabel: 'Quiet Inner Guessing',
          rightLabel: 'Double-Checking & Verifying'
        }
      },
      drawbacks: detectedDrawbacks,
      observedMoments: plainObserved,
      creativityIdeas: ideas,
      drawingDataUrl: drawing
    };
  }
};
