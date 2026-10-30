/**
 * Mentara Labs | Learning Profile Check
 * Event Logging Schema & Telemetry Manager
 * 
 * Rules:
 * - Log every interaction event with precision.
 * - Never show raw numbers or metrics to the child.
 */

export const EventLogManager = {
  createLogEntry(params) {
    const {
      itemId,
      stage,
      strand,
      skillId,
      difficulty,
      response,
      correct,
      latencyMs,
      attempts = 1,
      hintsUsed = 0,
      confidence = null, // 1: Not sure, 2: Pretty sure, 3: Very sure
      skipped = false,
      reasoningId = null,
      reasoningMisconceptionId = null,
      strategyUsed = null,
      room = 'warmup'
    } = params;

    return {
      eventId: 'evt_' + Math.random().toString(36).substring(2, 9),
      itemId,
      stage,
      strand,
      skillId,
      difficulty,
      response,
      correct: correct === true,
      latencyMs: Math.max(0, Math.round(latencyMs)),
      attempts,
      hintsUsed,
      confidence,
      skipped,
      reasoningId,
      reasoningMisconceptionId,
      strategyUsed,
      room,
      timestamp: new Date().toISOString()
    };
  },

  validateEvent(event) {
    if (!event.itemId || !event.timestamp || typeof event.latencyMs !== 'number') {
      return false;
    }
    return true;
  }
};
