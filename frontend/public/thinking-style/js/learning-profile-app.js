/**
 * Mentara Labs | Learning Profile Check
 * Unified Master Application Controller for learning-profile-check.html
 */

import { AudioGuide } from './audio.js';
import { MiraGuide } from './mira.js';
import { ParentGate } from './parent-gate.js';
import { SessionEngine } from './session-engine.js';
import { Room2Imagine } from './room2-imagine.js';
import { Room3KeepGoing } from './room3-keepgoing.js';
import { ScoringEngine } from '../lib/scoring/engine.js';
import { PlanGenerator } from '../lib/plan/plan-generator.js';
import { ParentReport } from './parent-report.js';
import { runScoringTests } from '../tests/scoring.test.js';
import { CompassApp } from './learning-compass-app.js';
import { 
  BUNDLED_PREREQ_GRAPH, 
  BUNDLED_RESPONSE_BANK, 
  BUNDLED_PLAN_TEMPLATES, 
  BUNDLED_RESOURCE_MAP, 
  BUNDLED_FIXTURES 
} from '../content/bundled-data.js';

// Application State
export const MasterState = {
  activeTab: 'child',
  liveSession: {
    id: 'live_session_' + Date.now().toString(36),
    parentData: { firstName: 'Child', stage: 3, ageBand: '7-8', parentEmail: 'parent@example.com' },
    events: [],
    creativityIdeas: [],
    drawingDataUrl: null,
    isPartial: false
  },
  currentReviewerId: null, // Will be set to liveSession.id so the live child is ALWAYS shown first!
  reviews: {} // id -> { status, narrative, safeguarded }
};

// Set default active reviewer/report ID to the live child
MasterState.currentReviewerId = MasterState.liveSession.id;
window.SessionState = MasterState.liveSession;

// Kickoff
window.addEventListener('DOMContentLoaded', () => {
  AudioGuide.init(3);
  setupNavigation();
  mountChildSession();
  mountReviewerPortal();
  runAutomatedTests();
});

function setupNavigation() {
  const tabs = [
    { btn: 'tab-child', panel: 'panel-child', name: 'child' },
    { btn: 'tab-reviewer', panel: 'panel-reviewer', name: 'reviewer' },
    { btn: 'tab-report', panel: 'panel-report', name: 'report' },
    { btn: 'tab-tests', panel: 'panel-tests', name: 'tests' }
  ];

  tabs.forEach(t => {
    document.getElementById(t.btn).addEventListener('click', () => {
      tabs.forEach(o => {
        document.getElementById(o.btn).classList.remove('active');
        document.getElementById(o.btn).setAttribute('aria-selected', 'false');
        document.getElementById(o.panel).classList.remove('active');
      });
      document.getElementById(t.btn).classList.add('active');
      document.getElementById(t.btn).setAttribute('aria-selected', 'true');
      document.getElementById(t.panel).classList.add('active');
      MasterState.activeTab = t.name;

      if (t.name === 'reviewer') mountReviewerPortal();
      if (t.name === 'report') mountParentReport();
      if (t.name === 'tests') runAutomatedTests();
    });
  });

  // Voice toggle
  document.getElementById('btn-voice-toggle').addEventListener('click', () => {
    const on = AudioGuide.toggleMute();
    document.getElementById('voice-toggle-label').textContent = on ? 'Voice: On' : 'Voice: Muted';
    document.getElementById('btn-voice-toggle').querySelector('.icon').textContent = on ? '🔊' : '🔇';
  });

  // Break modal
  document.getElementById('btn-take-break').addEventListener('click', () => {
    document.getElementById('modal-container').style.display = 'block';
  });
  document.getElementById('btn-modal-keep-going').addEventListener('click', () => {
    document.getElementById('modal-container').style.display = 'none';
  });
  document.getElementById('btn-modal-stop-now').addEventListener('click', () => {
    document.getElementById('modal-container').style.display = 'none';
    MasterState.liveSession.isPartial = true;
    renderCooldown();
  });

  document.getElementById('btn-run-tests-again')?.addEventListener('click', runAutomatedTests);
}

// --- CHILD EXPERIENCE ---
function mountChildSession() {
  CompassApp.init('child-view-container');
}

function renderParentGate() {
  const container = document.getElementById('child-view-container');
  container.innerHTML = ParentGate.render();
  ParentGate.attachEvents((formData) => {
    MasterState.liveSession.parentData = formData;
    MasterState.liveSession.events = [];
    MasterState.liveSession.creativityIdeas = [];
    MasterState.liveSession.drawingDataUrl = null;
    MasterState.liveSession.isPartial = false;
    MasterState.currentReviewerId = MasterState.liveSession.id;

    AudioGuide.init(formData.stage);
    renderWelcome();
  });
}

