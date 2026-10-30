/**
 * Mentara Labs | Learning Profile Check
 * Deterministic Scoring Engine (Main Entry Point)
 * 
 * Rules:
 * - NO LLM SCORING! Pure, reproducible TypeScript/JavaScript.
 * - Same event log MUST yield identical bands and profiles every time.
 * - Outputs bands, confidence, and concrete observed evidence.
 */

import { AcademicScoring } from './academic.js';
import { BehaviourScoring } from './behaviours.js';
import { HumanQualitiesScoring } from './human-qualities.js';
import { HiddenPatterns } from './hidden-patterns.js';
import { ProfileSynthesiser } from './profiles.js';

export const ScoringEngine = {
  scoreSession(sessionData, prereqGraph = null, responseBank = null) {
    const events = sessionData.events || [];
    const creativityIdeas = sessionData.creativityIdeas || [];
    const isPartial = sessionData.isPartial || false;

    // 1. Academic analysis
    const academic = AcademicScoring.evaluate(events, prereqGraph);

    // 2. Learning behaviours
    const behaviours = BehaviourScoring.evaluate(events);

    // 3. Human qualities
    const humanQualities = HumanQualitiesScoring.evaluate(events, creativityIdeas, responseBank);

    // 4. Hidden patterns (Part C)
    const hiddenPatterns = HiddenPatterns.detect(events, creativityIdeas);

    // 5. Profile synthesis
    const profile = ProfileSynthesiser.synthesise(
      academic, 
      behaviours, 
      humanQualities, 
      events.length, 
      isPartial
    );

    return {
      sessionId: sessionData.id,
      childName: sessionData.parentData?.firstName || 'Learner',
      stage: sessionData.parentData?.stage || 3,
      isPartial: profile.isPartial,
      overallConfidence: profile.confidence,
      profileTags: profile.primaryTags,
      strengths: profile.strengths,
      growthAreas: profile.growthAreas,
      academic,
      behaviours,
      humanQualities,
      hiddenPatterns,
      drawingDataUrl: sessionData.drawingDataUrl || null,
      creativityIdeas: sessionData.creativityIdeas || [],
      evaluatedAt: new Date().toISOString()
    };
  }
};
