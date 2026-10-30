/**
 * Mentara Labs | Learning Profile Check
 * Parent Consultation Page: Plain-English Diagnostic Learning Report
 * 
 * Features:
 * - Simple, warm language any parent can understand in 30 seconds.
 * - Honest, safe-sided Drawbacks, Demerits & Blind Spots section.
 * - Guide Shruti's observations.
 * - 4 Plain-English Cognitive Dimension Sliders.
 * - 4-Week Screen-Free Home Game Plan.
 * - Student Profile switcher (defaults to active child).
 */

import { PersonalityEngine } from '../lib/scoring/personality-engine.js';

export const ParentReport = {
  render(scoringData, planData, reviewerNarrative = null, activeSessionId = null, allSessions = []) {
    const childName = scoringData.childName || 'Your Child';
    const stage = scoringData.stage || 3;
    const isPartial = scoringData.isPartial;

    // Run Personality Diagnosis
    const personality = PersonalityEngine.diagnose(scoringData);
    const arch = personality.primaryArchetype;
    const secArch = personality.secondaryArchetype;
    const dims = personality.dimensions;
    const drawbacks = personality.drawbacks || [];

    return `
      <div class="calm-card screen-enter" style="max-width: 880px; margin: 24px auto; padding: clamp(20px, 4vw, 44px); background: #FFFFFF;" id="printable-report">
        
        <!-- Profile Switcher Header -->
        <div style="background: var(--color-soft-sand-light); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-md); padding: 12px 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.15rem;">👤</span>
            <span style="font-size: 0.95rem; font-weight: 700; color: var(--color-deep-ink);">
              Report for: <strong>${childName}</strong>
            </span>
          </div>
          ${allSessions.length > 1 ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <label for="parent-report-session-picker" style="font-size: 0.85rem; color: var(--color-deep-ink-muted);">Switch Child:</label>
              <select id="parent-report-session-picker" class="form-select" style="padding: 6px 12px; font-size: 0.85rem; min-height: 36px;">
                ${allSessions.map(s => `
                  <option value="${s.id}" ${s.id === activeSessionId ? 'selected' : ''}>
                    ${s.name || s.parentData?.firstName || 'Student'}
                  </option>
                `).join('')}
              </select>
            </div>
          ` : ''}
        </div>

        <!-- Main Heading -->
        <div style="border-bottom: 1.5px solid var(--color-soft-sand); padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
              <span class="room-badge">Cambridge Primary • Stage ${stage}</span>
              ${isPartial ? '<span class="room-badge" style="background: #FDF3E7; border-color: #E29B63;">Short Snapshot</span>' : ''}
            </div>
            <h1 style="font-size: clamp(1.75rem, 3.2vw, 2.3rem); margin-bottom: 6px;">
              How ${childName} Thinks & Learns
            </h1>
            <p class="text-muted" style="font-size: 0.95rem;">
              Prepared by Guide Shruti & Mentara Educators • Plain-Language Parent Consultation
            </p>
          </div>

          <button id="btn-print-report" class="btn-secondary btn-sm" type="button">
            Print / Save PDF 📄
          </button>
        </div>

        <!-- 🌟 1. CORE LEARNING PERSONALITY (Simple Plain English) -->
        <section style="background: linear-gradient(135deg, #FAF8F4 0%, var(--color-soft-sand-light) 100%); border: 2px solid var(--color-sage); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 32px;">
          <div style="display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
            <div style="width: 68px; height: 68px; border-radius: 50%; background: #FFFFFF; border: 2px solid var(--color-muted-teal); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; flex-shrink: 0; box-shadow: var(--shadow-sm);">
              ${arch.icon}
            </div>
            <div style="flex: 1; min-width: 260px;">
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-muted-teal); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                Your Child's Mind Style
              </div>
              <h2 style="font-size: clamp(1.35rem, 2.5vw, 1.75rem); margin-bottom: 6px; color: var(--color-deep-ink);">
                ${arch.title}
              </h2>
              <p style="font-size: 1.05rem; font-weight: 700; color: var(--color-muted-teal-dark); margin-bottom: 8px;">
                "${arch.tagline}"
              </p>
              <p style="font-size: 0.975rem; line-height: 1.6; color: var(--color-deep-ink);">
                ${arch.plainSummary}
              </p>
              ${secArch ? `
                <div style="margin-top: 10px; display: inline-flex; align-items: center; gap: 6px; background: #FFFFFF; border: 1px solid var(--color-soft-sand); border-radius: var(--radius-full); padding: 4px 12px; font-size: 0.85rem; font-weight: 700; color: var(--color-deep-ink-muted);">
                  <span>Also shows traits of:</span>
                  <span style="color: var(--color-deep-ink);">${secArch.icon} ${secArch.title}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </section>

        <!-- ⚠️ 2. HONEST DRAWBACKS, DEMERITS & BLIND SPOTS (Where they get stuck) -->
        <section style="margin-bottom: 36px; background: #FFFBF6; border: 1.5px solid #F6D8A8; border-radius: var(--radius-lg); padding: 24px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 1.35rem;">⚠️</span>
            <h2 style="font-size: 1.3rem; color: #8A4B08;">
              Real Hurdles & Blind Spots We Noticed
            </h2>
          </div>
          <p style="font-size: 0.95rem; color: #6D4311; margin-bottom: 20px; line-height: 1.5;">
            Every learner has friction points. Here are the exact moments where ${childName} got stuck, hesitated, or showed blind spots during the session—and how you can help at home:
          </p>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${drawbacks.map((db, idx) => `
              <div style="background: #FFFFFF; border: 1px solid #F0C987; border-radius: var(--radius-md); padding: 18px; box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                  <h3 style="font-size: 1.05rem; color: #8A4B08; margin: 0;">
                    ${idx + 1}. ${db.title}
                  </h3>
                  <span style="background: #FEF3C7; color: #92400E; font-size: 0.75rem; font-weight: 800; padding: 2px 10px; border-radius: var(--radius-full); text-transform: uppercase;">
                    ${db.severity}
                  </span>
                </div>

                <div style="font-size: 0.95rem; line-height: 1.55; color: var(--color-deep-ink); margin-bottom: 10px;">
                  <strong>What happened:</strong> ${db.whatHappened}
                </div>

                <div style="font-size: 0.9rem; line-height: 1.5; color: var(--color-deep-ink-muted); margin-bottom: 12px; background: var(--color-warm-white); padding: 10px 12px; border-radius: var(--radius-sm);">
                  <strong>Why it matters in school:</strong> ${db.whyItHurts}
                </div>

                <div style="background: #EDF5F0; border-left: 3px solid var(--color-sage-dark); padding: 10px 14px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 0.925rem; color: #1E4620;">
                  <strong>💡 How to help at home:</strong> ${db.howToHelp}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- 📊 3. THE 4 PLAIN-ENGLISH THINKING SCALES -->
        <section style="margin-bottom: 36px;">
          <h2 style="font-size: 1.3rem; margin-bottom: 10px;">
            How ${childName}'s Brain Prefers to Work
          </h2>
          <p class="text-muted" style="font-size: 0.925rem; margin-bottom: 18px;">
            See where your child falls between two natural learning styles:
          </p>

          <div style="display: flex; flex-direction: column; gap: 18px; background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-lg); padding: 22px;">
            
            <!-- Scale 1: Information -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 700; margin-bottom: 6px;">
                <span>👈 ${dims.information.leftLabel}</span>
                <span style="color: var(--color-deep-ink-muted);">${dims.information.rightLabel} 👉</span>
              </div>
              <div style="position: relative; height: 14px; background: var(--color-soft-sand); border-radius: var(--radius-full);">
                <div style="position: absolute; left: calc(${dims.information.score}% - 10px); top: -3px; width: 20px; height: 20px; border-radius: 50%; background: var(--color-muted-teal); border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>
              </div>
            </div>

            <!-- Scale 2: Pace -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 700; margin-bottom: 6px;">
                <span>👈 ${dims.tempo.leftLabel}</span>
                <span style="color: var(--color-deep-ink-muted);">${dims.tempo.rightLabel} 👉</span>
              </div>
              <div style="position: relative; height: 14px; background: var(--color-soft-sand); border-radius: var(--radius-full);">
                <div style="position: absolute; left: calc(${dims.tempo.score}% - 10px); top: -3px; width: 20px; height: 20px; border-radius: 50%; background: var(--color-sage-dark); border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>
              </div>
            </div>

            <!-- Scale 3: Tasks -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 700; margin-bottom: 6px;">
                <span>👈 ${dims.orientation.leftLabel}</span>
                <span style="color: var(--color-deep-ink-muted);">${dims.orientation.rightLabel} 👉</span>
              </div>
              <div style="position: relative; height: 14px; background: var(--color-soft-sand); border-radius: var(--radius-full);">
                <div style="position: absolute; left: calc(${dims.orientation.score}% - 10px); top: -3px; width: 20px; height: 20px; border-radius: 50%; background: var(--color-accent-amber); border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>
              </div>
            </div>

            <!-- Scale 4: Confidence -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 700; margin-bottom: 6px;">
                <span>👈 ${dims.compass.leftLabel}</span>
                <span style="color: var(--color-deep-ink-muted);">${dims.compass.rightLabel} 👉</span>
              </div>
              <div style="position: relative; height: 14px; background: var(--color-soft-sand); border-radius: var(--radius-full);">
                <div style="position: absolute; left: calc(${dims.compass.score}% - 10px); top: -3px; width: 20px; height: 20px; border-radius: 50%; background: var(--color-muted-teal-dark); border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>
              </div>
            </div>

          </div>
        </section>

        <!-- 🌟 4. WHAT WE NOTICED (Strengths & Observations) -->
        <section style="margin-bottom: 36px;">
          <h2 style="font-size: 1.3rem; margin-bottom: 12px; border-bottom: 1.5px solid var(--color-soft-sand); padding-bottom: 6px;">
            What Shruti & Mentara Educators Noticed
          </h2>
          <div style="font-size: 1rem; line-height: 1.7; color: var(--color-deep-ink);">
            <p style="margin-bottom: 10px;">
              ${reviewerNarrative?.whatWeNoticed || `${childName} showed genuine curiosity and effort throughout this session. They didn't just guess randomly—they looked at each pattern, thought about it, and shared their ideas openly.`}
            </p>
            <ul style="padding-left: 20px; font-size: 0.95rem; line-height: 1.6; margin-top: 8px;">
              ${personality.observedMoments.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>
        </section>

        <!-- 🎨 5. AUTHENTIC WORK EMBED -->
        <section style="margin-bottom: 36px; background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-lg); padding: 22px;">
          <h2 style="font-size: 1.25rem; margin-bottom: 6px;">🎨 ${childName}'s Work During the Session</h2>
          <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 16px;">
            Here are the actual drawings and ideas ${childName} created on screen:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
            <div>
              <span class="form-label" style="font-size: 0.85rem;">Drawing from the Canvas:</span>
              ${scoringData.drawingDataUrl ? `
                <img src="${scoringData.drawingDataUrl}" alt="Drawing by ${childName}" style="width: 100%; max-height: 200px; object-fit: contain; background: #FFFFFF; border: 1px solid var(--color-soft-sand); border-radius: var(--radius-md);" />
              ` : `
                <div style="padding: 24px; background: #FFFFFF; border: 1px dashed var(--color-soft-sand); border-radius: var(--radius-md); text-align: center; color: var(--color-deep-ink-muted);">
                  Drawing was skipped during this session
                </div>
              `}
            </div>

            <div>
              <span class="form-label" style="font-size: 0.85rem;">Paper Cup Ideas (${scoringData.creativityIdeas?.length || 0}):</span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${scoringData.creativityIdeas?.length > 0 ? scoringData.creativityIdeas.map(idea => `
                  <span style="background: #FFFFFF; border: 1px solid var(--color-sage); border-radius: var(--radius-full); padding: 6px 12px; font-size: 0.875rem; font-weight: 600;">
                    💡 ${idea}
                  </span>
                `).join('') : '<span class="text-muted">Focused directly on puzzles</span>'}
              </div>
            </div>
          </div>
        </section>

        <!-- 📅 6. 4-WEEK SIMPLE HOME PLAN -->
        <section style="margin-bottom: 36px;">
          <h2 style="font-size: 1.3rem; margin-bottom: 6px; border-bottom: 1.5px solid var(--color-soft-sand); padding-bottom: 6px;">
            What to Try at Home: 4-Week Simple Plan
          </h2>
          <p class="text-muted" style="margin-bottom: 16px; font-size: 0.9rem;">
            10–15 minute playful games you can do around the house. No screens, no test pressure.
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${planData.weeks.map(w => `
              <div style="background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-md); padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.85rem; font-weight: 800; color: var(--color-muted-teal); text-transform: uppercase;">
                    WEEK ${w.week}: ${w.focus}
                  </span>
                  <span style="font-size: 0.8rem; color: var(--color-deep-ink-muted);">10–15 Mins</span>
                </div>
                <ul style="padding-left: 18px; font-size: 0.925rem; line-height: 1.55; margin: 6px 0;">
                  ${w.activities.map(a => `<li>${a}</li>`).join('')}
                </ul>
                <div style="background: #FFFFFF; border-left: 3px solid var(--color-sage); padding: 8px 12px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 0.875rem; margin-top: 6px;">
                  <strong>Fun question to ask ${childName}:</strong> "${w.askYourChild}"
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- 7. EXTRA PRACTICE & SPECIALIST SUPPORT -->
        <section style="margin-bottom: 32px; background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-lg); padding: 20px;">
          <h2 style="font-size: 1.25rem; margin-bottom: 8px;">If You'd Like Extra Practice Sets</h2>
          <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 12px;">
            ${planData.softCallToAction}
          </p>
          ${planData.recommendedResources?.length > 0 ? planData.recommendedResources.map(r => `
            <div style="background: #FFFFFF; border: 1px solid var(--color-soft-sand); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 8px;">
              <strong style="font-size: 0.95rem;">${r.title}</strong>
              <p style="font-size: 0.85rem; color: var(--color-deep-ink-muted); margin: 2px 0 6px;">${r.description}</p>
              <a href="${r.url}" target="_blank" style="font-size: 0.85rem; color: var(--color-muted-teal); font-weight: 700; text-decoration: none;">
                Open on mentp.com →
              </a>
            </div>
          `).join('') : ''}

          <div style="border-top: 1px solid var(--color-soft-sand); padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <h4 style="font-size: 0.95rem; margin-bottom: 2px;">Want to talk to an educator?</h4>
              <p style="font-size: 0.825rem; color: var(--color-deep-ink-muted); margin: 0;">You can schedule a gentle 15-minute chat with a primary teacher.</p>
            </div>
            <button class="btn-secondary btn-sm" type="button" onclick="alert('Thank you! A Mentara educator will contact you at your registered email.')">
              Book a 15-Minute Chat
            </button>
          </div>
        </section>

        <!-- Footer -->
        <footer style="border-top: 1.5px solid var(--color-soft-sand); padding-top: 18px; text-align: center; color: var(--color-deep-ink-muted); font-size: 0.825rem; line-height: 1.6;">
          <p style="font-weight: 700; margin-bottom: 4px;">
            This is an observational learning profile snapshot, not a clinical, psychological, or diagnostic disorder evaluation.
          </p>
          <p>
            Mentara Labs (mentp.com) • Guide Shruti • Cambridge Primary Stages 1–5 • DPDP Act Compliant Privacy
          </p>
        </footer>

      </div>
    `;
  },

  attachEvents(container, onSessionChange) {
    const printBtn = container.querySelector('#btn-print-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    const picker = container.querySelector('#parent-report-session-picker');
    if (picker && onSessionChange) {
      picker.addEventListener('change', (e) => {
        onSessionChange(e.target.value);
      });
    }
  }
};
