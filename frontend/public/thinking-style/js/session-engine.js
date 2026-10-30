/**
 * Mentara Labs | Learning Profile Check
 * Diagnostic Session Engine: Cognitive Style & Personality Revealing Probes
 */

import { AudioGuide } from './audio.js';
import { MiraGuide } from './mira.js';
import { EventLogManager } from '../lib/schemas/event-log.js';
import { BUNDLED_QUESTION_BANK, BUNDLED_PREREQ_GRAPH, BUNDLED_DIAGNOSTIC_TASKS } from '../content/bundled-data.js';

export const SessionEngine = {
  questionBank: [],
  diagnosticTasks: [],
  prereqGraph: null,
  currentQuestions: [],
  currentIndex: 0,
  currentRoom: 'warmup', // 'warmup' | 'room1'
  staircaseDifficulty: 2,
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  itemStartTime: 0,
  selectedConfidence: null,
  selectedOption: null,
  selectedReasoning: null,
  selectedStrategy: null,
  uncertainStrands: new Set(),
  container: null,
  onComplete: null,

  async init(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    
    // Load question bank and diagnostic tasks with bundled fallbacks
    this.questionBank = BUNDLED_QUESTION_BANK;
    this.diagnosticTasks = BUNDLED_DIAGNOSTIC_TASKS || [];
    this.prereqGraph = BUNDLED_PREREQ_GRAPH;

    try {
      const qbRes = await fetch('content/question-bank.json');
      if (qbRes.ok) this.questionBank = await qbRes.json();
      const diagRes = await fetch('content/diagnostic-tasks.json');
      if (diagRes.ok) this.diagnosticTasks = await diagRes.json();
      const prRes = await fetch('content/prereq-graph.json');
      if (prRes.ok) this.prereqGraph = await prRes.json();
    } catch (err) {}
  },

  startWarmup(stage = 3) {
    this.currentRoom = 'warmup';
    this.currentIndex = 0;
    this.uncertainStrands.clear();

    // Use our 6 rich cognitive personality probes
    this.currentQuestions = this.diagnosticTasks && this.diagnosticTasks.length >= 6 
      ? [...this.diagnosticTasks]
      : (this.diagnosticTasks.length > 0 ? [...this.diagnosticTasks] : this.questionBank.slice(0, 6));

    this.renderCurrentItem();
  },

  renderCurrentItem() {
    if (this.currentIndex >= this.currentQuestions.length) {
      this.handleRoomCompletion();
      return;
    }

    const item = this.currentQuestions[this.currentIndex];
    this.itemStartTime = performance.now();
    this.selectedConfidence = null;
    this.selectedOption = null;
    this.selectedOptionIndex = null;
    this.selectedReasoning = null;
    this.selectedStrategy = null;

    const roomTitle = item.category || (this.currentRoom === 'warmup' ? 'Mind Style Probe' : 'Diagnostic Exploration');
    const miraPrompt = "Take your time. Tap how sure you feel, then pick the answer that feels right to you.";

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 760px; margin: 0 auto;">
        <!-- Header ribbon -->
        <div class="room-ribbon">
          <div class="room-title-group">
            <span class="room-badge">${roomTitle}</span>
            <span class="room-name">${item.title || this.formatStrand(item.strand)}</span>
          </div>
          <div class="room-actions">
            <button id="btn-item-skip" class="btn-quiet-skip" type="button" aria-label="Skip this question">
              Skip this one →
            </button>
          </div>
        </div>

        <!-- Shruti Guidance -->
        ${MiraGuide.renderSpeech(miraPrompt, { canSpeak: true, expression: 'friendly' })}

        <!-- The Question -->
        <section class="question-container" aria-label="Question">
          <div class="question-stem" id="question-stem-text">
            ${item.stem}
          </div>

          <!-- Rich Visual Display if present (Mosaic, Scale, Stream, Cakes, etc.) -->
          ${item.visualHtml ? `
            <div class="question-visual-display">
              ${item.visualHtml}
            </div>
          ` : ''}

          <!-- Step 1: Gentle 3-Face Confidence Tap -->
          <div class="confidence-box" id="confidence-section" aria-label="How sure are you?">
            <div class="confidence-prompt">
              <span>🌱 How sure are you before you answer?</span>
            </div>
            <div class="confidence-options">
              <button class="confidence-btn" data-confidence="1" type="button" aria-label="Not sure yet">
                <span class="confidence-face">🤔</span>
                <span class="confidence-label">Not sure yet</span>
              </button>
              <button class="confidence-btn" data-confidence="2" type="button" aria-label="Pretty sure">
                <span class="confidence-face">🙂</span>
                <span class="confidence-label">Pretty sure</span>
              </button>
              <button class="confidence-btn" data-confidence="3" type="button" aria-label="Very sure">
                <span class="confidence-face">🌟</span>
                <span class="confidence-label">Very sure</span>
              </button>
            </div>
          </div>

          <!-- Step 2: Answer Options (Unlocks after confidence tap) -->
          <div id="options-container" style="opacity: 0.55; pointer-events: none; transition: opacity 300ms ease;">
            <div class="form-label" style="margin-bottom: 8px;">Your answer or choice:</div>
            <div class="options-grid ${item.options.length > 2 ? 'two-col' : ''}">
              ${item.options.map((opt, idx) => `
                <button class="option-tile ${opt.visual ? 'has-visual' : ''}" data-opt-idx="${idx}" type="button">
                  <span class="option-indicator">${String.fromCharCode(65 + idx)}</span>
                  ${opt.visual ? `<div class="option-visual-icon">${opt.visual}</div>` : ''}
                  <span class="option-label-text">${opt.text}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 3: Metacognitive Reflection Follow-up -->
          <div id="diagnostic-reasoning-container"></div>
        </section>
      </div>
    `;

    this.attachItemEvents(item);

    const speakBtn = document.getElementById('btn-mira-speak');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        AudioGuide.speak(item.readAloudText || item.stem);
      });
    }

    if (AudioGuide.autoRead) {
      setTimeout(() => AudioGuide.speak(item.readAloudText || item.stem), 500);
    }
  },

  attachItemEvents(item) {
    const confBtns = this.container.querySelectorAll('.confidence-btn');
    const optionsContainer = this.container.querySelector('#options-container');
    const optionTiles = this.container.querySelectorAll('.option-tile');
    const skipBtn = this.container.querySelector('#btn-item-skip');

    // Skip
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.logItemEvent(item, {
          skipped: true,
          response: 'SKIPPED',
          correct: false,
          latencyMs: performance.now() - this.itemStartTime
        });
        this.currentIndex++;
        this.renderCurrentItem();
      });
    }

    // Confidence selection
    confBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        confBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedConfidence = parseInt(btn.dataset.confidence, 10);
        
        if (optionsContainer) {
          optionsContainer.style.opacity = '1';
          optionsContainer.style.pointerEvents = 'auto';
        }
      });
    });

    // Option selection
    optionTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        optionTiles.forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        const optIdx = parseInt(tile.dataset.optIdx, 10);
        this.selectedOption = item.options[optIdx];
        this.selectedOptionIndex = optIdx;

        // Trigger reflection if available
        if (item.reflectionOptions && item.reflectionOptions.length > 0) {
          this.renderReflectionProbe(item);
        } else if (item.reasoningOptions && item.reasoningOptions.length > 0) {
          this.renderReasoningProbe(item);
        } else {
          this.completeItem(item);
        }
      });
    });
  },

  renderReflectionProbe(item) {
    const container = document.getElementById('diagnostic-reasoning-container');
    if (!container) return;

    container.innerHTML = `
      <div class="reasoning-box">
        <div class="reasoning-title">
          🔍 ${item.reflectionPrompt || 'What was your brain doing just then?'}
        </div>
        <div class="reasoning-options">
          ${item.reflectionOptions.map((r, i) => `
            <button class="reasoning-tile ref-tile-btn" data-ridx="${i}" type="button">
              <span>${r.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    container.querySelectorAll('.ref-tile-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.ridx, 10);
        this.selectedReasoning = item.reflectionOptions[idx];
        btn.classList.add('selected');
        setTimeout(() => this.completeItem(item), 350);
      });
    });
  },

  renderReasoningProbe(item) {
    const container = document.getElementById('diagnostic-reasoning-container');
    if (!container) return;

    container.innerHTML = `
      <div class="reasoning-box">
        <div class="reasoning-title">
          🔍 Which sentence sounds most like your thinking?
        </div>
        <div class="reasoning-options">
          ${item.reasoningOptions.map((r, i) => `
            <button class="reasoning-tile ref-tile-btn" data-ridx="${i}" type="button">
              <span>${r.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    container.querySelectorAll('.ref-tile-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.ridx, 10);
        this.selectedReasoning = item.reasoningOptions[idx];
        btn.classList.add('selected');
        setTimeout(() => this.completeItem(item), 350);
      });
    });
  },

  completeItem(item) {
    const latencyMs = performance.now() - this.itemStartTime;
    const isCorrect = this.selectedOption?.correct !== false;

    this.logItemEvent(item, {
      skipped: false,
      response: this.selectedOption?.text,
      correct: isCorrect,
      latencyMs,
      confidence: this.selectedConfidence,
      optIdx: this.selectedOptionIndex,
      optTrait: this.selectedOption?.trait,
      reasoningId: this.selectedReasoning?.id,
      reasoningMisconceptionId: this.selectedReasoning?.misconceptionId || this.selectedOption?.misconceptionId,
      strategyUsed: this.selectedReasoning?.mindStyle || this.selectedStrategy
    });

    this.currentIndex++;
    setTimeout(() => this.renderCurrentItem(), 350);
  },

  logItemEvent(item, eventData) {
    const entry = EventLogManager.createLogEntry({
      itemId: item.id,
      stage: item.stage || 3,
      strand: item.strand,
      skillId: item.skillId || item.id,
      difficulty: item.difficulty || 2,
      room: this.currentRoom,
      ...eventData
    });

    if (window.SessionState) {
      window.SessionState.events.push(entry);
    }
  },

  handleRoomCompletion() {
    AudioGuide.stop();
    const observationText = "You gave such thoughtful reflection to each puzzle and choice. I noticed! Next is Room 2, where we can invent, make, and draw.";

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 680px; margin: 32px auto; text-align: center;">
        <div style="margin-bottom: 20px;">
          ${MiraGuide.renderAvatar('encouraging')}
        </div>
        <span class="room-badge" style="margin-bottom: 12px;">Mind Style Probes Complete</span>
        <h2 style="margin-bottom: 16px;">Wonderful Thinking!</h2>
        ${MiraGuide.renderSpeech(observationText, { canSpeak: true })}
        <div style="margin-top: 28px;">
          <button id="btn-enter-room2" class="btn-primary" style="font-size: 1.1rem; padding: 14px 32px;">
            Enter Room 2: Imagine 🎨 →
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-mira-speak')?.addEventListener('click', () => AudioGuide.speak(observationText));

    document.getElementById('btn-enter-room2').addEventListener('click', () => {
      if (this.onComplete) this.onComplete('room2');
    });
  },

  formatStrand(strand) {
    const map = {
      'spatial-intuition': 'Spatial & Visual Patterns',
      'deductive-logic': 'Deductive Logic & Mysteries',
      'decision-temperament': 'Learning Temperament',
      'relational-intuition': 'Balance & Scaling',
      'social-emotional': 'Interpersonal Insights',
      fractions: 'Fractions & Sharing'
    };
    return map[strand] || 'Exploration';
  }
};