function renderWelcome() {
  const name = MasterState.liveSession.parentData?.firstName || 'there';
  const stage = MasterState.liveSession.parentData?.stage || 3;
  const text = `Hello, ${name}! I am Shruti. We are going to explore some fun puzzles, drawings, and ideas together. Take your time—there are no wrong answers here, no scores, and no rush. Whenever you are ready, let's step in!`;

  const container = document.getElementById('child-view-container');
  container.innerHTML = `
    <div class="calm-card screen-enter" style="max-width: 680px; margin: 32px auto; text-align: center;">
      <div style="margin-bottom: 20px;">${MiraGuide.renderAvatar('encouraging')}</div>
      <span class="room-badge" style="margin-bottom: 12px;">Cambridge Primary Stage ${stage}</span>
      <h1 style="margin-bottom: 16px;">Welcome, ${name}!</h1>
      ${MiraGuide.renderSpeech(text, { canSpeak: true })}
      <div style="margin-top: 32px;">
        <button id="btn-begin-warmup" class="btn-primary" style="font-size: 1.15rem; padding: 16px 36px;">
          Let's Explore Together 🌱
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-mira-speak')?.addEventListener('click', () => AudioGuide.speak(text));
  if (AudioGuide.autoRead) setTimeout(() => AudioGuide.speak(text), 500);

  document.getElementById('btn-begin-warmup').addEventListener('click', () => {
    startWarmup();
  });
}

function startWarmup() {
  const container = document.getElementById('child-view-container');
  SessionEngine.init(container, (next) => {
    if (next === 'room2') mountRoom2();
  }).then(() => {
    SessionEngine.startWarmup(MasterState.liveSession.parentData?.stage || 3);
  });
}

function mountRoom2() {
  const container = document.getElementById('child-view-container');
  Room2Imagine.init(container, (next) => {
    if (next === 'room3') mountRoom3();
  });
}

function mountRoom3() {
  const container = document.getElementById('child-view-container');
  Room3KeepGoing.init(container, (next) => {
    if (next === 'cooldown') renderCooldown();
  });
}

function renderCooldown() {
  const name = MasterState.liveSession.parentData?.firstName || 'Friend';
  const text = `You did some wonderful thinking today, ${name}. You took your time, tried your ideas, and kept exploring. Shruti has some notes ready for your grown-up now.`;

  // Explicitly ensure the current profile to show is THIS CHILD
  MasterState.currentReviewerId = MasterState.liveSession.id;

  const container = document.getElementById('child-view-container');
  container.innerHTML = `
    <div class="calm-card screen-enter" style="max-width: 680px; margin: 32px auto; text-align: center;">
      <div style="margin-bottom: 20px;">${MiraGuide.renderAvatar('friendly')}</div>
      <span class="room-badge" style="margin-bottom: 12px;">Session Completed</span>
      <h1 style="margin-bottom: 16px;">Thank You, ${name}!</h1>
      ${MiraGuide.renderSpeech(text, { canSpeak: true })}
      <div style="margin-top: 32px;">
        <button id="btn-cooldown-parent" class="btn-primary" style="font-size: 1.1rem; padding: 14px 32px;">
          View ${name}'s Learning Profile Report 🌿 →
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-mira-speak')?.addEventListener('click', () => AudioGuide.speak(text));

  document.getElementById('btn-cooldown-parent').addEventListener('click', () => {
    // Switch to Parent Report tab
    MasterState.currentReviewerId = MasterState.liveSession.id;
    document.getElementById('tab-report').click();
  });
}

// Helper to get all session options (live + 5 fixtures)
function getAllSessions() {
  const liveName = MasterState.liveSession.parentData?.firstName || 'Live Session';
  return [
    { id: MasterState.liveSession.id, name: `${liveName} (Your Active Session)`, data: MasterState.liveSession },
    { id: 'sess_careful_01', name: 'Oliver (Careful & Thorough - Sample)', data: BUNDLED_FIXTURES.careful },
    { id: 'sess_quick_02', name: 'Leo (Quick & Confident - Sample)', data: BUNDLED_FIXTURES.quick },
    { id: 'sess_unsure_03', name: 'Aarav (Capable but Unsure - Sample)', data: BUNDLED_FIXTURES.unsure },
    { id: 'sess_gaps_04', name: 'Maya (Concept Gaps - Sample)', data: BUNDLED_FIXTURES.gaps },
    { id: 'sess_explorer_05', name: 'Zara (Imaginative Explorer - Sample)', data: BUNDLED_FIXTURES.explorer }
  ];
}

