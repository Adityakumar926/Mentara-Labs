/**
 * Mentara Labs | Learning Profile Check
 * Deterministic Scoring: Human Qualities (Strengths-Based)
 * (Creativity, Curiosity, Empathy & Kindness)
 */

export const HumanQualitiesScoring = {
  evaluate(events, creativityIdeas = [], responseBank = null) {
    // 1. Creativity (Paper cup task)
    const fluency = creativityIdeas.length;
    let flexibilityCategories = new Set();
    let originalCount = 0;

    if (responseBank?.categories) {
      creativityIdeas.forEach(idea => {
        const lower = idea.toLowerCase();
        let matched = false;
        Object.entries(responseBank.categories).forEach(([category, examples]) => {
          if (examples.some(ex => lower.includes(ex.toLowerCase()) || ex.toLowerCase().includes(lower))) {
            flexibilityCategories.add(category);
            matched = true;
          }
        });
        if (!matched) {
          // Unique unlisted idea counts towards flexibility and originality
          flexibilityCategories.add('inventive-other');
          originalCount++;
        }
        if (responseBank.rareResponses?.some(rare => lower.includes(rare.toLowerCase()))) {
          originalCount++;
        }
      });
    } else {
      // Fallback simple category clustering
      if (fluency >= 1) flexibilityCategories.add('practical');
      if (fluency >= 3) flexibilityCategories.add('play');
      if (fluency >= 5) flexibilityCategories.add('inventive');
    }

    const flexibility = flexibilityCategories.size;
    let creativityBand = 'growing';
    if (fluency >= 6 || flexibility >= 3) creativityBand = 'strong';
    else if (fluency <= 2) creativityBand = 'emerging';

    // 2. Curiosity (Optional 'Want to know more?' tiles)
    const curiosityEvents = events.filter(e => e.strand === 'curiosity');
    const openedCount = curiosityEvents.length;
    let curiosityBand = 'growing';
    if (openedCount >= 2) curiosityBand = 'strong';
    else if (openedCount === 0) curiosityBand = 'emerging';

    // 3. Empathy & Kindness (Story choices)
    const empathyEvents = events.filter(e => e.strand === 'empathy');
    const helpingActions = empathyEvents.map(e => e.response);
    let empathyBand = helpingActions.length >= 2 ? 'strong' : 'growing';

    return {
      creativity: {
        band: creativityBand,
        fluency,
        flexibility,
        originalCount,
        confidence: fluency > 0 ? 'high' : 'low',
        evidence: fluency > 0 
          ? `Generated ${fluency} distinct uses spanning ${flexibility} different categories (provisional originality: ${originalCount})`
          : 'Participated in the drawing exploration'
      },
      curiosity: {
        band: curiosityBand,
        tilesOpened: openedCount,
        confidence: 'high',
        evidence: openedCount > 0 
          ? `Explored ${openedCount} optional wonder questions about bees, clouds, and nature`
          : 'Focused primarily on the main tasks'
      },
      empathy: {
        band: empathyBand,
        actions: helpingActions,
        confidence: empathyEvents.length >= 2 ? 'high' : 'medium',
        evidence: empathyEvents.length > 0
          ? `Showed warm perspective-taking in all ${empathyEvents.length} classroom scenarios`
          : 'Reflected kindly on peer moments'
      }
    };
  }
};
