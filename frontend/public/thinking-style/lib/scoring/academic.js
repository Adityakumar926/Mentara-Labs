/**
 * Mentara Labs | Learning Profile Check
 * Deterministic Scoring: Academic Strands & Misconception Detection
 */

export const AcademicScoring = {
  evaluate(events, prereqGraph = null) {
    const academicEvents = events.filter(e => 
      e.strand && !['creativity', 'curiosity', 'persistence', 'empathy', 'mindset'].includes(e.strand) &&
      !e.skipped
    );

    const strandStats = {};
    const misconceptionCounts = {};
    const twoTierReasoningEvidence = [];

    academicEvents.forEach(e => {
      // Strand grouping
      if (!strandStats[e.strand]) {
        strandStats[e.strand] = { total: 0, correct: 0, items: [] };
      }
      strandStats[e.strand].total++;
      if (e.correct) strandStats[e.strand].correct++;
      strandStats[e.strand].items.push(e);

      // Misconception tracking (from answer or 2-tier reasoning)
      const misId = e.reasoningMisconceptionId;
      if (misId) {
        misconceptionCounts[misId] = (misconceptionCounts[misId] || 0) + 1;
        if (e.reasoningId) {
          twoTierReasoningEvidence.push({
            itemId: e.itemId,
            strand: e.strand,
            misconceptionId: misId,
            reasoningId: e.reasoningId
          });
        }
      }
    });

    // Detect repeated misconceptions (chosen 2+ times)
    const flaggedMisconceptions = [];
    Object.entries(misconceptionCounts).forEach(([misId, count]) => {
      if (count >= 2) {
        const rootCauseInfo = prereqGraph?.skills 
          ? Object.values(prereqGraph.skills).find(s => s.commonMisconceptions?.includes(misId))
          : null;

        flaggedMisconceptions.push({
          misconceptionId: misId,
          occurrences: count,
          rootCauseSkill: rootCauseInfo?.name || null,
          rootCauseAdvice: rootCauseInfo?.rootCauseAdvice || null,
          evidence: `Noticed ${count} times during fraction/calculation inquiries`
        });
      }
    });

    // Determine strand mastery bands
    const strandBands = {};
    Object.entries(strandStats).forEach(([strand, stat]) => {
      const accuracy = stat.total > 0 ? stat.correct / stat.total : 0;
      let band = 'growing';
      if (accuracy >= 0.75) band = 'strong';
      else if (accuracy < 0.45) band = 'emerging';

      let confidence = 'low';
      if (stat.total >= 4) confidence = 'high';
      else if (stat.total >= 2) confidence = 'medium';

      strandBands[strand] = {
        band,
        confidence,
        dataPoints: stat.total,
        evidence: `Answered ${stat.correct} out of ${stat.total} items on ${strand}`
      };
    });

    return {
      strandBands,
      flaggedMisconceptions,
      twoTierReasoningEvidence,
      totalAcademicItems: academicEvents.length
    };
  }
};
