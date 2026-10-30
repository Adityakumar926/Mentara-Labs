/**
 * Mentara Labs | Learning Profile Check
 * Profile Tag Synthesiser
 * 
 * Rules:
 * - Always lead with strengths.
 * - Combine signals into 2-3 profile tags.
 * - Handle thin/partial data gracefully.
 */

export const ProfileSynthesiser = {
  synthesise(academic, behaviours, humanQualities, totalEvents, isPartial = false) {
    const tags = [];
    const strengths = [];
    const growthAreas = [];

    // Check if thin data
    if (totalEvents < 5 || isPartial) {
      return {
        isPartial: true,
        confidence: 'low',
        primaryTags: ['Gentle Starter Profile'],
        summary: 'This is a brief snapshot from a shortened exploration. As your child participates more, their learning preferences will become clearer.',
        strengths: ['Curious about stepping into new tasks', 'Comfortable taking breaks when needed'],
        growthAreas: ['More exploration needed to identify specific patterns']
      };
    }

    // 1. Check for Imaginative Explorer
    if (humanQualities.creativity.band === 'strong' || humanQualities.curiosity.band === 'strong') {
      tags.push('Imaginative Explorer');
      strengths.push('Abundant idea generation and eager curiosity to explore world mysteries');
    }

    // 2. Check for Careful & Thorough
    if (behaviours.calibration.tag === 'well-calibrated' && behaviours.persistence.band !== 'emerging') {
      tags.push('Careful & Thorough');
      strengths.push('Takes calm time to examine questions and possesses reliable self-monitoring');
    }

    // 3. Check for Capable but Unsure
    if (behaviours.calibration.tag === 'under-confident') {
      tags.push('Capable but Unsure');
      strengths.push('Has solid foundational understanding that often exceeds their verbal certainty');
      growthAreas.push('Building trust in their first mathematical hunches');
    }

    // 4. Check for Quick & Confident
    if (behaviours.calibration.tag === 'over-confident' || behaviours.guessing.detected) {
      tags.push('Quick & Confident');
      strengths.push('Energetic problem-solving approach and enthusiasm to dive straight into tasks');
      growthAreas.push('Developing a brief pause to double-check tricky wording before answering');
    }

    // 5. Check for Concept Gaps to Close
    if (academic.flaggedMisconceptions.length > 0) {
      tags.push('Targeted Concept Bridges');
      academic.flaggedMisconceptions.forEach(m => {
        growthAreas.push(`Needs concrete hands-on modelling for ${m.rootCauseSkill || m.misconceptionId}`);
      });
    }

    // Ensure at least two strengths lead
    if (strengths.length < 2) {
      strengths.push('Maintained thoughtful engagement throughout the session');
      strengths.push('Approached challenges with a collaborative mindset');
    }

    // Limit to 2-3 tags
    const finalTags = tags.length > 0 ? tags.slice(0, 3) : ['Thoughtful Learner', 'Persistent Problem Solver'];

    return {
      isPartial: false,
      confidence: totalEvents >= 10 ? 'high' : 'medium',
      primaryTags: finalTags,
      strengths,
      growthAreas
    };
  }
};
