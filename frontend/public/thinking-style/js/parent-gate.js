/**
 * Mentara Labs | Learning Profile Check
 * Parent Gate & Consent Component
 * 
 * Safety & Privacy:
 * - Parental consent required with plain-language notice.
 * - Collects ONLY first name or nickname, Cambridge Stage, age band, and parent email.
 * - No surname, no school name, no photo.
 * - DPDP Act aware: no third-party trackers, zero data selling, clear deletion guarantee.
 */

export const ParentGate = {
  render() {
    return `
      <div class="calm-card screen-enter" style="max-width: 680px; margin: 24px auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span class="room-badge" style="margin-bottom: 12px;">Parent & Guardian Gate</span>
          <h1 style="margin-bottom: 8px;">Learning Profile Check</h1>
          <p class="text-muted">A calm, 10–12 minute interactive exploration for your child</p>
        </div>

        <!-- Plain Language Privacy & Ethical Notice -->
        <div style="background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-md); padding: 18px 20px; margin-bottom: 24px;">
          <h3 style="font-size: 1.05rem; margin-bottom: 8px; color: var(--color-muted-teal-dark);">
            🌱 Our Kind & Transparent Promise
          </h3>
          <ul style="padding-left: 20px; font-size: 0.95rem; color: var(--color-deep-ink); line-height: 1.6;">
            <li><strong>Not a medical or clinical diagnosis:</strong> This session identifies learning preferences, strengths, and concept gaps to build a helpful 4-week home plan.</li>
            <li><strong>Minimal data collection:</strong> We only ask for your child's first name/nickname and age. We never ask for surnames, school names, or photos.</li>
            <li><strong>Privacy-first (DPDP Act aware):</strong> No advertising trackers, no selling of data, and no third-party analytics on child-facing screens. You can delete this data anytime.</li>
            <li><strong>Teacher-reviewed:</strong> Your report is reviewed by an experienced educator before it is shared with you.</li>
          </ul>
        </div>

        <form id="parent-gate-form">
          <!-- Child's First Name / Nickname -->
          <div class="form-group">
            <label class="form-label" for="child-firstname">
              Child's First Name or Nickname
            </label>
            <input 
              type="text" 
              id="child-firstname" 
              class="form-input" 
              placeholder="e.g. Maya or Aarav" 
              required 
              maxlength="24"
              autocomplete="off"
            />
            <div class="form-helper">This is how guide Shruti will address your child.</div>
          </div>

          <!-- Cambridge Stage Selection -->
          <div class="form-group">
            <label class="form-label" for="cambridge-stage">
              Cambridge Primary Stage
            </label>
            <select id="cambridge-stage" class="form-select" required>
              <option value="1">Stage 1 (Approx. Year 2 / Age 5–6) — Includes Read-Aloud</option>
              <option value="2">Stage 2 (Approx. Year 3 / Age 6–7) — Includes Read-Aloud</option>
              <option value="3" selected>Stage 3 (Approx. Year 4 / Age 7–8)</option>
              <option value="4">Stage 4 (Approx. Year 5 / Age 8–9)</option>
              <option value="5">Stage 5 (Approx. Year 6 / Age 9–10)</option>
            </select>
            <div class="form-helper">We adapt questions to match their Cambridge curriculum stage.</div>
          </div>

          <!-- Age Band -->
          <div class="form-group">
            <label class="form-label" for="child-age-band">
              Age Band
            </label>
            <select id="child-age-band" class="form-select" required>
              <option value="5-6">5 – 6 years old</option>
              <option value="7-8" selected>7 – 8 years old</option>
              <option value="9-10">9 – 10 years old</option>
              <option value="11-12">11 – 12 years old</option>
            </select>
          </div>

          <!-- Parent Email -->
          <div class="form-group">
            <label class="form-label" for="parent-email">
              Grown-Up's Email Address
            </label>
            <input 
              type="email" 
              id="parent-email" 
              class="form-input" 
              placeholder="name@example.com" 
              required
            />
            <div class="form-helper">Where the completed learning profile and 4-week plan will be delivered.</div>
          </div>

          <!-- Consent Checkbox -->
          <label class="checkbox-card" for="consent-check">
            <input type="checkbox" id="consent-check" required />
            <span class="checkbox-text">
              I am the parent or legal guardian. I consent to my child participating in this 10–12 minute learning session and understand this is an educational profile, not a clinical assessment.
            </span>
          </label>

          <div style="text-align: center; margin-top: 28px;">
            <button type="submit" class="btn-primary" style="width: 100%; font-size: 1.1rem; padding: 14px 28px;">
              Ready to Begin with Shruti →
            </button>
            <div style="margin-top: 12px; font-size: 0.85rem; color: var(--color-deep-ink-muted);">
              Your child can take breaks, skip any question, or stop at any point.
            </div>
          </div>
        </form>
      </div>
    `;
  },

  attachEvents(onSubmit) {
    const form = document.getElementById('parent-gate-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstName = document.getElementById('child-firstname').value.trim();
      const stage = parseInt(document.getElementById('cambridge-stage').value, 10);
      const ageBand = document.getElementById('child-age-band').value;
      const email = document.getElementById('parent-email').value.trim();
      const consent = document.getElementById('consent-check').checked;

      if (!firstName || !email || !consent) {
        alert('Please fill in your child’s first name, your email, and tick the consent box.');
        return;
      }

      onSubmit({
        firstName,
        stage,
        ageBand,
        parentEmail: email,
        consentGivenAt: new Date().toISOString()
      });
    });
  }
};