// --- TEACHER REVIEWER PORTAL ---
function mountReviewerPortal() {
  const container = document.getElementById('reviewer-view-container');
  const sessions = getAllSessions();

  const current = sessions.find(s => s.id === MasterState.currentReviewerId) || sessions[0];
  const scoring = ScoringEngine.scoreSession(current.data, BUNDLED_PREREQ_GRAPH, BUNDLED_RESPONSE_BANK);
  const plan = PlanGenerator.generatePlan(scoring, BUNDLED_PLAN_TEMPLATES, BUNDLED_RESOURCE_MAP);

  if (!MasterState.reviews[current.id]) {
    MasterState.reviews[current.id] = {
      status: 'draft',
      safeguarded: false,
      narrative: {
        whatWeNoticed: `${scoring.childName} showed calm engagement throughout this session. ${scoring.strengths[0] || 'They took time to think before answering'}. When exploring questions, they demonstrated thoughtful reflection.`,
        whatItMayMean: `From this short session, ${scoring.childName}'s responses suggest a learner who values thoughtful reasoning. These observations highlight natural cognitive strengths that can be gently supported at home.`
      }
    };
  }
  const reviewState = MasterState.reviews[current.id];

  container.innerHTML = `
    <div class="calm-card" style="margin-bottom: 24px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <div>
        <label class="form-label" for="rev-select" style="margin-bottom: 4px;">Select Session to Inspect:</label>
        <select id="rev-select" class="form-select" style="min-width: 280px;">
          ${sessions.map(s => `<option value="${s.id}" ${s.id === current.id ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <span style="font-size: 0.85rem; color: var(--color-deep-ink-muted); margin-right: 6px;">Report State:</span>
        <span class="room-badge" style="background: ${reviewState.status === 'released' ? '#D1FAE5' : (reviewState.safeguarded ? '#FEE2E2' : '#FEF3C7')};">
          ${reviewState.safeguarded ? 'Flagged (Safeguarding Hold)' : reviewState.status.toUpperCase()}
        </span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
      <!-- Left Column -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="calm-card">
          <h3 style="font-size: 1.15rem; margin-bottom: 8px;">Signals for ${scoring.childName}</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            ${scoring.profileTags.map(t => `<span class="room-badge" style="background: var(--color-warm-white);">✨ ${t}</span>`).join('')}
          </div>
          <p style="font-size: 0.9rem; color: var(--color-deep-ink-muted);">
            Calibration: <strong>${scoring.behaviours.calibration.tag}</strong> • Persistence: <strong>${scoring.behaviours.persistence.band}</strong>
          </p>
        </div>

        <div class="calm-card">
          <h3 style="font-size: 1.15rem; margin-bottom: 10px;">Authentic Child Work</h3>
          <div class="form-label" style="font-size: 0.85rem;">Drawing Canvas Snapshot:</div>
          <div style="text-align: center; background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-md); padding: 10px; margin-bottom: 12px;">
            ${scoring.drawingDataUrl ? `<img src="${scoring.drawingDataUrl}" alt="Drawing" style="max-height: 160px; max-width: 100%;" />` : '<span class="text-muted">No drawing completed</span>'}
          </div>
          <div class="form-label" style="font-size: 0.85rem;">Paper Cup Ideas (${scoring.creativityIdeas.length}):</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${scoring.creativityIdeas.length > 0 ? scoring.creativityIdeas.map(i => `<span style="background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-full); padding: 4px 10px; font-size: 0.85rem;">${i}</span>`).join('') : '<span class="text-muted">No ideas entered</span>'}
          </div>
        </div>

        <div class="calm-card">
          <h3 style="font-size: 1.15rem; margin-bottom: 10px;">Diagnostic Misconceptions & Root Causes</h3>
          ${scoring.academic.flaggedMisconceptions.length > 0 ? scoring.academic.flaggedMisconceptions.map(m => `
            <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 10px; border-radius: var(--radius-sm); margin-bottom: 6px; font-size: 0.875rem;">
              <strong>${m.misconceptionId} (${m.occurrences}x)</strong>
              <div>Root Cause: <em>${m.rootCauseSkill}</em></div>
              <div style="font-size: 0.8rem; color: var(--color-deep-ink-muted); margin-top: 2px;">${m.rootCauseAdvice}</div>
            </div>
          `).join('') : '<p class="text-muted" style="font-size: 0.9rem;">No repeated misconceptions detected. Grasp appears balanced.</p>'}
        </div>
      </div>

      <!-- Right Column -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="calm-card" style="border-left: 4px solid #EF4444; background: #FFF8F8;">
          <h4 style="color: #991B1B; margin-bottom: 6px;">🛡️ Safeguarding Follow-up Check</h4>
          <p style="font-size: 0.85rem; margin-bottom: 10px;">Check this box if any child response indicates distress to pause report release for DSL follow-up.</p>
          <label class="checkbox-card" style="background: #FFF; margin-bottom: 0;">
            <input type="checkbox" id="rev-safe-check" ${reviewState.safeguarded ? 'checked' : ''} />
            <span class="checkbox-text" style="color: #991B1B; font-weight: 700;">Hold report for safeguarding review</span>
          </label>
        </div>

        <div class="calm-card">
          <h3 style="font-size: 1.15rem; margin-bottom: 12px;">Edit Parent Consultation Narrative</h3>
          <div class="form-group">
            <label class="form-label" for="rev-text-noticed">1. What We Noticed (Strengths First):</label>
            <textarea id="rev-text-noticed" class="form-input" rows="4">${reviewState.narrative.whatWeNoticed}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="rev-text-mean">2. What It May Mean (Hedged):</label>
            <textarea id="rev-text-mean" class="form-input" rows="3">${reviewState.narrative.whatItMayMean}</textarea>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px;">
            <button id="btn-rev-save-notes" class="btn-secondary" type="button">Save Educator Notes</button>
            <button id="btn-rev-approve-release" class="btn-primary" type="button">Approve & Release Report to Parent ✓</button>
            <button id="btn-rev-goto-report" class="btn-ghost" type="button">Preview Parent Report Page ↗</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('rev-select').addEventListener('change', (e) => {
    MasterState.currentReviewerId = e.target.value;
    mountReviewerPortal();
  });

  document.getElementById('rev-safe-check').addEventListener('change', (e) => {
    reviewState.safeguarded = e.target.checked;
    reviewState.status = reviewState.safeguarded ? 'flagged' : 'draft';
    mountReviewerPortal();
  });

  document.getElementById('btn-rev-save-notes').addEventListener('click', () => {
    reviewState.narrative.whatWeNoticed = document.getElementById('rev-text-noticed').value;
    reviewState.narrative.whatItMayMean = document.getElementById('rev-text-mean').value;
    if (reviewState.status === 'draft') reviewState.status = 'reviewed';
    alert('Educator notes saved!');
    mountReviewerPortal();
  });

  document.getElementById('btn-rev-approve-release').addEventListener('click', () => {
    if (reviewState.safeguarded) {
      alert('Cannot release: session is flagged for safeguarding review.');
      return;
    }
    reviewState.status = 'released';
    alert(`Report for ${scoring.childName} approved & released!`);
    mountReviewerPortal();
  });

  document.getElementById('btn-rev-goto-report').addEventListener('click', () => {
    document.getElementById('tab-report').click();
  });
}

// --- PARENT REPORT ---
function mountParentReport() {
  const container = document.getElementById('report-view-container');
  const sessions = getAllSessions();

  // If no reviewer ID chosen yet or default, prioritize live child's session
  const current = sessions.find(s => s.id === MasterState.currentReviewerId) || sessions[0];
  const scoring = ScoringEngine.scoreSession(current.data, BUNDLED_PREREQ_GRAPH, BUNDLED_RESPONSE_BANK);
  const plan = PlanGenerator.generatePlan(scoring, BUNDLED_PLAN_TEMPLATES, BUNDLED_RESOURCE_MAP);
  const rev = MasterState.reviews[current.id]?.narrative;

  container.innerHTML = ParentReport.render(scoring, plan, rev, current.id, sessions);
  ParentReport.attachEvents(container, (newSessionId) => {
    MasterState.currentReviewerId = newSessionId;
    mountParentReport();
  });
}

// --- AUTOMATED TESTS ---
async function runAutomatedTests() {
  const summary = document.getElementById('test-suite-summary');
  const container = document.getElementById('test-suite-results');
  if (!summary || !container) return;

  try {
    const results = await runScoringTests();
    const passed = results.filter(r => r.pass).length;
    summary.innerHTML = `<span style="color: ${passed === results.length ? 'var(--color-sage-dark)' : 'red'};">${passed} / ${results.length} Tests Passed (100% Deterministic & Ethical)</span>`;
    container.innerHTML = results.map(r => `
      <div style="background: ${r.pass ? '#EDF5F0' : '#FDE8E8'}; border: 1px solid ${r.pass ? 'var(--color-sage)' : '#EF4444'}; color: ${r.pass ? 'var(--color-sage-dark)' : '#991B1B'}; padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 8px; font-weight: 700; font-size: 0.95rem;">
        ${r.pass ? '✓' : '✗'} ${r.desc}
      </div>
    `).join('');
  } catch (err) {
    summary.innerHTML = `<span style="color: red;">Error: ${err.message}</span>`;
  }
}
