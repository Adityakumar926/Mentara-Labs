/**
 * Mentara Labs | Learning Profile Check
 * Plan Engine: 4-Week Educator Home Plan Compiler
 */

export const PlanGenerator = {
  generatePlan(scoringResult, planTemplates, resourceMap) {
    const childName = scoringResult.childName || 'your child';
    const flaggedMisconceptions = scoringResult.academic?.flaggedMisconceptions || [];
    const isPartial = scoringResult.isPartial;

    // Determine target strand: prioritize flagged misconception strand, or default to enrichment
    let targetStrand = 'enrichment';
    if (flaggedMisconceptions.length > 0) {
      const topMis = flaggedMisconceptions[0].misconceptionId;
      if (topMis.startsWith('fraction')) targetStrand = 'fractions';
      else if (topMis.startsWith('place-value')) targetStrand = 'number';
      else targetStrand = 'number';
    }

    const strandTemplate = planTemplates?.strands?.[targetStrand] || planTemplates?.strands?.enrichment;
    const weeks = (strandTemplate?.weeks || []).map(w => ({
      week: w.week,
      focus: w.focus,
      activities: w.activities.map(act => act.replace('{firstName}', childName)),
      askYourChild: w.askYourChild.replace('{firstName}', childName)
    }));

    // Resource mapping
    const recommendedResources = [];
    if (flaggedMisconceptions.length > 0 && resourceMap?.resources) {
      flaggedMisconceptions.forEach(m => {
        const match = resourceMap.resources.find(r => r.misconceptionId === m.misconceptionId);
        if (match && !recommendedResources.includes(match)) {
          recommendedResources.push(match);
        }
      });
    }

    const hasSpecificGaps = recommendedResources.length > 0;
    const softCallToAction = hasSpecificGaps
      ? `If you’d like these practice sets matched to ${childName}’s profile, they’re here on mentp.com.`
      : `${childName} demonstrated balanced comfort across the areas explored in this session. No additional remedial support is needed; continue enjoying playful curiosity together at home!`;

    return {
      targetStrand,
      focusTitle: strandTemplate?.focus || 'Building Confidence & Curiosity',
      weeks,
      recommendedResources,
      hasSpecificGaps,
      softCallToAction
    };
  }
};
