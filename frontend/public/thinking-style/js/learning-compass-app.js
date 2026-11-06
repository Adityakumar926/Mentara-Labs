import { EIGHT_MISSIONS } from '../content/eight-missions.js';
import { MascotGuide } from './mascot.js';
import { VoiceEngine } from './voice-engine.js';
import { PersonalityEngine } from '../lib/scoring/personality-engine.js';
import { VisualAssetSystem } from './visual-asset-system.js';
import { Three3DScene } from './three-3d-scene.js';
import { ReportEngine } from './report-engine.js';

export const CompassApp = {
  state: {
    childName: 'Alex',
    ageBand: '7-9',
    stage: 3,
    currentMissionIndex: 0,
    answers: {},
    confidences: {},
    reflections: {},
    latencies: {},
    missionStartTime: 0,
    isReducedMotion: false,
    isVoiceMuted: false,
    isPaused: false
  },

  container: null,

  init(containerId = 'child-view-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('Target container not found:', containerId);
      return;
    }

    // Initialize humanish Indian female voice engine
    VoiceEngine.init();

    // Attach global voice and reduced motion listener
    this.setupGlobalControls();

    // Check URL parameters for direct level jump or report preview
    const params = new URLSearchParams(window.location.search);
    if (params.get('name')) {
      this.state.childName = params.get('name').trim();
    }
    if (params.get('stage')) {
      const parsedStage = parseInt(params.get('stage'), 10);
      if (!isNaN(parsedStage) && parsedStage >= 1 && parsedStage <= 6) {
        this.state.stage = parsedStage;
        this.state.ageBand = parsedStage <= 2 ? '5-7' : parsedStage <= 4 ? '7-9' : '9-11';
      }
    }
    if (params.get('ageBand') && ['5-7', '7-9', '9-11'].includes(params.get('ageBand'))) {
      this.state.ageBand = params.get('ageBand');
    }

    const returnUrl = params.get('returnUrl') || '/';
    const homeLink = document.getElementById('compass-home-link');
    if (homeLink) {
      homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.top.location.href = returnUrl;
      });
    }
    const backBtn = document.getElementById('btn-back-dashboard');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.top.location.href = returnUrl;
      });
    }

    const requestedLevel = parseInt(params.get('level'), 10);
    const isReportRequested = params.has('report') || params.get('report') === '1';
    const testProfileKey = params.get('profile') || params.get('test-profile');

    if (!isNaN(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 8) {
      this.renderMissionScreen(requestedLevel - 1);
    } else if (isReportRequested || testProfileKey) {
      let restoredFromStorage = false;
      if (!testProfileKey) {
        try {
          const savedRaw = localStorage.getItem('mentara_compass_completed_state');
          if (savedRaw) {
            const saved = JSON.parse(savedRaw);
            if (saved && saved.answers && Object.keys(saved.answers).length > 0) {
              const urlName = params.get('name') ? params.get('name').trim() : '';
              this.state.childName =
                saved.childName && saved.childName !== 'Alex'
                  ? saved.childName
                  : urlName || saved.childName || 'Explorer';
              this.state.stage = saved.stage || this.state.stage;
              this.state.ageBand = saved.ageBand || this.state.ageBand;
              this.state.answers = { ...saved.answers };
              this.state.confidences = { ...(saved.confidences || {}) };
              this.state.reflections = { ...(saved.reflections || {}) };
              this.state.latencies = { ...(saved.latencies || {}) };
              restoredFromStorage = true;
            }
          }
        } catch (e) {
          console.warn('Could not restore saved compass state:', e);
        }
      }

      if (testProfileKey && ReportEngine.TEST_PROFILES[testProfileKey]) {
        const p = ReportEngine.TEST_PROFILES[testProfileKey];
        this.state.childName = p.childName;
        this.state.stage = p.stage;
        this.state.ageBand = p.ageBand;
        this.state.answers = { ...p.answers };
      } else if (!restoredFromStorage && Object.keys(this.state.answers).length === 0) {
        // Load default completed test profile for immediate preview
        const p = ReportEngine.TEST_PROFILES['profile-a'];
        this.state.childName = p.childName;
        this.state.stage = p.stage;
        this.state.ageBand = p.ageBand;
        this.state.answers = { ...p.answers };
      }
      this.handleRevealReportClick();
    } else {
      // Start with Intro Screen
      this.renderIntroScreen();
    }
  },

  setupGlobalControls() {
    // Single clean voice narration toggle
    const btnVoice = document.getElementById('btn-voice-toggle');
    if (btnVoice) {
      btnVoice.addEventListener('click', () => {
        const isEnabled = VoiceEngine.toggleMute();
        this.state.isVoiceMuted = !isEnabled;
        btnVoice.setAttribute('aria-pressed', isEnabled.toString());
        const label = document.getElementById('voice-toggle-label');
        if (label) label.textContent = isEnabled ? 'Voice: On' : 'Voice: Muted';
        const icon = btnVoice.querySelector('.icon');
        if (icon) icon.textContent = isEnabled ? '🔊' : '🔇';
      });
    }
  },

  speakText(text) {
    VoiceEngine.speak(text);
  },

  /* ==========================================================================
     1. INTRO SCREEN (CLEAN, MINIMAL, ONE PRIMARY ACTION)
     ========================================================================== */
  renderIntroScreen() {
    document.body.className = 'theme-intro';

    const headerBadge = document.getElementById('header-levels-badge');
    if (headerBadge) {
      headerBadge.innerHTML = `
        <img src="assets/3d/compass-3d-crystal.png" style="width: 20px; height: 20px; object-fit: contain; vertical-align: middle;" alt="Level Compass" />
        <span style="font-weight: 850; letter-spacing: 0.04em;">8 ADVENTURE LEVELS</span>
      `;
    }

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 760px; margin: 36px auto; padding: clamp(24px, 4vw, 44px); position: relative; z-index: 2;">
        
        <!-- Welcome Hero with 3D Pip & 3D Crystal Compass -->
        <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap; margin-bottom: 26px;">
          <div style="display: flex; align-items: center; gap: 16px; margin: 0 auto;">
            <div style="width: 104px; height: 104px; flex-shrink: 0;" id="intro-character-box">
              ${VisualAssetSystem.renderCharacterSvg('pip', 'welcome', 104)}
            </div>
            <div style="width: 104px; height: 104px; flex-shrink: 0; border-radius: 50%; background: radial-gradient(circle, rgba(234, 228, 255, 0.65) 0%, rgba(223, 237, 255, 0.3) 50%, transparent 72%); display: flex; align-items: center; justify-content: center;" id="intro-3d-compass-box" aria-label="Interactive 3D Compass Artifact">
              ${MascotGuide.render3DCompassSvg(96)}
            </div>
          </div>
          <div style="flex: 1; min-width: 260px; text-align: left;">
            <div class="eyebrow" style="background: rgba(124, 58, 237, 0.1); color: #7C3AED; border: 1.5px solid rgba(124, 58, 237, 0.3); padding: 4px 14px; border-radius: 20px; display: inline-block; margin-bottom: 8px; font-weight: 850;">
              Cambridge Primary • 8 Adventure Levels
            </div>
            <h1 style="font-size: clamp(1.8rem, 3.2vw, 2.3rem); color: var(--text-primary); margin-bottom: 6px; font-weight: 850; letter-spacing: -0.01em;">
              Discover Your Thinking Style
            </h1>
            <p style="font-size: 1.02rem; color: var(--text-secondary); line-height: 1.55; font-weight: 600;">
              Journey through <strong>8 exciting thinking levels</strong> with Pip and our cast of guide explorers! There are no wrong answers—only discovering how your curious mind works best.
            </p>
            <div style="margin-top: 14px; display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(23, 122, 83, 0.08) 100%); border: 1.5px solid rgba(124, 58, 237, 0.25); border-radius: 14px; padding: 8px 14px;">
              <span style="font-size: 1.2rem;">🎓</span>
              <div style="text-align: left; line-height: 1.35;">
                <div style="font-size: 0.84rem; font-weight: 850; color: #4C1D95;">
                  Conceptualised and crafted by Ms. Sakshi Srivastava
                </div>
                <div style="font-size: 0.76rem; font-weight: 700; color: #177A53;">
                  B.Sc. Psychology · B.Ed. · Child Educator
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 8-Level Visual Roadmap with Bespoke 3D Objects -->
        <div class="glass-panel-sub" style="padding: 22px 20px; margin-bottom: 24px; border: 1.5px solid #C4B5FD; border-radius: 22px; background: rgba(255, 255, 255, 0.94);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="color: #1A2433; font-size: 1.05rem; font-weight: 850;">Your 8 Exploration Levels</strong>
            </div>
            <span style="font-size: 0.8rem; font-weight: 850; color: #5B21B6; background: #EAE4FF; border: 1px solid #DDD6FE; padding: 4px 12px; border-radius: 9999px;">
              8 Levels • ~12–15 Minutes Total
            </span>
          </div>

          <p style="font-size: 0.88rem; color: #506173; font-weight: 600; margin-bottom: 16px; line-height: 1.5;">
            Complete all 8 levels to unlock your personalized Cambridge Primary Learning Profile report!
          </p>

          <!-- 8 Levels Grid: 4 columns across on desktop -->
          <div class="adventure-tiles-grid">
            ${EIGHT_MISSIONS.map((m, i) => `
              <div class="adventure-tile" tabindex="0" role="region" aria-label="Level ${i + 1}: ${m.name}">
                <div class="tile-level-badge">Level ${i + 1} of 8</div>
                <div class="tile-3d-box">
                  <img src="${m.object3dImg}" class="tile-3d-icon ${m.animClass}" alt="${m.name} 3D Artifact" loading="lazy" />
                </div>
                <div class="tile-title">${m.name}</div>
                <div class="tile-character">${m.characterName}</div>
                <div class="tile-subtitle">${m.actionSubtitle}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Child Profile Setup Form (Simplified to Name & Age Band) -->
        <div class="glass-panel-sub" style="padding: 20px 24px; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label for="input-child-name" style="display: block; font-weight: 800; font-size: 0.9rem; color: var(--ink); margin-bottom: 6px;">
                Explorer Name:
              </label>
              <input type="text" id="input-child-name" value="${this.state.childName}" class="form-input" placeholder="e.g. Alex, Maya, Aarav">
            </div>

            <div>
              <label style="display: block; font-weight: 800; font-size: 0.9rem; color: var(--ink); margin-bottom: 6px;">
                Age Group:
              </label>
              <div style="display: flex; gap: 6px;">
                ${['5-7', '7-9', '9-11'].map(band => `
                  <button type="button" class="btn-age-band ${this.state.ageBand === band ? 'active' : ''}" data-band="${band}" style="flex: 1; min-height: 44px; padding: 6px 4px; border-radius: 12px; font-size: 0.85rem; font-weight: 800; cursor: pointer;">
                    ${band}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- ONE Clear Primary Call to Action -->
        <div style="text-align: center; margin-bottom: 18px;">
          <button id="btn-start-adventure" type="button" class="btn-primary" style="width: 100%; max-width: 380px; padding: 16px 32px; font-size: 1.2rem; border-radius: 26px; justify-content: center;">
            <span>Start Level 1 of 8</span>
            <span>🚀</span>
          </button>
        </div>

        <!-- Subtle Footer Note with Secondary Details Link -->
        <div style="text-align: center; font-size: 0.8rem; color: #647184; font-weight: 600;">
          <span>Formative pedagogical exploration • </span>
          <button id="btn-show-research" type="button" style="background: none; border: none; color: #177A53; font-weight: 800; text-decoration: underline; cursor: pointer; padding: 0;">
            Research & Methodology
          </button>
        </div>
      </div>
    `;

    // Event handlers
    const nameInput = document.getElementById('input-child-name');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.state.childName = e.target.value.trim() || 'Explorer';
      });
    }

    const bandButtons = this.container.querySelectorAll('.btn-age-band');
    bandButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        bandButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.ageBand = btn.getAttribute('data-band');
      });
    });

    document.getElementById('btn-start-adventure').addEventListener('click', () => {
      this.state.currentMissionIndex = 0;
      this.renderMissionScreen(0);
    });

    const btnResearch = document.getElementById('btn-show-research');
    if (btnResearch) {
      btnResearch.addEventListener('click', () => {
        this.openResearchModal();
      });
    }
  },

  /* ==========================================================================
     2. MISSION TRACKER (EXPLICIT 8-LEVEL STEPPER & PROGRESS BAR)
     ========================================================================== */
  renderMissionTracker(currentIndex) {
    const total = EIGHT_MISSIONS.length;
    const progressPercent = Math.round(((currentIndex) / total) * 100);
    const mission = EIGHT_MISSIONS[currentIndex];
    const remainingCount = total - (currentIndex + 1);

    return `
      <div style="margin-bottom: 18px;">
        <!-- Top Status Bar with Level Details -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: linear-gradient(135deg, #7C3AED 0%, #6366F1 100%); color: #FFFFFF; font-weight: 900; font-size: 0.84rem; padding: 5px 14px; border-radius: 9999px; letter-spacing: 0.04em; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);">
              LEVEL ${currentIndex + 1} OF ${total}
            </span>
            <span style="font-weight: 850; font-size: 1.05rem; color: #1A2433;">
              ${mission.name}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.82rem; font-weight: 800; color: #506173;">
              ${remainingCount === 0 ? '🎉 Final Level!' : `${remainingCount} ${remainingCount === 1 ? 'level' : 'levels'} to go`}
            </span>
            <span style="font-size: 0.8rem; font-weight: 850; color: #7C3AED; font-family: var(--font-mono);">${progressPercent}%</span>
          </div>
        </div>

        <!-- 8-Level Stepper Node Bar -->
        <div class="levels-stepper-container" role="progressbar" aria-valuenow="${currentIndex + 1}" aria-valuemin="1" aria-valuemax="${total}" aria-label="8 Levels Progress">
          ${EIGHT_MISSIONS.map((m, i) => {
            const isCompleted = i < currentIndex;
            const isActive = i === currentIndex;
            const stateClass = isCompleted ? 'completed' : (isActive ? 'active' : 'upcoming');
            const label = isCompleted ? `✓ L${i+1}` : (isActive ? `★ Level ${i+1}` : `L${i+1}`);
            return `
              <div class="level-step-node ${stateClass}" title="Level ${i+1}: ${m.name}">
                <span>${label}</span>
                ${isActive ? `<span style="font-size: 0.72rem; font-weight: 850; margin-left: 2px;">• ${m.name}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /* ==========================================================================
     3. ASSESSMENT MISSION SCREEN (ONE CLEAR TASK AT A TIME)
     ========================================================================== */
  renderMissionScreen(missionIndex) {
    if (missionIndex >= EIGHT_MISSIONS.length) {
      this.renderFinalReport();
      return;
    }

    const mission = EIGHT_MISSIONS[missionIndex];
    this.state.currentMissionIndex = missionIndex;
    this.state.missionStartTime = performance.now();

    // Set page theme class
    document.body.className = mission.themeClass;

    // Update Top App Header Level Badge to match reference pill
    const headerBadge = document.getElementById('header-levels-badge');
    if (headerBadge) {
      headerBadge.innerHTML = `
        <img src="assets/3d/compass-3d-crystal.png" style="width: 20px; height: 20px; object-fit: contain; vertical-align: middle;" alt="Level Compass" />
        <span style="font-weight: 850; letter-spacing: 0.04em;">LEVEL ${missionIndex + 1} OF 8</span>
      `;
    }

    // Speak intro dialogue
    this.speakText(mission.introDialogue);

    // BESPOKE REDESIGN FOR PATTERN PLANET (MISSION 1)
    if (mission.id === 'mission-pattern-planet') {
      this.container.innerHTML = `
        <div class="screen-enter" style="max-width: 680px; margin: 0 auto;">
          <main class="calm-card" style="padding: clamp(20px, 4vw, 32px); border-radius: 28px; background: rgba(255, 255, 255, 0.95); border: 1.5px solid rgba(234, 228, 255, 0.8); box-shadow: 0 16px 40px rgba(74, 59, 105, 0.08);">
            
            <!-- A. Mission Introduction Section with 3D Pip Mascot -->
            <div class="pattern-intro-section">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <div style="width: 48px; height: 48px; border-radius: 14px; background: #FFFFFF; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(67, 73, 112, 0.06); flex-shrink: 0;">
                    <img src="${mission.object3dImg}" alt="${mission.name} 3D Artifact" style="width: 40px; height: 40px; object-fit: contain;" />
                  </div>
                  <div class="eyebrow" style="font-size: 0.72rem; font-weight: 850; color: #7C3AED; background: #F3EEFF; border: 1px solid #E4D7FE; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em;">
                    ${mission.name.toUpperCase()} • ${mission.dimension.toUpperCase()}
                  </div>
                </div>

                <h1 style="font-size: clamp(1.85rem, 3.2vw, 2.35rem); font-weight: 850; color: #1A2433; margin: 0 0 8px; letter-spacing: -0.01em;">
                  ${mission.name}
                </h1>
                <p style="font-size: 0.95rem; color: #506173; line-height: 1.55; font-weight: 600; margin: 0 0 16px;">
                  Welcome to Pattern Planet! Join Pip, your Pattern Scout. Look closely at the glowing crystals and complete the constellation!
                </p>

                <div style="display: flex; align-items: center; gap: 10px;">
                  <button type="button" class="action-pill-btn btn-listen-speech" data-text="Welcome to Pattern Planet! Join Pip, your Pattern Scout. Look closely at the glowing crystals and complete the constellation!" aria-label="Listen to voice guidance">
                    <span style="font-size: 1.05rem;" aria-hidden="true">🔊</span>
                    <span>Listen</span>
                  </button>
                  <button type="button" class="action-pill-btn" id="btn-toggle-hint" aria-expanded="false" aria-label="Need a clue?">
                    <span style="font-size: 1.05rem;" aria-hidden="true">💡</span>
                    <span>Need a clue?</span>
                  </button>
                </div>
              </div>

              <!-- Pip 3D Mascot & Speech Bubble -->
              <div style="flex-shrink: 0; display: flex; flex-direction: column; align-items: center; position: relative; margin: 0 auto;">
                <div class="pip-mascot-box anim-pip-float" style="width: 154px; height: 154px;">
                  <img id="pip-mission-img" src="assets/3d/pip-welcome.png" alt="Pip the Pattern Scout" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 10px 22px rgba(74, 59, 105, 0.18));" />
                </div>
                <div id="pip-speech-bubble" class="pip-speech-bubble" style="max-width: 210px; margin-top: -8px;">
                  <div class="bubble-arrow"></div>
                  <span id="pip-speech-text">Welcome to Pattern Planet! Look closely at the glowing crystals.</span>
                </div>
              </div>
            </div>

            <!-- B. Main Puzzle Area: Liquid-Glass 3x3 Grid Panel -->
            <div class="puzzle-glass-panel">
              <!-- Decorative 3D Ambient Planets and Crystals -->
              <div style="position: absolute; left: -24px; top: 38%; pointer-events: none; width: 62px; height: 62px;" class="anim-float-slow">
                <img src="assets/3d/object-pattern-planet.png" alt="Decorative Planet" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(74, 59, 105, 0.15));" />
              </div>
              <div style="position: absolute; right: -20px; top: 46%; pointer-events: none; width: 52px; height: 52px;" class="anim-float-reverse">
                <img src="assets/3d/object-memory-forest.png" alt="Decorative Crystal" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(74, 59, 105, 0.15));" />
              </div>

              <!-- Question Header Prompt -->
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 22px; text-align: center;">
                <span style="font-size: 1.35rem; color: #F59E0B;" aria-hidden="true">✦</span>
                <h2 style="font-size: clamp(1.08rem, 2vw, 1.25rem); font-weight: 850; color: #1A2433; margin: 0; line-height: 1.4;">
                  Study the constellation. Which crystal belongs in the glowing spot?
                </h2>
              </div>

              <!-- 3×3 Scalable Geometric Matrix Grid -->
              <div class="matrix-grid-3x3" role="region" aria-label="3 by 3 geometric pattern matrix">
                <!-- Row 1: Circles, Squares, Triangles with Dot -->
                <div class="matrix-cell" title="Circle with dot center">
                  <svg viewBox="0 0 54 54" width="54" height="54"><circle cx="27" cy="27" r="21" fill="none" stroke="#10B981" stroke-width="3.5"/><circle cx="27" cy="27" r="6" fill="#F97316"/></svg>
                </div>
                <div class="matrix-cell" title="Square with dot center">
                  <svg viewBox="0 0 54 54" width="54" height="54"><rect x="8" y="8" width="38" height="38" rx="8" fill="none" stroke="#10B981" stroke-width="3.5"/><circle cx="27" cy="27" r="6" fill="#F97316"/></svg>
                </div>
                <div class="matrix-cell" title="Triangle with dot center">
                  <svg viewBox="0 0 54 54" width="54" height="54"><polygon points="27,6 49,44 5,44" fill="none" stroke="#10B981" stroke-width="3.5" stroke-linejoin="round"/><circle cx="27" cy="32" r="6" fill="#F97316"/></svg>
                </div>

                <!-- Row 2: Circles, Squares, Triangles with Plus -->
                <div class="matrix-cell" title="Circle with plus center">
                  <svg viewBox="0 0 54 54" width="54" height="54"><circle cx="27" cy="27" r="21" fill="none" stroke="#10B981" stroke-width="3.5"/><line x1="16" y1="27" x2="38" y2="27" stroke="#F97316" stroke-width="4.2" stroke-linecap="round"/><line x1="27" y1="16" x2="27" y2="38" stroke="#F97316" stroke-width="4.2" stroke-linecap="round"/></svg>
                </div>
                <div class="matrix-cell" title="Square with plus center">
                  <svg viewBox="0 0 54 54" width="54" height="54"><rect x="8" y="8" width="38" height="38" rx="8" fill="none" stroke="#10B981" stroke-width="3.5"/><line x1="16" y1="27" x2="38" y2="27" stroke="#F97316" stroke-width="4.2" stroke-linecap="round"/><line x1="27" y1="16" x2="27" y2="38" stroke="#F97316" stroke-width="4.2" stroke-linecap="round"/></svg>
                </div>
                <div class="matrix-cell" title="Triangle with plus center">
                  <svg viewBox="0 0 54 54" width="54" height="54"><polygon points="27,6 49,44 5,44" fill="none" stroke="#10B981" stroke-width="3.5" stroke-linejoin="round"/><line x1="16" y1="32" x2="38" y2="32" stroke="#F97316" stroke-width="4.2" stroke-linecap="round"/><line x1="27" y1="21" x2="27" y2="43" stroke="#F97316" stroke-width="4.2" stroke-linecap="round"/></svg>
                </div>

                <!-- Row 3: Circles, Squares, Triangles with Diamond -->
                <div class="matrix-cell" title="Circle with diamond center">
                  <svg viewBox="0 0 54 54" width="54" height="54"><circle cx="27" cy="27" r="21" fill="none" stroke="#10B981" stroke-width="3.5"/><polygon points="27,17 37,27 27,37 17,27" fill="#F97316"/></svg>
                </div>
                <div class="matrix-cell" title="Square with diamond center">
                  <svg viewBox="0 0 54 54" width="54" height="54"><rect x="8" y="8" width="38" height="38" rx="8" fill="none" stroke="#10B981" stroke-width="3.5"/><polygon points="27,17 37,27 27,37 17,27" fill="#F97316"/></svg>
                </div>
                <!-- Missing Answer Spot -->
                <div class="matrix-cell-missing" title="Missing spot to solve">
                  <span style="font-size: 2.5rem; font-weight: 900; color: #EA580C; font-family: 'Fraunces', serif;">?</span>
                </div>
              </div>
            </div>

            <!-- C. 2x2 Answer Cards Grid -->
            <div class="pattern-choices-grid" role="radiogroup" aria-label="Pattern Planet Answer Choices">
              ${mission.options.map((opt) => `
                <button type="button" role="radio" aria-checked="false" class="choice-card-btn pattern-choice-card" data-opt-id="${opt.id}" data-correct="${opt.correct}" data-trait="${opt.trait}">
                  <div class="pattern-choice-preview">
                    ${opt.svgHtml}
                  </div>
                  <div class="pattern-choice-label">
                    ${opt.text}
                  </div>
                  <div class="pattern-choice-check" aria-hidden="true">
                    <svg viewBox="0 0 20 20" width="20" height="20">
                      <circle cx="10" cy="10" r="10" fill="#10B981"/>
                      <path d="M6 10 L8.8 13 L14 7.2" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
                  </div>
                </button>
              `).join('')}
            </div>

            <!-- D. Bottom Navigation & Progress -->
            <div class="pattern-footer-bar" style="display: flex; justify-content: space-between; align-items: center; margin-top: 28px; padding-top: 20px; border-top: 1.5px solid rgba(226, 232, 240, 0.8); flex-wrap: wrap; gap: 16px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #7C3AED; display: inline-block;"></span>
                  ${[2,3,4,5,6,7,8].map(() => `<span style="width: 8px; height: 8px; border-radius: 50%; background: #CBD5E1; display: inline-block;"></span>`).join('')}
                </div>
                <div style="font-size: 0.82rem; font-weight: 750; color: #647184;">
                  1 of 8 missions
                </div>
              </div>

              <button id="btn-submit-mission" type="button" class="btn-continue-pill" disabled>
                <span>Continue</span>
                <span style="font-size: 1.25rem; font-weight: 900;">→</span>
              </button>
            </div>

          </main>
        </div>
      `;
    } else {
      // General Mission layout for other missions
      this.container.innerHTML = `
        <div class="screen-enter" style="max-width: 760px; margin: 0 auto;">
          
          <!-- Mission Progress Tracker -->
          ${this.renderMissionTracker(missionIndex)}

          <!-- Main Card (Solid High-Contrast Calm Card) -->
          <main class="calm-card" style="padding: clamp(22px, 3.5vw, 36px);">
            
            <!-- Scene Title & Strand -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255, 255, 255, 0.95); border: 1.5px solid var(--border-subtle, #EAE2D6); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(67, 73, 112, 0.06); flex-shrink: 0;">
                  <img src="${mission.object3dImg}" class="${mission.animClass}" style="width: 34px; height: 34px; object-fit: contain;" alt="${mission.name} 3D Artifact" />
                </div>
                <div>
                  <div style="font-size: 0.78rem; font-weight: 850; color: #7C3AED; text-transform: uppercase; letter-spacing: 0.05em;">Level ${missionIndex + 1} of 8 • ${mission.dimension}</div>
                  <h1 style="font-size: 1.35rem; color: #1A2433; font-weight: 850; margin: 0;">${mission.name}</h1>
                </div>
              </div>
              <div class="level-indicator-pill" style="font-size: 0.78rem; padding: 4px 12px;">
                <span>Level ${missionIndex + 1}/8</span>
              </div>
            </div>

            <!-- Assigned Distinct Mission Character -->
            ${MascotGuide.renderStage(mission.introDialogue, {
              state: 'instructions',
              characterKey: mission.characterKey || 'pip',
              characterName: mission.characterName || 'Pip',
              speakerTitle: `${mission.characterName || 'Pip'} • ${mission.characterRole || 'Guide'}`,
              canSpeak: !this.state.isVoiceMuted,
              hintText: mission.hint
            })}

            <!-- Challenge Question Stem & Visual -->
            <section class="question-container" aria-label="Assessment Challenge" style="margin-top: 14px;">
              <h2 class="question-stem" style="font-size: clamp(1.15rem, 2.2vw, 1.35rem); color: #1A2433; font-weight: 750; line-height: 1.5; margin-bottom: 16px;">
                ${mission.stem}
              </h2>

              ${mission.visualHtml}

              <!-- Answer Options -->
              <div style="margin-top: 22px;">
                <div class="choice-cards-grid" role="radiogroup" aria-label="Challenge Options">
                  ${mission.options.map((opt, i) => `
                    <button type="button" role="radio" aria-checked="false" class="choice-card-btn" data-opt-id="${opt.id}" data-correct="${opt.correct}" data-trait="${opt.trait}">
                      <span class="choice-marker">${opt.icon || String.fromCharCode(65 + i)}</span>
                      <span style="flex: 1; font-weight: 750; font-size: 1rem; color: #1A2433;">${opt.text}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Action Button -->
              <div style="display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 18px; border-top: 1.5px solid rgba(215, 228, 238, 0.6);">
                <button id="btn-submit-mission" type="button" class="btn-continue-pill" disabled>
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            </section>
          </main>
        </div>
      `;
    }

    this.attachMissionEvents(mission);
  },

  attachMissionEvents(mission) {
    let selectedOption = null;
    let hintEverUsed = false;

    // Hint toggle with Pip reaction
    const btnHint = document.getElementById('btn-toggle-hint');
    const drawerHint = document.getElementById('drawer-hint');
    const pipImg = document.getElementById('pip-mission-img');
    const pipSpeechText = document.getElementById('pip-speech-text');
    let hintActive = false;

    if (btnHint) {
      btnHint.addEventListener('click', () => {
        hintActive = !hintActive;
        if (hintActive) {
          hintEverUsed = true;
        }
        btnHint.setAttribute('aria-expanded', hintActive.toString());

        if (drawerHint) {
          drawerHint.style.display = hintActive ? 'block' : 'none';
        }

        if (pipSpeechText && pipImg) {
          if (hintActive) {
            pipSpeechText.innerHTML = `💡 <strong>Pip's Clue:</strong> ${mission.hint || 'Notice how the outer shape stays the same along each column, while the center changes across rows!'}`;
            pipImg.src = 'assets/3d/pip-thinking.png';
            this.speakText(mission.hint || "Notice how the outer shape stays the same along each column, while the center symbol changes across rows!");
          } else {
            pipSpeechText.innerText = "Welcome to Pattern Planet! Look closely at the glowing crystals.";
            pipImg.src = 'assets/3d/pip-welcome.png';
          }
        }
      });
    }

    // Audio read aloud button
    const btnListen = this.container.querySelector('.btn-listen-speech');
    if (btnListen) {
      btnListen.addEventListener('click', (e) => {
        const text = e.currentTarget.getAttribute('data-text');
        this.speakText(text);
      });
    }

    // Option cards selection
    const choiceButtons = this.container.querySelectorAll('.choice-card-btn');
    const submitBtn = document.getElementById('btn-submit-mission');

    choiceButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        choiceButtons.forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');

        selectedOption = {
          id: btn.getAttribute('data-opt-id'),
          correct: btn.getAttribute('data-correct') === 'true',
          trait: btn.getAttribute('data-trait')
        };

        // Activate Pip joyful reaction
        if (pipImg && pipSpeechText) {
          pipImg.src = 'assets/3d/pip-celebrate.png';
          pipSpeechText.innerText = "Great choice! Click Continue to save your discovery.";
        }

        // Activate Continue button immediately
        if (submitBtn) {
          submitBtn.removeAttribute('disabled');
        }
      });
    });

    // Instant query parameter hook for visual verification of option selection
    if (new URLSearchParams(window.location.search).get('select') && choiceButtons.length > 0) {
      choiceButtons[0].click();
    }

    // Submit / Continue handler
    submitBtn.addEventListener('click', () => {
      if (!selectedOption) return;

      const latencyMs = Math.round(performance.now() - this.state.missionStartTime);

      // Record in state
      this.state.answers[mission.id] = {
        missionId: mission.id,
        dimensionKey: mission.dimensionKey,
        selectedOption,
        confidence: 2,
        latencyMs,
        hintUsed: hintEverUsed
      };

      // Sync with global SessionState for Reviewer and Parent Report
      if (window.SessionState) {
        if (!window.SessionState.events) window.SessionState.events = [];
        window.SessionState.events.push({
          itemId: mission.id,
          strand: mission.dimensionKey,
          selectedOption: selectedOption.id,
          correct: selectedOption.correct,
          confidence: 2,
          optTrait: selectedOption.trait,
          latencyMs: latencyMs,
          timestamp: Date.now()
        });
        window.SessionState.parentData = {
          firstName: this.state.childName,
          stage: this.state.stage,
          ageBand: this.state.ageBand,
          parentEmail: 'parent@example.com'
        };
      }

      // Move to celebratory transition
      this.renderMissionTransition(mission);
    });
  },

  /* ==========================================================================
     4. MISSION TRANSITION & CELEBRATION
     ========================================================================== */
  renderMissionTransition(completedMission) {
    try {
      localStorage.setItem('mentara_compass_completed_state', JSON.stringify(this.state));
    } catch (e) {
      // ignore storage errors
    }
    const isFinalMission = completedMission.index >= EIGHT_MISSIONS.length;
    const nextMission = !isFinalMission ? EIGHT_MISSIONS[completedMission.index] : null;

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 680px; margin: 30px auto; text-align: center; border: 2px solid var(--mission-border, rgba(120, 191, 165, 0.5)); border-radius: 28px; padding: 42px 28px;">
        
        <!-- Character Celebration Animation & 3D Mission Object -->
        <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 20px;">
          <div style="width: 104px; height: 104px;">
            ${VisualAssetSystem.renderCharacterSvg('pip', 'celebrate', 104)}
          </div>
          <div style="width: 88px; height: 88px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(234, 228, 255, 0.6) 0%, transparent 70%); border-radius: 50%;">
            <img src="${completedMission.object3dImg}" class="${completedMission.animClass}" style="width: 72px; height: 72px; object-fit: contain;" alt="${completedMission.name} 3D Artifact" />
          </div>
        </div>

        <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(234, 247, 240, 0.95); color: #11422E; padding: 6px 16px; border-radius: 20px; font-weight: 850; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px; border: 1.5px solid #78BFA5; box-shadow: 0 2px 6px rgba(56, 163, 126, 0.15);">
          ✓ Level ${completedMission.index} of 8 (${completedMission.name}) Completed!
        </div>

        <h1 style="font-size: clamp(1.85rem, 3.2vw, 2.4rem); color: #1A2433; margin-bottom: 12px; font-weight: 850;">
          Super Work, ${this.state.childName}!
        </h1>

        <p style="font-size: 1.05rem; color: #374659; max-width: 500px; margin: 0 auto 24px; line-height: 1.6; font-weight: 600;">
          <strong>${completedMission.characterName || 'Your guide'}</strong> has logged your Level ${completedMission.index} results in your Expedition Compass.
        </p>

        <!-- Next Level Teaser with Next 3D Artifact -->
        ${nextMission ? `
          <div class="glass-panel-sub" style="background: rgba(255, 255, 255, 0.94); border: 2px dashed ${nextMission.accentColor}; border-radius: 20px; padding: 18px 24px; max-width: 480px; margin: 0 auto 30px; display: flex; align-items: center; gap: 16px; text-align: left;">
            <div style="width: 58px; height: 58px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(234, 228, 255, 0.5) 0%, transparent 70%); border-radius: 50%;">
              <img src="${nextMission.object3dImg}" class="${nextMission.animClass}" style="width: 50px; height: 50px; object-fit: contain;" alt="${nextMission.name} 3D Artifact" />
            </div>
            <div>
              <div style="font-size: 0.8rem; font-weight: 850; text-transform: uppercase; color: #7C3AED; letter-spacing: 0.05em;">
                Up Next: Level ${completedMission.index + 1} of 8 with ${nextMission.characterName}:
              </div>
              <div style="font-weight: 850; font-size: 1.25rem; color: #1A2433; margin: 2px 0;">
                ${nextMission.name}
              </div>
              <div style="font-size: 0.88rem; color: #506173; font-weight: 600;">
                ${nextMission.actionSubtitle} • ${8 - completedMission.index} ${8 - completedMission.index === 1 ? 'level' : 'levels'} remaining
              </div>
            </div>
          </div>
        ` : `
          <div class="glass-panel-sub" style="background: rgba(255, 249, 241, 0.95); border: 2px solid #E5A83B; border-radius: 20px; padding: 22px 28px; max-width: 480px; margin: 0 auto 30px;">
            <div style="font-size: 2.6rem; margin-bottom: 8px;">🏆</div>
            <div style="font-weight: 850; font-size: 1.35rem; color: #1A2433;">All 8 Levels Explored!</div>
            <div style="font-size: 0.95rem; color: #506173; margin-top: 6px; font-weight: 600;">Your Cambridge Primary Learning Compass Profile is now complete.</div>
          </div>
        `}

        <button id="btn-continue-journey" type="button" class="btn-primary" style="padding: 16px 42px; font-size: 1.2rem; border-radius: 28px; display: inline-flex; align-items: center; gap: 10px; cursor: pointer;">
          <span>${nextMission ? `Start Level ${completedMission.index + 1} (${nextMission.name}) →` : 'Reveal Final Discovery Report 📜'}</span>
        </button>
      </div>
    `;

    // Mount Lottie celebration stars
    const lottieBox = document.getElementById('transition-lottie-stars');
    if (lottieBox && window.lottie) {
      VisualAssetSystem.mountLottie(lottieBox, 'celebration-stars');
    }

    document.getElementById('btn-continue-journey').addEventListener('click', () => {
      if (nextMission) {
        this.renderMissionScreen(completedMission.index);
      } else {
        this.handleRevealReportClick();
      }
    });
  },

  handleRevealReportClick() {
    try {
      localStorage.setItem('mentara_compass_completed_state', JSON.stringify(this.state));
    } catch (e) {
      // ignore storage errors
    }

    const params = new URLSearchParams(window.location.search);
    let hasAuth = params.get('authed') === '1';
    try {
      if (window.top?.localStorage?.getItem('accessToken') || localStorage.getItem('accessToken')) {
        hasAuth = true;
      }
    } catch (e) {
      // ignore cross-frame storage errors
    }

    if (!hasAuth) {
      try {
        localStorage.setItem('mentara_compass_pending_report', '1');
        localStorage.setItem('mentara_post_auth_redirect', '/discover-thinking-style?report=1');
        sessionStorage.setItem('mentara_post_auth_redirect', '/discover-thinking-style?report=1');
      } catch (e) {
        // ignore
      }

      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'COMPASS_REQUIRE_AUTH_FOR_REPORT',
            payload: this.state
          }, '*');
          return;
        }
      } catch (e) {
        // ignore
      }

      window.top.location.href = '/register?redirect=' + encodeURIComponent('/discover-thinking-style?report=1');
      return;
    }

    this.renderFinalReport();
  },

  /* ==========================================================================
     5. FINAL DISCOVERY REPORT (SIMPLIFIED TO 4 CORE PILLARS)
     ========================================================================== */
  /* ==========================================================================
     5. FINAL DISCOVERY REPORT (AUTHENTIC 9-SECTION EDUCATIONAL ASSESSMENT)
     ========================================================================== */
  renderFinalReport() {
    document.body.className = 'theme-learning-detective';

    // Generate comprehensive pedagogical assessment from ReportEngine
    const report = ReportEngine.generateReport(this.state);
    const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/';

    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'COMPASS_ASSESSMENT_COMPLETE',
          payload: {
            childName: this.state.childName,
            stage: this.state.stage,
            ageBand: this.state.ageBand,
            answers: this.state.answers,
            report
          }
        }, '*');
      }
    } catch (e) {
      // ignore cross-frame errors
    }

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 820px; margin: 30px auto; padding: clamp(24px, 4vw, 44px); border-radius: 28px;" id="printable-compass-report">
        
        <!-- Expedition Waypoint Journey Banner -->
        <div style="border-radius: 18px; overflow: hidden; margin-bottom: 22px; border: 1.5px solid var(--border-subtle, #EAE2D6); box-shadow: 0 4px 16px rgba(67, 73, 112, 0.05); background: #FFFFFF;">
          <img src="assets/illustrations/report-expedition.svg" alt="Mentp 8-Island Learning Expedition Journey" style="width: 100%; height: auto; max-height: 160px; object-fit: cover; display: block;" />
        </div>

        <!-- Header -->
        <header style="border-bottom: 2px solid rgba(220, 232, 240, 0.7); padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
              <span class="room-badge" style="background: rgba(124, 58, 237, 0.12); border: 1.5px solid #C4B5FD; color: #5B21B6; font-weight: 850; font-size: 0.82rem;">
                🏆 All 8 Levels Completed
              </span>
              <span class="room-badge" style="background: rgba(223, 244, 234, 0.95); border: 1.5px solid #78BFA5; color: #11422E; font-weight: 800; font-size: 0.8rem;">
                Cambridge Primary • Stage ${report.stage}
              </span>
              <span style="font-size: 0.78rem; color: #647184; font-weight: 700;">
                Version ${report.version} • ${report.dateString}
              </span>
            </div>
            <h1 style="font-size: clamp(1.75rem, 3.2vw, 2.3rem); color: #1A2433; margin: 4px 0; font-weight: 850;">
              ${report.childName}'s Thinking Style Profile
            </h1>
            <p style="font-size: 0.95rem; color: #506173; font-weight: 600;">
              Discover Your Thinking Style — A formative evaluation of thinking skills and tailored learning roadmap.
            </p>
            <div style="margin-top: 8px; font-size: 0.82rem; font-weight: 800; color: #4C1D95;">
              🎓 Conceptualised and crafted by Ms. Sakshi Srivastava <span style="color: #177A53; font-weight: 700;">• B.Sc. Psychology · B.Ed. · Child Educator</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button id="btn-print-compass-report" class="btn-secondary btn-sm" type="button" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px;">
              <span>Print / Save PDF</span>
              <span>📄</span>
            </button>
            <a href="${returnUrl}" target="_top" class="btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; text-decoration: none;">
              <span>Return to Dashboard</span>
              <span>➔</span>
            </a>
          </div>
        </header>

        <!-- Test Profile Switcher Bar (For parent & educator verification) -->
        <div class="profile-switch-bar" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 10px 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 0.82rem; font-weight: 800; color: #475569; display: flex; align-items: center; gap: 6px;">
            <span>🔬 Assessment Profile Preview:</span>
            <span style="font-weight: 600; color: #647184;">Active child: <strong>${report.childName}</strong></span>
          </div>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn-secondary btn-sm btn-profile-switch" data-profile="profile-a" style="font-size: 0.76rem; padding: 4px 10px; ${report.childName === 'Alex' ? 'background: #EAE4FF; border-color: #7C3AED; color: #5B21B6;' : ''}">
              Sample A: Alex (Spatial/Logic Focus)
            </button>
            <button type="button" class="btn-secondary btn-sm btn-profile-switch" data-profile="profile-b" style="font-size: 0.76rem; padding: 4px 10px; ${report.childName === 'Sam' ? 'background: #EAE4FF; border-color: #7C3AED; color: #5B21B6;' : ''}">
              Sample B: Sam (Language/Flexibility Focus)
            </button>
          </div>
        </div>

        <!-- ====================================================================
             SECTION 1: LEARNING COMPASS EXECUTIVE SUMMARY
             ==================================================================== -->
        <section style="margin-bottom: 28px;">
          <div class="report-section-title">
            <span>📋</span> 1. Learning Compass Executive Summary
          </div>
          <p class="report-section-desc">
            A quick-read overview answering the three questions parents ask most frequently after completing the 8 adventure levels.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 18px;">
            <!-- Summary 1: What Child Demonstrated -->
            <div style="background: #F4FAF7; border: 1.5px solid #A3D9BD; border-radius: 16px; padding: 16px;">
              <div style="font-size: 0.82rem; font-weight: 850; color: #11422E; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                <span>⭐</span> What ${report.childName} Demonstrated
              </div>
              <div style="font-size: 0.88rem; color: #293347; line-height: 1.5;">
                ${report.executiveSummary.demonstratedHtml}
              </div>
            </div>

            <!-- Summary 2: Skills to Practise Next -->
            <div style="background: #FFFDF0; border: 1.5px solid #F3E0A2; border-radius: 16px; padding: 16px;">
              <div style="font-size: 0.82rem; font-weight: 850; color: #7A5109; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                <span>🌱</span> Skills to Practise Next
              </div>
              <div style="font-size: 0.88rem; color: #293347; line-height: 1.5;">
                ${report.executiveSummary.practiseHtml}
              </div>
            </div>

            <!-- Summary 3: What Parent Can Do Today -->
            <div style="background: #F8FBFE; border: 1.5px solid #C4DDF7; border-radius: 16px; padding: 16px;">
              <div style="font-size: 0.82rem; font-weight: 850; color: #1B4975; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                <span>🏡</span> What You Can Do Today
              </div>
              <div style="font-size: 0.88rem; color: #293347; line-height: 1.5;">
                ${report.executiveSummary.todayActionHtml}
              </div>
            </div>
          </div>

          <!-- Fast Action Box: Primary Mentp Recommendation -->
          ${report.learningRoadmap.length > 0 ? `
            <div style="background: linear-gradient(135deg, rgba(234, 228, 255, 0.8) 0%, rgba(221, 245, 233, 0.85) 100%); border: 2px solid #7C3AED; border-radius: 16px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
              <div>
                <span style="font-size: 0.76rem; font-weight: 850; color: #5B21B6; text-transform: uppercase;">Recommended Next Step on Mentp</span>
                <div style="font-size: 1.05rem; font-weight: 850; color: #1A2433; margin: 2px 0;">
                  ${report.learningRoadmap[0].title}
                </div>
                <div style="font-size: 0.85rem; color: #506173; font-weight: 600;">
                  ${report.learningRoadmap[0].whatPractise}
                </div>
              </div>
              <a href="${report.learningRoadmap[0].url}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm" style="padding: 10px 22px; font-size: 0.9rem; text-decoration: none; white-space: nowrap;">
                <span>Open ${report.learningRoadmap[0].type}</span> <span>↗</span>
              </a>
            </div>
          ` : ''}
        </section>

        <!-- ====================================================================
             SECTION 2: WHAT WE OBSERVED (THE CHILD'S LEARNING STORY)
             ==================================================================== -->
        <section class="glass-panel-sub" style="background: linear-gradient(135deg, rgba(255, 249, 241, 0.95) 0%, rgba(223, 244, 234, 0.95) 100%) !important; border: 2px solid #78BFA5 !important; border-radius: 20px; padding: 24px; margin-bottom: 28px;">
          <div style="display: flex; align-items: flex-start; gap: 18px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 12px; margin: 0 auto 8px;">
              <div style="width: 80px; height: 80px; flex-shrink: 0;">
                ${VisualAssetSystem.renderCharacterSvg('pip', 'celebrate', 80)}
              </div>
              <div style="width: 74px; height: 74px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img src="assets/3d/compass-3d-crystal.png" alt="3D Crystal Compass" class="anim-compass-crystal" style="width: 68px; height: 68px; object-fit: contain;" />
              </div>
            </div>
            <div style="flex: 1; min-width: 260px;">
              <div style="font-size: 0.8rem; font-weight: 900; color: #1B573A; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                2. What We Observed • The Child's Learning Story
              </div>
              <h2 style="font-size: 1.25rem; color: #1A2433; margin-bottom: 12px; font-weight: 850;">
                A Thoughtful Look at How ${report.childName} Thinks and Learns
              </h2>
              ${report.learningStory.map(paragraph => `
                <p style="font-size: 0.92rem; line-height: 1.6; color: #293347; margin-bottom: 10px;">
                  ${paragraph}
                </p>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- 8 Completed 3D Adventure Badges -->
        <section style="margin-bottom: 28px;">
          <div style="font-size: 0.95rem; color: #1A2433; margin-bottom: 10px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            <span>🧭</span> Completed Adventure Waypoints:
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 10px; background: rgba(255, 255, 255, 0.94); border: 1.5px solid #EAE2D6; border-radius: 18px; padding: 14px; text-align: center; box-shadow: 0 2px 8px rgba(67, 73, 112, 0.04);">
            ${report.dimensionEvaluations.map(m => `
              <div style="padding: 6px 4px;">
                <img src="${m.object3dImg}" class="${m.animClass}" style="width: 42px; height: 42px; object-fit: contain; margin: 0 auto 4px; display: block;" alt="${m.missionName} Badge" />
                <div style="font-size: 0.72rem; font-weight: 800; color: #1A2433; line-height: 1.2;">${m.missionName}</div>
                <span class="status-badge ${m.statusClass}" style="font-size: 0.65rem; padding: 2px 6px; margin-top: 4px; display: inline-block;">
                  ${m.performanceLevel === 'demonstrated-independent' ? '✓ Strong' : (m.performanceLevel === 'demonstrated-guided' ? '💡 Clue' : '🌱 Practice')}
                </span>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- ====================================================================
             SECTION 3 & 4: DEMONSTRATED STRENGTHS & SKILLS TO PRACTISE NEXT
             ==================================================================== -->
        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-bottom: 28px;">
          <!-- 3. Demonstrated Strengths -->
          <div style="background: #F4FAF7; border: 2px solid #78BFA5; border-radius: 20px; padding: 20px;">
            <div class="report-section-title" style="color: #11422E; font-size: 1.15rem; margin-bottom: 8px;">
              <span>⭐</span> 3. Demonstrated Strengths
            </div>
            <p style="font-size: 0.85rem; color: #375344; margin-bottom: 14px; line-height: 1.45;">
              Capabilities observed with clear, independent evidence across the assessment tasks.
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${report.topStrengths.map(s => `
                <div style="background: #FFFFFF; border-radius: 14px; padding: 12px 14px; border: 1px solid #BFE0CB;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 850; font-size: 0.92rem; color: #11422E;">
                      ${s.icon} ${s.dimensionName}
                    </span>
                    <span class="status-badge ${s.statusClass}">
                      ${s.statusLabel}
                    </span>
                  </div>
                  <div style="font-size: 0.84rem; color: #293347; line-height: 1.45; margin-bottom: 6px;">
                    <strong>Observed Evidence:</strong> ${s.evidenceNote}
                  </div>
                  <div style="font-size: 0.8rem; color: #4F6357; line-height: 1.4;">
                    <strong>Classroom Impact:</strong> ${s.whatThisSuggests}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 4. Skills to Practise Next -->
          <div style="background: #FFFDF0; border: 2px solid #E5A83B; border-radius: 20px; padding: 20px;">
            <div class="report-section-title" style="color: #7A5109; font-size: 1.15rem; margin-bottom: 8px;">
              <span>🌱</span> 4. Skills to Practise Next
            </div>
            <p style="font-size: 0.85rem; color: #6E531D; margin-bottom: 14px; line-height: 1.45;">
              Constructive developmental goals where scaffolding and fun practice will yield significant progress.
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${report.topPractice.map(p => `
                <div style="background: #FFFFFF; border-radius: 14px; padding: 12px 14px; border: 1px solid #F3E0A2;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 850; font-size: 0.92rem; color: #7A5109;">
                      ${p.icon} ${p.dimensionName}
                    </span>
                    <span class="status-badge ${p.statusClass}">
                      ${p.statusLabel}
                    </span>
                  </div>
                  <div style="font-size: 0.84rem; color: #293347; line-height: 1.45; margin-bottom: 6px;">
                    <strong>Observation:</strong> ${p.evidenceNote}
                  </div>
                  <div style="font-size: 0.8rem; color: #647184; line-height: 1.4;">
                    <strong>Next Practice Goal:</strong> ${p.whatToPractise}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- ====================================================================
             SECTION 5: DETAILED BREAKDOWN OF THE EIGHT DIMENSIONS
             ==================================================================== -->
        <section style="margin-bottom: 30px;">
          <div class="report-section-title">
            <span>🔬</span> 5. Detailed Breakdown of the Eight Dimensions
          </div>
          <p class="report-section-desc">
            A transparent evaluation of every level, separating direct task observations from pedagogical interpretations, home routines, and matched Mentp curriculum resources.
          </p>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${report.dimensionEvaluations.map((dim, i) => `
              <div class="dimension-full-card">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 10px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${dim.object3dImg}" style="width: 38px; height: 38px; object-fit: contain;" alt="${dim.dimensionName}" />
                    <div>
                      <div style="font-size: 0.75rem; font-weight: 850; color: #647184; text-transform: uppercase;">
                        Level ${i + 1} • ${dim.missionName}
                      </div>
                      <div style="font-size: 1.05rem; font-weight: 850; color: #1A2433;">
                        ${dim.dimensionName}
                      </div>
                    </div>
                  </div>
                  <span class="status-badge ${dim.statusClass}">
                    ${dim.statusLabel}
                  </span>
                </div>

                <!-- 1. What was explored -->
                <div style="font-size: 0.86rem; color: #293347; line-height: 1.5; margin-bottom: 8px;">
                  <strong style="color: #475569;">1. What was explored:</strong> ${dim.whatExplored}
                </div>

                <!-- 2. What the child demonstrated -->
                <div style="font-size: 0.86rem; color: #293347; line-height: 1.5; margin-bottom: 8px;">
                  <strong style="color: #475569;">2. What ${report.childName} demonstrated:</strong> ${dim.whatDemonstrated}
                  <div style="font-size: 0.8rem; color: #647184; background: #F8FAFC; border-radius: 8px; padding: 4px 8px; display: inline-block; margin-top: 4px; border: 1px solid #E2E8F0;">
                    📌 Evidence: ${dim.evidenceNote}
                  </div>
                </div>

                <!-- 3. What this may suggest -->
                <div style="font-size: 0.86rem; color: #293347; line-height: 1.5; margin-bottom: 8px;">
                  <strong style="color: #475569;">3. What this may suggest:</strong> ${dim.whatThisSuggests}
                </div>

                <!-- 4. What to practise next -->
                <div style="font-size: 0.86rem; color: #293347; line-height: 1.5; margin-bottom: 12px;">
                  <strong style="color: #475569;">4. What to practise next:</strong> ${dim.whatToPractise}
                </div>

                <!-- 5. Practical Activity & 6. Relevant Mentp Resource -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 10px;">
                  <div class="dimension-sub-box">
                    <div style="font-size: 0.78rem; font-weight: 850; color: #0284C7; text-transform: uppercase; margin-bottom: 4px;">
                      🏡 Practical Home Activity (${dim.practicalActivity.duration})
                    </div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: #1A2433; margin-bottom: 4px;">
                      ${dim.practicalActivity.title}
                    </div>
                    <div style="font-size: 0.82rem; color: #475569; line-height: 1.45;">
                      ${dim.practicalActivity.instruction}
                    </div>
                    <div style="font-size: 0.8rem; color: #0369A1; font-weight: 600; margin-top: 4px;">
                      Ask: ${dim.practicalActivity.promptQuestion}
                    </div>
                  </div>

                  <div class="dimension-sub-box">
                    <div style="font-size: 0.78rem; font-weight: 850; color: #7C3AED; text-transform: uppercase; margin-bottom: 4px;">
                      📚 Matched Mentp Resource (${dim.resource.type})
                    </div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: #1A2433; margin-bottom: 4px;">
                      ${dim.resource.title}
                    </div>
                    <div style="font-size: 0.82rem; color: #475569; line-height: 1.45; margin-bottom: 8px;">
                      ${dim.resource.description}
                    </div>
                    <a href="${dim.resource.url}" target="_blank" rel="noopener noreferrer" style="color: #7C3AED; font-weight: 800; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                      <span>Open on mentp.com</span> <span>↗</span>
                    </a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- ====================================================================
             SECTION 6: PERSONALISED MENTP LEARNING ROADMAP
             ==================================================================== -->
        <section style="margin-bottom: 30px;">
          <div class="report-section-title">
            <span>🗺️</span> 6. Personalised Mentp Learning Roadmap
          </div>
          <p class="report-section-desc">
            A sequenced four-stage learning journey on <strong>mentp.com</strong> specifically matched to ${report.childName}'s assessed profile:
            from visual introduction to interactive experimentation, fluency gaming, and independent paper mastery.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">
            ${report.learningRoadmap.map(step => `
              <div class="roadmap-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 0.76rem; font-weight: 850; color: #7C3AED; background: #F5F3FF; padding: 3px 8px; border-radius: 6px; border: 1px solid #DDD6FE;">
                    Step ${step.stepNumber}: ${step.badge}
                  </span>
                  <span style="font-size: 0.75rem; color: #647184; font-weight: 700;">
                    ${step.dimensionName}
                  </span>
                </div>

                <div style="font-size: 1.02rem; font-weight: 850; color: #1A2433; margin-bottom: 6px; line-height: 1.35;">
                  ${step.title}
                </div>

                <div style="font-size: 0.82rem; color: #475569; line-height: 1.45; margin-bottom: 10px;">
                  <strong style="color: #1A2433;">Why this was recommended:</strong> ${step.whyRecommended}
                </div>

                <div style="font-size: 0.82rem; color: #475569; line-height: 1.45; margin-bottom: 10px;">
                  <strong style="color: #1A2433;">What ${report.childName} will practise:</strong> ${step.whatPractise}
                </div>

                <div style="background: #F8FAFC; border-radius: 10px; padding: 10px; font-size: 0.8rem; color: #334155; line-height: 1.4; margin-bottom: 12px; border: 1px solid #E2E8F0;">
                  <div><strong>How to use it:</strong> ${step.howToUse}</div>
                  <div style="margin-top: 4px;"><strong>What to look for:</strong> ${step.whatToLookFor}</div>
                  <div style="margin-top: 4px; color: #647184;"><strong>What comes next:</strong> ${step.whatComesNext}</div>
                </div>

                <a href="${step.url}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 0.85rem; text-decoration: none;">
                  <span>Explore on mentp.com</span>
                  <span>↗</span>
                </a>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- ====================================================================
             SECTION 7: PARENT GUIDANCE (HOW YOU CAN SUPPORT LEARNING AT HOME)
             ==================================================================== -->
        <section style="margin-bottom: 30px;">
          <div class="report-section-title">
            <span>🏡</span> 7. How You Can Support Learning at Home
          </div>
          <p class="report-section-desc">
            Manageable, screen-free conversation prompts and short 5-to-10 minute routines. No specialist training or expensive materials required.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
            ${report.parentGuidance.map(guide => `
              <div style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.74rem; font-weight: 850; color: #0284C7; text-transform: uppercase;">
                    ${guide.area}
                  </span>
                  <span style="font-size: 0.75rem; font-weight: 700; color: #647184; background: #F1F5F9; padding: 2px 6px; border-radius: 6px;">
                    ⏱️ ${guide.duration}
                  </span>
                </div>
                <div style="font-size: 0.98rem; font-weight: 850; color: #1A2433; margin-bottom: 8px;">
                  ${guide.title}
                </div>
                <div style="font-size: 0.84rem; color: #475569; line-height: 1.5; margin-bottom: 10px;">
                  <strong>What to do:</strong> ${guide.whatToDo}
                </div>
                <div style="background: #F0F9FF; border-left: 3px solid #0284C7; padding: 8px 10px; border-radius: 0 8px 8px 0; font-size: 0.82rem; color: #0369A1; line-height: 1.45; margin-bottom: 8px;">
                  <strong>Question to ask:</strong> ${guide.promptQuestion}
                </div>
                <div style="font-size: 0.8rem; color: #647184; line-height: 1.4;">
                  <strong>What to observe:</strong> ${guide.whatToObserve}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- ====================================================================
             SECTION 8: FUTURE PROGRESS CHECK
             ==================================================================== -->
        <section style="margin-bottom: 30px;">
          <div class="report-section-title">
            <span>📈</span> 8. Future Progress Check
          </div>
          <p class="report-section-desc">
            Concrete, measurable criteria to evaluate when ${report.childName} completes a follow-up assessment in ${report.progressCheck.suggestedWindow}.
          </p>

          <table class="progress-table">
            <thead>
              <tr>
                <th style="width: 25%;">Skill Focus</th>
                <th style="width: 35%;">Baseline Observation</th>
                <th style="width: 40%;">Observable Target Criterion</th>
              </tr>
            </thead>
            <tbody>
              ${report.progressCheck.indicators.map(ind => `
                <tr>
                  <td style="font-weight: 800; color: #1A2433;">${ind.skill}</td>
                  <td style="color: #475569; font-size: 0.85rem;">${ind.baselineObservation}</td>
                  <td style="color: #11422E; font-weight: 600; font-size: 0.85rem;">✓ ${ind.targetCriterion}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <!-- ====================================================================
             SECTION 9: ASSESSMENT METHODOLOGY AND LIMITATIONS
             ==================================================================== -->
        <section style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 18px; padding: 20px; margin-bottom: 30px;">
          <div style="font-size: 0.82rem; font-weight: 850; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span>⚖️</span> 9. Assessment Methodology and Pedagogical Limitations
          </div>
          <div style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
            <p style="margin-bottom: 8px;">
              <strong>Formative Educational Scope:</strong> The Mentp Learning Compass is an interactive formative assessment informed by Cambridge Primary thinking skills curricula and educational psychology. Its sole purpose is to celebrate demonstrated cognitive strategies and recommend supportive learning resources.
            </p>
            <p style="margin-bottom: 0;">
              <strong>Scientific Notice:</strong> This profile is not a standardized clinical diagnostic tool, IQ assessment, psychiatric evaluation, or permanent cognitive categorization. A child's performance fluctuates naturally based on energy, novelty, and familiarity. Progress should always be gauged through ongoing classroom observation and joyful home exploration.
            </p>
          </div>
        </section>

        <!-- PRIMARY COMPLETION ACTION CALL TO ACTION -->
        <section style="background: linear-gradient(135deg, rgba(234, 228, 255, 0.7) 0%, rgba(221, 245, 233, 0.8) 100%); border: 2.5px solid #7C3AED; border-radius: 24px; padding: 32px 24px; text-align: center; margin: 30px 0; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.12);">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
            <img src="assets/mentara-logo.png" alt="Mentara Logo" style="width: 38px; height: 38px; object-fit: contain; filter: drop-shadow(0 2px 6px rgba(124, 58, 237, 0.3));" />
            <span style="font-size: 0.92rem; font-weight: 850; color: #7C3AED; text-transform: uppercase; letter-spacing: 0.05em;">Continue Learning on mentp.com</span>
          </div>
          <h2 style="font-size: 1.55rem; font-weight: 850; color: #1A2433; margin-bottom: 8px;">
            Explore ${report.childName}'s Tailored Activities on Mentp.com
          </h2>
          <p style="font-size: 0.98rem; color: #506173; font-weight: 600; max-width: 560px; margin: 0 auto 24px; line-height: 1.55;">
            Now that you have seen ${report.childName}'s demonstrated aptitudes across all 8 adventure levels, discover hundreds of Cambridge Primary Stage 1–5 interactive lessons, 3D simulations, and checkpoint practice games on <strong>mentp.com</strong>.
          </p>
          <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
            <a href="${returnUrl}" target="_top" class="btn-primary" style="padding: 16px 40px; font-size: 1.15rem; border-radius: 9999px; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #7C3AED 0%, #2EA879 100%); box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);">
              <span>Continue to Mentara Dashboard</span>
              <span style="font-size: 1.25rem;">🚀 ➔</span>
            </a>
            <button id="btn-retake-compass" class="btn-secondary" type="button" style="padding: 16px 26px; font-size: 1.02rem; border-radius: 9999px; cursor: pointer;">
              <span>Start New 8-Level Adventure 🔄</span>
            </button>
          </div>
        </section>

        <!-- Bottom Footer Branding -->
        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1.5px solid rgba(220, 232, 240, 0.6);">
          <div style="font-size: 0.84rem; color: #4C1D95; font-weight: 800; margin-bottom: 4px;">
            Discover Your Thinking Style — Conceptualised and crafted by Ms. Sakshi Srivastava (B.Sc. Psychology · B.Ed. · Child Educator)
          </div>
          <div style="font-size: 0.82rem; color: #8292A3; font-weight: 750;">
            Mentara Learning • <a href="https://mentp.com" target="_blank" rel="noopener noreferrer" style="color: #7C3AED; text-decoration: none; font-weight: 800;">mentp.com</a> • Cambridge Primary
          </div>
        </div>
      </div>
    `;

    // Event listener: Print report
    const printBtn = document.getElementById('btn-print-compass-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Event listener: Retake Compass
    const retakeBtn = document.getElementById('btn-retake-compass');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        this.state.answers = {};
        this.state.currentMissionIndex = 0;
        this.renderIntroScreen();
      });
    }

    // Event listeners: Test Profile Switcher
    const profileBtns = this.container.querySelectorAll('.btn-profile-switch');
    profileBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-profile');
        if (key && ReportEngine.TEST_PROFILES[key]) {
          const profile = ReportEngine.TEST_PROFILES[key];
          this.state.childName = profile.childName;
          this.state.stage = profile.stage;
          this.state.ageBand = profile.ageBand;
          this.state.answers = { ...profile.answers };
          this.renderFinalReport();
        }
      });
    });
  },

  /* ==========================================================================
     6. MODALS: TAKE A BREAK, RESEARCH, ATTRIBUTION
     ========================================================================== */
  openBreakModal() {
    let modal = document.getElementById('compass-break-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'compass-break-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content screen-enter" style="max-width: 480px; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">☕</div>
          <h2 style="font-size: 1.35rem; color: #293347; margin-bottom: 8px;">Would you like to take a pause?</h2>
          <p style="font-size: 0.95rem; color: #647184; line-height: 1.6; margin-bottom: 20px;">
            It is always okay to rest your eyes, stretch, or grab a glass of water. All your answers are safely kept in your compass.
          </p>
          <div style="display: flex; justify-content: center; gap: 14px;">
            <button id="btn-modal-resume" class="btn-primary" type="button" style="padding: 12px 28px; border-radius: 20px; cursor: pointer;">
              Keep Exploring!
            </button>
            <button id="btn-modal-early-report" class="btn-secondary" type="button" style="padding: 12px 22px; border-radius: 20px; cursor: pointer;">
              See Report So Far
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('btn-modal-resume').addEventListener('click', () => {
        modal.style.display = 'none';
      });

      document.getElementById('btn-modal-early-report').addEventListener('click', () => {
        modal.style.display = 'none';
        this.handleRevealReportClick();
      });
    }

    modal.style.display = 'flex';
  },

  openResearchModal() {
    let modal = document.getElementById('compass-research-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'compass-research-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content screen-enter" style="max-width: 580px;">
          <h2 style="font-size: 1.35rem; color: #1A2433; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; font-weight: 800;">
            <span>ℹ️</span> Research & Ethical Guardrails
          </h2>
          <div style="font-size: 0.95rem; color: #374659; line-height: 1.6; display: flex; flex-direction: column; gap: 12px; font-weight: 600;">
            <p><strong>Educational Assessment Tool:</strong> This tool is a formative pedagogical compass designed to illuminate cognitive preferences, problem-solving styles, and Cambridge Primary strand comfort.</p>
            <p><strong>Not a Clinical Diagnostic:</strong> This tool is not an IQ test, psychiatric evaluation, or medical diagnostic tool. It is designed to celebrate strengths and suggest targeted educational game plans.</p>
            <p><strong>Safe-Sided Guidance:</strong> No AI/LLM models generate raw scores; all dimensions follow transparent, deterministic scoring rules verified against Cambridge Primary benchmarks.</p>
          </div>
          <div style="margin-top: 24px; text-align: right;">
            <button id="btn-close-research" class="btn-primary btn-sm" type="button" style="padding: 10px 24px; border-radius: 18px; cursor: pointer;">
              Understood
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('btn-close-research').addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    modal.style.display = 'flex';
  },

  openAttributionModal() {
    let modal = document.getElementById('compass-attribution-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'compass-attribution-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content screen-enter" style="max-width: 640px;">
          <h2 style="font-size: 1.35rem; color: #1A2433; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; font-weight: 800;">
            <span>🎨</span> Asset Manifest & Free-Use Licences
          </h2>
          <div style="font-size: 0.88rem; color: #374659; line-height: 1.6; max-height: 340px; overflow-y: auto; padding-right: 8px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid #E9E2D6; color: #1A2433;">
                  <th style="padding: 8px;">Asset / Vector</th>
                  <th style="padding: 8px;">Source</th>
                  <th style="padding: 8px;">Licence</th>
                  <th style="padding: 8px;">Commercial</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid rgba(233, 226, 214, 0.5);">
                  <td style="padding: 8px;"><strong>Pip Mascot (Animated Vector)</strong></td>
                  <td style="padding: 8px;">Original SVG</td>
                  <td style="padding: 8px;">MIT / Mentara</td>
                  <td style="padding: 8px;">✓ Permitted</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(233, 226, 214, 0.5);">
                  <td style="padding: 8px;"><strong>Educational Scenes & Islands</strong></td>
                  <td style="padding: 8px;">unDraw / Storyset style</td>
                  <td style="padding: 8px;">Free Commercial</td>
                  <td style="padding: 8px;">✓ Permitted</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(233, 226, 214, 0.5);">
                  <td style="padding: 8px;"><strong>Action Icons & Micro-motion</strong></td>
                  <td style="padding: 8px;">Lucide & Lordicon Free</td>
                  <td style="padding: 8px;">CC-BY 4.0 / MIT</td>
                  <td style="padding: 8px;">✓ Permitted</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(233, 226, 214, 0.5);">
                  <td style="padding: 8px;"><strong>Typography (Fraunces & Nunito)</strong></td>
                  <td style="padding: 8px;">Google Fonts</td>
                  <td style="padding: 8px;">OFL (Open Font)</td>
                  <td style="padding: 8px;">✓ Permitted</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="margin-top: 24px; text-align: right;">
            <button id="btn-close-attribution" class="btn-primary btn-sm" type="button" style="padding: 10px 24px; border-radius: 18px; cursor: pointer;">
              Close Manifest
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('btn-close-attribution').addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    modal.style.display = 'flex';
  }
};
