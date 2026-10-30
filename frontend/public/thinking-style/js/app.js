import { AudioGuide } from './audio.js';
import { MiraGuide } from './mira.js';
import { ParentGate } from './parent-gate.js';
import { SessionEngine } from './session-engine.js';
import { Room2Imagine } from './room2-imagine.js';
import { Room3KeepGoing } from './room3-keepgoing.js';
import { ScoringEngine } from '../lib/scoring/engine.js';
import { PlanGenerator } from '../lib/plan/plan-generator.js';
import { ParentReport } from './parent-report.js';
import { CompassApp } from './learning-compass-app.js';
import { 
  BUNDLED_PREREQ_GRAPH, 
  BUNDLED_RESPONSE_BANK, 
  BUNDLED_PLAN_TEMPLATES, 
  BUNDLED_RESOURCE_MAP 
} from '../content/bundled-data.js';

// Global Session State
export const SessionState = {
  id: 'sess_' + Math.random().toString(36).substring(2, 9),
  parentData: null,
  currentScreen: 'parent-gate',
  events: [],
  creativityIdeas: [],
  drawingDataUrl: null,
  startedAt: null,
  completedAt: null,
  isPartial: false
};
window.SessionState = SessionState;

// DOM Elements
const mainContent = document.getElementById('main-content');
const btnVoiceToggle = document.getElementById('btn-voice-toggle');
const voiceToggleLabel = document.getElementById('voice-toggle-label');
const btnStopSession = document.getElementById('btn-stop-session');
const modalContainer = document.getElementById('modal-container');
const btnModalContinue = document.getElementById('btn-modal-continue');
const btnModalFinish = document.getElementById('btn-modal-finish');

// App Initialization
async function initApp() {
  AudioGuide.init(3);
  attachHeaderControls();

  // Check URL params for preview mode from reviewer portal
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'preview') {
    const previewDataStr = sessionStorage.getItem('mentara_preview_session');
    if (previewDataStr) {
      try {
        const preview = JSON.parse(previewDataStr);
        renderParentReportView(preview.scoringData, preview.planData, preview.reviewerNarrative);
        return;
      } catch (e) {
        console.error('Failed to parse preview session', e);
      }
    }
  }

  // Normal flow: start Mentp Learning Compass
  CompassApp.init('main-content');
}

function attachHeaderControls() {
  if (btnVoiceToggle) {
    btnVoiceToggle.addEventListener('click', () => {
      const isEnabled = AudioGuide.toggleMute();
      btnVoiceToggle.setAttribute('aria-pressed', isEnabled ? 'true' : 'false');
      voiceToggleLabel.textContent = isEnabled ? 'Voice: On' : 'Voice: Muted';
      btnVoiceToggle.querySelector('.icon').textContent = isEnabled ? '🔊' : '🔇';
    });
  }

  if (btnStopSession) {
    btnStopSession.addEventListener('click', () => {
      if (modalContainer) modalContainer.style.display = 'block';
    });
  }

  if (btnModalContinue) {
    btnModalContinue.addEventListener('click', () => {
      if (modalContainer) modalContainer.style.display = 'none';
    });
  }

  if (btnModalFinish) {
    btnModalFinish.addEventListener('click', () => {
      if (modalContainer) modalContainer.style.display = 'none';
      SessionState.isPartial = true;
      renderScreen('cooldown');
    });
  }

  // Listen for custom events
  window.addEventListener('session:start-warmup', () => {
    renderScreen('warmup');
  });

  window.addEventListener('session:view-report', async () => {
    await completeAndDisplayReport();
  });
}

export function renderScreen(screenName) {
  SessionState.currentScreen = screenName;
  if (!mainContent) return;

  AudioGuide.stop();

  switch (screenName) {
    case 'parent-gate':
      if (btnStopSession) btnStopSession.style.display = 'none';
      mainContent.innerHTML = ParentGate.render();
      ParentGate.attachEvents((formData) => {
        SessionState.parentData = formData;
        SessionState.startedAt = new Date().toISOString();
        AudioGuide.init(formData.stage);
        renderScreen('welcome');
      });
      break;

    case 'welcome':
      if (btnStopSession) btnStopSession.style.display = 'inline-flex';
      renderWelcomeScreen();
      break;

    case 'warmup':
      if (btnStopSession) btnStopSession.style.display = 'inline-flex';
      SessionEngine.init(mainContent, (nextRoom) => {
        renderScreen(nextRoom);
      }).then(() => {
        SessionEngine.startWarmup(SessionState.parentData?.stage || 3);
      });
      break;

    case 'room2':
      if (btnStopSession) btnStopSession.style.display = 'inline-flex';
      Room2Imagine.init(mainContent, (nextRoom) => {
        renderScreen(nextRoom);
      });
      break;

    case 'room3':
      if (btnStopSession) btnStopSession.style.display = 'inline-flex';
      Room3KeepGoing.init(mainContent, (nextRoom) => {
        renderScreen(nextRoom);
      });
      break;

    case 'cooldown':
      if (btnStopSession) btnStopSession.style.display = 'none';
      renderCooldownScreen();
      break;

    case 'report':
      if (btnStopSession) btnStopSession.style.display = 'none';
      completeAndDisplayReport();
      break;

    default:
      console.warn('Unknown screen:', screenName);
      break;
  }
}

