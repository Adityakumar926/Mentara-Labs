/**
 * Mentara Labs | Learning Profile Check
 * Reviewer Portal Logic (Akash / Teacher Reviewer)
 */

import { ScoringEngine } from '../lib/scoring/engine.js';
import { PlanGenerator } from '../lib/plan/plan-generator.js';
import { ReportWriter } from '../lib/llm/report-writer.js';
import { 
  BUNDLED_PREREQ_GRAPH, 
  BUNDLED_RESPONSE_BANK, 
  BUNDLED_PLAN_TEMPLATES, 
  BUNDLED_RESOURCE_MAP,
  BUNDLED_FIXTURES
} from '../content/bundled-data.js';

export const ReviewerApp = {
  sessions: [],
  currentSession: null,
  prereqGraph: null,
  responseBank: null,
  planTemplates: null,
  resourceMap: null,
  sessionStateMap: {}, // id -> { status: 'draft' | 'reviewed' | 'released' | 'flagged', narrative, safeguarded }

  async init() {
    // Load metadata & resources with fallbacks
    this.prereqGraph = BUNDLED_PREREQ_GRAPH;
    this.responseBank = BUNDLED_RESPONSE_BANK;
    this.planTemplates = BUNDLED_PLAN_TEMPLATES;
    this.resourceMap = BUNDLED_RESOURCE_MAP;

    try {
      const prRes = await fetch('../content/prereq-graph.json');
      if (prRes.ok) this.prereqGraph = await prRes.json();
      const rbRes = await fetch('../content/response-bank.json');
      if (rbRes.ok) this.responseBank = await rbRes.json();
      const ptRes = await fetch('../content/plan-templates/templates.json');
      if (ptRes.ok) this.planTemplates = await ptRes.json();
      const rmRes = await fetch('../content/resource-map.json');
      if (rmRes.ok) this.resourceMap = await rmRes.json();
    } catch (e) {}

    // Load fixture sessions
    let careful = BUNDLED_FIXTURES.careful;
    let quick = BUNDLED_FIXTURES.quick;
    let unsure = BUNDLED_FIXTURES.unsure;
    let gaps = BUNDLED_FIXTURES.gaps;
    let explorer = BUNDLED_FIXTURES.explorer;

    try {
      const cRes = await fetch('../tests/fixtures/profile-careful.json');
      if (cRes.ok) careful = await cRes.json();
      const qRes = await fetch('../tests/fixtures/profile-quick.json');
      if (qRes.ok) quick = await qRes.json();
      const uRes = await fetch('../tests/fixtures/profile-unsure.json');
      if (uRes.ok) unsure = await uRes.json();
      const gRes = await fetch('../tests/fixtures/profile-gaps.json');
      if (gRes.ok) gaps = await gRes.json();
      const eRes = await fetch('../tests/fixtures/profile-explorer.json');
      if (eRes.ok) explorer = await eRes.json();
    } catch (e) {}

    this.sessions = [careful, quick, unsure, gaps, explorer];

    // Check if live session stored in window / localStorage
    const savedLive = localStorage.getItem('mentara_live_session');
    if (savedLive) {
      try {
        const live = JSON.parse(savedLive);
        this.sessions.unshift(live);
      } catch (e) {}
    }

    this.populateSessionPicker();
    this.selectSession(this.sessions[0].id);
    this.attachEvents();
  },

  populateSessionPicker() {
    const picker = document.getElementById('session-picker');
    picker.innerHTML = this.sessions.map(s => `
      <option value="${s.id}">
        ${s.parentData?.firstName || 'Learner'} (Stage ${s.parentData?.stage || 3}) — ID: ${s.id}
      </option>
    `).join('');

    picker.addEventListener('change', (e) => {
      this.selectSession(e.target.value);
    });
  },

  selectSession(sessionId) {
    this.currentSession = this.sessions.find(s => s.id === sessionId);
    if (!this.currentSession) return;

    // Initialize state if not present
    if (!this.sessionStateMap[sessionId]) {
      this.sessionStateMap[sessionId] = {
        status: 'draft',
        safeguarded: false,
        narrative: null
      };
    }

    this.renderSessionDetails();
  },

  async renderSessionDetails() {
    const s = this.currentSession;
    const state = this.sessionStateMap[s.id];

    // Score session deterministically
    const scoringResult = ScoringEngine.scoreSession(s, this.prereqGraph, this.responseBank);
    const planData = PlanGenerator.generatePlan(scoringResult, this.planTemplates, this.resourceMap);

    // Populate demographics
    document.getElementById('info-firstname').textContent = s.parentData?.firstName || 'Learner';
    document.getElementById('info-stage').textContent = s.parentData?.stage || 3;
    document.getElementById('info-age').textContent = s.parentData?.ageBand || '7-8';
    document.getElementById('info-email').textContent = s.parentData?.parentEmail || 'Not provided';

    // Tags
    const tagsContainer = document.getElementById('info-tags');
    tagsContainer.innerHTML = scoringResult.profileTags.map(tag => `
      <span class="room-badge" style="background: var(--color-warm-white);">${tag}</span>
    `).join('');

    // Status badge
    const badge = document.getElementById('report-status-badge');
    badge.className = `badge-status status-${state.status}`;
    badge.textContent = state.status.charAt(0).toUpperCase() + state.status.slice(1);

    // Safeguard checkbox
    const checkSafeguard = document.getElementById('check-safeguard-flag');
    checkSafeguard.checked = state.safeguarded;

    // Authentic child artifacts
    const drawingContainer = document.getElementById('reviewer-drawing-container');
    if (s.drawingDataUrl) {
      drawingContainer.innerHTML = `<img src="${s.drawingDataUrl}" alt="Drawing" style="max-height: 180px; max-width: 100%; border-radius: var(--radius-sm);" />`;
    } else {
      drawingContainer.innerHTML = `<span class="text-muted">No drawing completed</span>`;
    }

    const ideasContainer = document.getElementById('reviewer-ideas-container');
    const ideas = s.creativityIdeas || [];
    if (ideas.length > 0) {
      ideasContainer.innerHTML = ideas.map(idea => `
        <span style="background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-full); padding: 4px 10px; font-size: 0.85rem;">
          ${idea}
        </span>
      `).join('');
    } else {
      ideasContainer.innerHTML = `<span class="text-muted">No ideas logged</span>`;
    }

    // Flagged misconceptions
    const misContainer = document.getElementById('reviewer-misconceptions-list');
    const flagged = scoringResult.academic?.flaggedMisconceptions || [];
    if (flagged.length > 0) {
      misContainer.innerHTML = flagged.map(m => `
        <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 10px; border-radius: var(--radius-sm); margin-bottom: 6px; font-size: 0.9rem;">
          <div style="font-weight: 700; color: #92400E;">${m.misconceptionId} (${m.occurrences}x)</div>
          <div style="color: var(--color-deep-ink-muted); margin-top: 2px;">Root Cause: <strong>${m.rootCauseSkill || 'Core concept'}</strong></div>
          <div style="font-size: 0.825rem; margin-top: 4px; color: var(--color-deep-ink);">${m.rootCauseAdvice || ''}</div>
        </div>
      `).join('');
    } else {
      misContainer.innerHTML = `<span class="text-muted" style="font-size: 0.9rem;">No repeated misconceptions flagged. Concept foundations appear balanced.</span>`;
    }

    // Detailed Event Log Table
    const tableBody = document.getElementById('event-table-body');
    const events = s.events || [];
    document.getElementById('event-count').textContent = events.length;

    tableBody.innerHTML = events.map(e => `
      <tr style="border-bottom: 1px solid var(--color-soft-sand-light);">
        <td style="padding: 6px; font-family: monospace;">${e.itemId || '-'}</td>
        <td style="padding: 6px;">${e.correct ? '<span style="color: green;">✓</span>' : (e.skipped ? '<span style="color: gray;">Skip</span>' : '<span style="color: red;">✗</span>')}</td>
        <td style="padding: 6px;">${e.confidence ? `${e.confidence}/3` : '-'}</td>
        <td style="padding: 6px;">${Math.round(e.latencyMs / 1000)}s</td>
        <td style="padding: 6px;">${e.strategyUsed || '-'}</td>
      </tr>
    `).join('');

    // Generate or populate narrative
    if (!state.narrative) {
      state.narrative = await ReportWriter.generateNarrative(scoringResult, planData);
    }

    document.getElementById('edit-noticed').value = state.narrative.whatWeNoticed || '';
    document.getElementById('edit-mean').value = state.narrative.whatItMayMean || '';
  },

  attachEvents() {
    const sId = () => this.currentSession?.id;

    // Safeguard toggle
    document.getElementById('check-safeguard-flag').addEventListener('change', (e) => {
      const state = this.sessionStateMap[sId()];
      if (state) {
        state.safeguarded = e.target.checked;
        if (state.safeguarded) {
          state.status = 'flagged';
        } else {
          state.status = 'draft';
        }
        const badge = document.getElementById('report-status-badge');
        badge.className = `badge-status status-${state.status}`;
        badge.textContent = state.status.charAt(0).toUpperCase() + state.status.slice(1);
      }
    });

    // Save review
    document.getElementById('btn-save-review').addEventListener('click', () => {
      const state = this.sessionStateMap[sId()];
      if (state) {
        state.narrative.whatWeNoticed = document.getElementById('edit-noticed').value;
        state.narrative.whatItMayMean = document.getElementById('edit-mean').value;
        if (state.status === 'draft') state.status = 'reviewed';
        const badge = document.getElementById('report-status-badge');
        badge.className = `badge-status status-${state.status}`;
        badge.textContent = state.status.charAt(0).toUpperCase() + state.status.slice(1);
        alert('Educator notes saved!');
      }
    });

    // Approve & Release
    document.getElementById('btn-approve-release').addEventListener('click', () => {
      const state = this.sessionStateMap[sId()];
      if (state) {
        if (state.safeguarded) {
          alert('Cannot release: This session is currently held for safeguarding review.');
          return;
        }
        state.status = 'released';
        const badge = document.getElementById('report-status-badge');
        badge.className = `badge-status status-${state.status}`;
        badge.textContent = 'Released';
        alert(`Report for ${this.currentSession.parentData?.firstName} approved & released to parent!`);
      }
    });

    // Preview Parent Page
    document.getElementById('btn-preview-parent').addEventListener('click', () => {
      const s = this.currentSession;
      const scoringResult = ScoringEngine.scoreSession(s, this.prereqGraph, this.responseBank);
      const planData = PlanGenerator.generatePlan(scoringResult, this.planTemplates, this.resourceMap);
      const state = this.sessionStateMap[s.id];

      // Store in sessionStorage and open preview
      sessionStorage.setItem('mentara_preview_session', JSON.stringify({
        scoringData: scoringResult,
        planData,
        reviewerNarrative: state?.narrative
      }));
      window.open('../index.html?mode=preview', '_blank');
    });

    // Regenerate narrative
    document.getElementById('btn-regenerate-narrative').addEventListener('click', async () => {
      const s = this.currentSession;
      const scoringResult = ScoringEngine.scoreSession(s, this.prereqGraph, this.responseBank);
      const planData = PlanGenerator.generatePlan(scoringResult, this.planTemplates, this.resourceMap);
      const fresh = await ReportWriter.generateNarrative(scoringResult, planData);
      
      const state = this.sessionStateMap[s.id];
      state.narrative = fresh;
      document.getElementById('edit-noticed').value = fresh.whatWeNoticed;
      document.getElementById('edit-mean').value = fresh.whatItMayMean;
    });
  }
};

window.addEventListener('DOMContentLoaded', () => ReviewerApp.init());
