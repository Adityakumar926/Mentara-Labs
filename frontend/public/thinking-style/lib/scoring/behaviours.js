/**
 * Mentara Labs | Learning Profile Check
 * Deterministic Scoring: Learning Behaviours
 * (Calibration, Guessing Signals, Recovery, and Persistence)
 */

export const BehaviourScoring = {
  evaluate(events) {
    const validItems = events.filter(e => typeof e.confidence === 'number' && !e.skipped);
    
    // 1. Calibration (gap between confidence and correctness)
    let confidentErrors = 0; // Confidence 3, but incorrect
    let unsureCorrects = 0;  // Confidence 1, but correct
    let calibratedPairs = 0; // (Conf 3 & correct) or (Conf 1 & incorrect)

    validItems.forEach(item => {
      if (item.confidence === 3 && !item.correct) confidentErrors++;
      if (item.confidence === 1 && item.correct) unsureCorrects++;
      if ((item.confidence === 3 && item.correct) || (item.confidence === 1 && !item.correct)) {
        calibratedPairs++;
      }
    });

    let calibrationTag = 'well-calibrated';
    if (confidentErrors >= 2 && confidentErrors > unsureCorrects) {
      calibrationTag = 'over-confident';
    } else if (unsureCorrects >= 2 && unsureCorrects > confidentErrors) {
      calibrationTag = 'under-confident';
    }

    // 2. Guessing Signal (very fast < 2500ms on difficult items + wrong)
    const fastGuesses = validItems.filter(e => e.latencyMs < 2500 && !e.correct && e.difficulty >= 2);
    const hasGuessingSignal = fastGuesses.length >= 2;

    // 3. Recovery (Performance immediately after an error)
    let errorCount = 0;
    let recoveredCount = 0;
    for (let i = 0; i < events.length - 1; i++) {
      if (!events[i].correct && !events[i].skipped) {
        errorCount++;
        const next = events[i + 1];
        if (next && next.correct) {
          recoveredCount++;
        }
      }
    }
    const recoveryRate = errorCount > 0 ? recoveredCount / errorCount : 1;

    // 4. Persistence (Stone puzzle telemetry)
    const puzzleEvent = events.find(e => e.itemId === 'persistence-stone-puzzle');
    let persistenceBand = 'growing';
    let persistenceEvidence = 'Engaged steadily with challenges';

    if (puzzleEvent) {
      if (puzzleEvent.attempts >= 4 || puzzleEvent.latencyMs > 35000) {
        persistenceBand = 'strong';
        persistenceEvidence = `Tried ${puzzleEvent.attempts} different combinations on the tricky puzzle before ${puzzleEvent.hintsUsed > 0 ? 'using a hint' : 'finishing'}`;
      } else if (puzzleEvent.skipped) {
        persistenceBand = 'emerging';
        persistenceEvidence = 'Decided to move forward when the stepping stones felt tricky';
      } else {
        persistenceBand = 'growing';
        persistenceEvidence = `Tested ${puzzleEvent.attempts} arrangements thoughtfully`;
      }
    }

    return {
      calibration: {
        tag: calibrationTag,
        confidentErrors,
        unsureCorrects,
        dataPoints: validItems.length,
        confidence: validItems.length >= 5 ? 'high' : (validItems.length >= 3 ? 'medium' : 'low'),
        evidence: calibrationTag === 'under-confident'
          ? `Gave ${unsureCorrects} correct answers while selecting 'not sure yet'`
          : calibrationTag === 'over-confident'
          ? `Selected 'very sure' on ${confidentErrors} questions that had tricky twists`
          : 'Self-check feeling closely matched answer accuracy'
      },
      guessing: {
        detected: hasGuessingSignal,
        fastGuessCount: fastGuesses.length,
        evidence: hasGuessingSignal ? `Quickly answered ${fastGuesses.length} items in under 2.5 seconds` : 'Took thoughtful time on each question'
      },
      recovery: {
        rate: recoveryRate,
        evidence: errorCount > 0 ? `Successfully answered ${recoveredCount} of ${errorCount} items immediately after a tricky moment` : 'Maintained steady momentum throughout'
      },
      persistence: {
        band: persistenceBand,
        evidence: persistenceEvidence
      }
    };
  }
};