function renderWelcomeScreen() {
  const childName = SessionState.parentData?.firstName || 'there';
  const stage = SessionState.parentData?.stage || 3;
  const welcomeText = `Hello, ${childName}! I am Shruti. We are going to explore some fun puzzles, drawings, and ideas together. Take your time—there are no wrong answers here, no scores, and no rush. Whenever you are ready, let's step in!`;

  mainContent.innerHTML = `
    <div class="calm-card screen-enter" style="max-width: 680px; margin: 32px auto; text-align: center;">
      <div style="margin-bottom: 24px;">
        ${MiraGuide.renderAvatar('encouraging')}
      </div>

      <span class="room-badge" style="margin-bottom: 12px;">Cambridge Primary Stage ${stage}</span>
      <h1 style="margin-bottom: 16px;">Welcome, ${childName}!</h1>

      ${MiraGuide.renderSpeech(welcomeText, { canSpeak: true })}

      <div style="margin-top: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <button id="btn-start-warmup" class="btn-primary" style="font-size: 1.15rem; padding: 16px 36px;">
          Let's Explore Together 🌱
        </button>
        <span class="text-muted" style="font-size: 0.9rem;">
          You can pause, ask for a hint, or skip whenever you wish.
        </span>
      </div>
    </div>
  `;

  const speakBtn = document.getElementById('btn-mira-speak');
  if (speakBtn) speakBtn.addEventListener('click', () => AudioGuide.speak(welcomeText));
  if (AudioGuide.autoRead) setTimeout(() => AudioGuide.speak(welcomeText), 600);

  document.getElementById('btn-start-warmup').addEventListener('click', () => {
    renderScreen('warmup');
  });
}

function renderCooldownScreen() {
  const childName = SessionState.parentData?.firstName || 'Friend';
  const cooldownText = `You did some wonderful thinking today, ${childName}. You took your time, tried your ideas, and kept exploring. Shruti has some notes ready for your grown-up now.`;

  mainContent.innerHTML = `
    <div class="calm-card screen-enter" style="max-width: 680px; margin: 32px auto; text-align: center;">
      <div style="margin-bottom: 24px;">
        ${MiraGuide.renderAvatar('friendly')}
      </div>

      <span class="room-badge" style="margin-bottom: 12px;">Session Completed</span>
      <h1 style="margin-bottom: 16px;">Thank You, ${childName}!</h1>

      ${MiraGuide.renderSpeech(cooldownText, { canSpeak: true })}

      <div style="margin-top: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <button id="btn-view-report" class="btn-primary" style="font-size: 1.1rem; padding: 14px 32px;">
          Hand over to Grown-up 🌿
        </button>
      </div>
    </div>
  `;

  const speakBtn = document.getElementById('btn-mira-speak');
  if (speakBtn) speakBtn.addEventListener('click', () => AudioGuide.speak(cooldownText));

  document.getElementById('btn-view-report').addEventListener('click', () => {
    completeAndDisplayReport();
  });
}

async function completeAndDisplayReport() {
  SessionState.completedAt = new Date().toISOString();

  // Save live session into localStorage for Teacher Reviewer portal
  try {
    localStorage.setItem('mentara_live_session', JSON.stringify(SessionState));
  } catch (e) {}

  // Fetch metadata with bundled fallbacks
  let prereqGraph = BUNDLED_PREREQ_GRAPH;
  let responseBank = BUNDLED_RESPONSE_BANK;
  let planTemplates = BUNDLED_PLAN_TEMPLATES;
  let resourceMap = BUNDLED_RESOURCE_MAP;

  try {
    const prRes = await fetch('content/prereq-graph.json');
    if (prRes.ok) prereqGraph = await prRes.json();
    const rbRes = await fetch('content/response-bank.json');
    if (rbRes.ok) responseBank = await rbRes.json();
    const ptRes = await fetch('content/plan-templates/templates.json');
    if (ptRes.ok) planTemplates = await ptRes.json();
    const rmRes = await fetch('content/resource-map.json');
    if (rmRes.ok) resourceMap = await rmRes.json();
  } catch (e) {
    // Graceful fallback to bundled constants for file:// protocol
  }

  // Score deterministically
  const scoringResult = ScoringEngine.scoreSession(SessionState, prereqGraph, responseBank);
  const planData = PlanGenerator.generatePlan(scoringResult, planTemplates, resourceMap);

  renderParentReportView(scoringResult, planData);
}

function renderParentReportView(scoringData, planData, reviewerNarrative = null) {
  if (!mainContent) return;
  mainContent.innerHTML = ParentReport.render(scoringData, planData, reviewerNarrative);
  ParentReport.attachEvents(mainContent);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// App Kickoff
window.addEventListener('DOMContentLoaded', initApp);
