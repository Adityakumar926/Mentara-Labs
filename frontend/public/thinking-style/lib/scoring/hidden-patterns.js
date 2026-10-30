/**
 * Mentara Labs | Learning Profile Check
 * Part C: Hidden-Pattern Findings
 * 
 * Rules:
 * - Computed in code, shown only when evidence threshold is met (>= 2 or 3 events).
 * - Surprise from accuracy and specificity, never from invention.
 * - If data is thin, do not manufacture a "wow".
 */

export const HiddenPatterns = {
  detect(events, creativityIdeas = []) {
    const findings = [];

    // 1. Knows it but doesn't trust it (Under-confidence)
    const unsureCorrects = events.filter(e => e.confidence === 1 && e.correct && !e.skipped);
    if (unsureCorrects.length >= 2) {
      findings.push({
        id: 'hidden-strength-unsure',
        title: 'Knows it, but double-checking inside',
        type: 'hidden-strength',
        specificity: 4,
        evidenceStrength: unsureCorrects.length,
        actionability: 4,
        summary: `Answered ${unsureCorrects.length} questions correctly even after tapping 'not sure yet'. Their intuitive understanding is stronger than they give themselves credit for.`,
        parentAdvice: "Offer quiet reassurance that their first hunch is often spot-on."
      });
    }

    // 2. Confident errors (Highest-value diagnostic signal)
    const confidentErrors = events.filter(e => e.confidence === 3 && !e.correct && !e.skipped);
    if (confidentErrors.length >= 2) {
      findings.push({
        id: 'confident-errors',
        title: 'Strong convictions on tricky rules',
        type: 'diagnostic-headline',
        specificity: 5,
        evidenceStrength: confidentErrors.length,
        actionability: 5,
        summary: `Felt 'very sure' on ${confidentErrors.length} questions where a common rule twist occurred (such as assuming larger denominators make bigger fractions).`,
        parentAdvice: "When practising, ask 'Can we test this with a drawing?' rather than correcting verbally."
      });
    }

    // 3. Strategy Maturity (Stage 3 calculation methods)
    const strategies = events.filter(e => e.strategyUsed).map(e => e.strategyUsed);
    if (strategies.length >= 2) {
      const splittingCount = strategies.filter(s => s === 'splitting' || s === 'remembered-fact').length;
      if (splittingCount >= 2) {
        findings.push({
          id: 'strategy-mature',
          title: 'Decomposing and structural thinking',
          type: 'strategy-maturity',
          specificity: 4,
          evidenceStrength: strategies.length,
          actionability: 3,
          summary: `Naturally split numbers into chunks or used known facts rather than relying solely on counting one-by-one.`,
          parentAdvice: "Encourage them to explain how they broke the number apart aloud."
        });
      }
    }

    // 4. Work Rhythm (Pacing Dynamics)
    const latencies = events.filter(e => e.latencyMs && !e.skipped).map(e => e.latencyMs);
    if (latencies.length >= 6) {
      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const hardItems = events.filter(e => e.difficulty >= 3 && !e.skipped);
      const hardAvg = hardItems.length > 0 
        ? hardItems.reduce((a, b) => a + b.latencyMs, 0) / hardItems.length 
        : avg;

      if (hardAvg > avg * 1.35) {
        findings.push({
          id: 'rhythm-thoughtful-pause',
          title: 'Thoughtful pause on complex tasks',
          type: 'work-rhythm',
          specificity: 3,
          evidenceStrength: 4,
          actionability: 3,
          summary: `Naturally gave themselves extra time (averaging ${Math.round(hardAvg / 1000)} seconds) on multi-step challenges before committing to an answer.`,
          parentAdvice: "This calm deliberation helps them catch details."
        });
      }
    }

    // 5. Idea Style (from Creativity task)
    if (creativityIdeas.length >= 5) {
      findings.push({
        id: 'idea-style-fluent',
        title: 'Quick spark of multiple associations',
        type: 'creativity-style',
        specificity: 4,
        evidenceStrength: creativityIdeas.length,
        actionability: 4,
        summary: `Readily produced ${creativityIdeas.length} different functions for an everyday object without hitting a thinking block.`,
        parentAdvice: "Great for open-ended STEM investigations and story writing."
      });
    }

    // Sort findings by priority: (specificity * evidenceStrength * actionability)
    findings.sort((a, b) => 
      (b.specificity * b.evidenceStrength * b.actionability) - 
      (a.specificity * a.evidenceStrength * a.actionability)
    );

    return findings;
  }
};
