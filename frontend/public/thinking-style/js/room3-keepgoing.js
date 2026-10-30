/**
 * Mentara Labs | Learning Profile Check
 * Room 3: Keep Going (Persistence Puzzle & Empathy Stories)
 */

import { AudioGuide } from './audio.js';
import { MiraGuide } from './mira.js';
import { EventLogManager } from '../lib/schemas/event-log.js';

export const Room3KeepGoing = {
  container: null,
  onComplete: null,
  step: 'puzzle', // 'puzzle' | 'empathy' | 'mindset'
  puzzleStartTime: 0,
  puzzleAttempts: 0,
  hintsUsed: 0,
  empathyChoices: [],
  mindsetResponses: [],

  init(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.puzzleAttempts = 0;
    this.hintsUsed = 0;
    this.empathyChoices = [];
    this.mindsetResponses = [];
    this.renderTrickyPuzzle();
  },

  renderTrickyPuzzle() {
    this.step = 'puzzle';
    this.puzzleStartTime = performance.now();
    const promptText = "Here is a deliberately tricky puzzle. There is no time limit, and it is completely normal to try several times. You can also tap for a hint!";

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 760px; margin: 0 auto;">
        <div class="room-ribbon">
          <div class="room-title-group">
            <span class="room-badge">Room 3: Keep Going</span>
            <span class="room-name">The Forest Path Puzzle</span>
          </div>
          <button id="btn-skip-puzzle" class="btn-quiet-skip" type="button">Skip this puzzle →</button>
        </div>

        ${MiraGuide.renderSpeech(promptText, { canSpeak: true, expression: 'thoughtful' })}

        <div style="background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-lg); padding: 24px; margin: 20px 0; text-align: center;">
          <h2 style="font-size: 1.25rem; margin-bottom: 8px;">The Stepping Stone Balance</h2>
          <p style="margin-bottom: 16px; color: var(--color-deep-ink-muted);">
            Pick <strong>three numbers</strong> from the stones below that add up to <strong>15</strong>, with none of them being the same.
          </p>

          <!-- Number Stones to pick -->
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;">
            <button class="stone-btn" data-val="1">1</button>
            <button class="stone-btn" data-val="3">3</button>
            <button class="stone-btn" data-val="4">4</button>
            <button class="stone-btn" data-val="5">5</button>
            <button class="stone-btn" data-val="7">7</button>
            <button class="stone-btn" data-val="8">8</button>
            <button class="stone-btn" data-val="9">9</button>
          </div>

          <!-- Current Selection Basket -->
          <div style="background: #FFFFFF; border: 2px dashed var(--color-soft-sand); border-radius: var(--radius-md); padding: 14px; max-width: 380px; margin: 0 auto 16px;">
            <span class="form-label" style="margin-bottom: 4px;">Chosen Stones:</span>
            <div id="chosen-stones-tray" style="display: flex; justify-content: center; gap: 10px; min-height: 48px; align-items: center;">
              <span class="text-muted" style="font-style: italic;">Tap stones to place them here</span>
            </div>
            <div id="current-sum-display" style="font-size: 0.95rem; font-weight: 700; margin-top: 8px; color: var(--color-deep-ink);">
              Total: 0 / 15
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: 12px;">
            <button id="btn-check-stones" class="btn-primary" type="button">Test My Combination</button>
            <button id="btn-clear-stones" class="btn-ghost" type="button">Clear</button>
          </div>

          <!-- Feedback message -->
          <div id="puzzle-feedback" style="min-height: 28px; margin-top: 14px; font-weight: 700; font-size: 0.95rem;"></div>

          <!-- Gentle Hint Accordion -->
          <div style="margin-top: 20px; border-top: 1px solid var(--color-soft-sand); padding-top: 14px;">
            <button id="btn-request-hint" class="btn-ghost btn-sm" type="button" style="color: var(--color-muted-teal);">
              💡 Would you like a hint? (<span id="hints-count-label">0 used</span>)
            </button>
            <div id="hint-text-box" style="display: none; margin-top: 10px; font-size: 0.95rem; color: var(--color-muted-teal-dark); background: var(--color-muted-teal-light); padding: 12px; border-radius: var(--radius-sm);">
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachPuzzleEvents();
  },

  attachPuzzleEvents() {
    const selectedStones = [];
    const stoneBtns = this.container.querySelectorAll('.stone-btn');
    const tray = document.getElementById('chosen-stones-tray');
    const sumDisplay = document.getElementById('current-sum-display');
    const feedback = document.getElementById('puzzle-feedback');
    const btnCheck = document.getElementById('btn-check-stones');
    const btnClear = document.getElementById('btn-clear-stones');
    const btnHint = document.getElementById('btn-request-hint');
    const hintBox = document.getElementById('hint-text-box');
    const hintCount = document.getElementById('hints-count-label');
    const btnSkip = document.getElementById('btn-skip-puzzle');

    const updateTray = () => {
      if (selectedStones.length === 0) {
        tray.innerHTML = `<span class="text-muted" style="font-style: italic;">Tap stones to place them here</span>`;
      } else {
        tray.innerHTML = selectedStones.map(val => `
          <span style="display: inline-flex; width: 42px; height: 42px; border-radius: 50%; background: var(--color-sage-light); border: 2px solid var(--color-sage); align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;">${val}</span>
        `).join('');
      }
      const sum = selectedStones.reduce((a, b) => a + b, 0);
      sumDisplay.textContent = `Total: ${sum} / 15 (${selectedStones.length} stones chosen)`;
    };

    stoneBtns.forEach(btn => {
      btn.style.cssText = "width: 52px; height: 52px; border-radius: 50%; background: #FFFFFF; border: 2px solid var(--color-soft-sand); font-size: 1.25rem; font-weight: 800; cursor: pointer; transition: all 250ms ease;";
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);
        if (selectedStones.includes(val)) {
          const idx = selectedStones.indexOf(val);
          selectedStones.splice(idx, 1);
          btn.style.background = '#FFFFFF';
          btn.style.borderColor = 'var(--color-soft-sand)';
        } else if (selectedStones.length < 3) {
          selectedStones.push(val);
          btn.style.background = 'var(--color-sage-light)';
          btn.style.borderColor = 'var(--color-sage)';
        }
        updateTray();
      });
    });

    btnClear.addEventListener('click', () => {
      selectedStones.length = 0;
      stoneBtns.forEach(b => {
        b.style.background = '#FFFFFF';
        b.style.borderColor = 'var(--color-soft-sand)';
      });
      updateTray();
      feedback.textContent = '';
    });

    btnCheck.addEventListener('click', () => {
      this.puzzleAttempts++;
      const sum = selectedStones.reduce((a, b) => a + b, 0);
      
      if (selectedStones.length !== 3) {
        feedback.style.color = 'var(--color-deep-ink-muted)';
        feedback.textContent = 'Please choose exactly 3 different stones.';
        return;
      }

      if (sum === 15) {
        feedback.style.color = 'var(--color-muted-teal-dark)';
        feedback.textContent = '🌟 You balanced the stones to 15! Wonderful persistence.';
        setTimeout(() => {
          this.logPuzzleEvent(true);
          this.renderEmpathyStories();
        }, 1200);
      } else {
        feedback.style.color = 'var(--color-accent-amber)';
        feedback.textContent = `That makes ${sum}. Close! Try switching one stone and test again.`;
      }
    });

    const hints = [
      "Hint 1: If you choose 5 as one of your stones, what must the other two add up to?",
      "Hint 2: Try looking for an even number and an odd number, like 3 and 7, or 1 and 9!"
    ];

    btnHint.addEventListener('click', () => {
      if (this.hintsUsed < hints.length) {
        hintBox.style.display = 'block';
        hintBox.textContent = hints[this.hintsUsed];
        this.hintsUsed++;
        hintCount.textContent = `${this.hintsUsed} used`;
      }
    });

    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        this.logPuzzleEvent(false, true);
        this.renderEmpathyStories();
      });
    }
  },

  logPuzzleEvent(solved, skipped = false) {
    const latencyMs = performance.now() - this.puzzleStartTime;
    const entry = EventLogManager.createLogEntry({
      itemId: 'persistence-stone-puzzle',
      stage: 3,
      strand: 'persistence',
      room: 'room3',
      response: solved ? 'SOLVED' : (skipped ? 'SKIPPED' : 'UNSOLVED'),
      correct: solved,
      latencyMs,
      attempts: this.puzzleAttempts,
      hintsUsed: this.hintsUsed,
      skipped
    });
    window.SessionState?.events.push(entry);
  },

  renderEmpathyStories() {
    this.step = 'empathy';
    const stories = [
      {
        id: 'empathy-1',
        title: 'Story 1: The Fallen Pencils',
        scenario: 'Oliver accidentally drops his large pencil tin in the middle of class. Pencils roll everywhere across the floor.',
        options: [
          { text: 'Quietly bend down and help him collect the pencils right away.', rubric: 'immediate-helping' },
          { text: 'Ask Oliver if he is okay and hold his chair while he picks them up.', rubric: 'perspective-caring' },
          { text: 'Tell the teacher so everyone watches where they walk.', rubric: 'systemic-practical' }
        ]
      },
      {
        id: 'empathy-2',
        title: 'Story 2: Playtime by the Bench',
        scenario: 'Priya is new at school this week. At playtime, she is standing by the brick wall watching others play tag.',
        options: [
          { text: 'Walk over with a warm smile and ask if she would like to join your game.', rubric: 'inclusive-invitation' },
          { text: 'Go sit next to her and ask what kind of games she likes to play.', rubric: 'perspective-listening' },
          { text: 'Show her where the play equipment and balls are stored.', rubric: 'helpful-guiding' }
        ]
      },
      {
        id: 'empathy-3',
        title: 'Story 3: The Paper Plane',
        scenario: 'Sam spent ten minutes folding a paper plane, but when he threw it, it gently tumbled down after one metre.',
        options: [
          { text: 'Say: “The wings looked really cool! Would you like to try adjusting the tips together?”', rubric: 'encouragement-coaching' },
          { text: 'Tell him: “It takes a few tries to get planes to glide—let’s test it again!”', rubric: 'normalising-mistakes' },
          { text: 'Offer him a fresh piece of paper to try a new design.', rubric: 'resource-support' }
        ]
      }
    ];

    let currentStoryIdx = 0;

    const renderStory = () => {
      const story = stories[currentStoryIdx];
      const storyPrompt = "Here are a few moments with friends at school. There are no right or wrong answers—just what feels kindest to you.";

      this.container.innerHTML = `
        <div class="calm-card screen-enter" style="max-width: 760px; margin: 0 auto;">
          <div class="room-ribbon">
            <div class="room-title-group">
              <span class="room-badge">Room 3: Empathy & Kindness</span>
              <span class="room-name">${story.title}</span>
            </div>
          </div>

          ${MiraGuide.renderSpeech(storyPrompt, { canSpeak: true, expression: 'friendly' })}

          <div style="margin: 20px 0; background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-lg); padding: 22px;">
            <p style="font-size: 1.15rem; font-family: var(--font-serif); margin-bottom: 20px; line-height: 1.6;">
              "${story.scenario}"
            </p>

            <div class="form-label" style="margin-bottom: 12px;">What would you do?</div>
            <div class="options-grid">
              ${story.options.map((opt, i) => `
                <button class="option-tile story-option-btn" data-opt-idx="${i}" type="button">
                  <span class="option-indicator">${i + 1}</span>
                  <span>${opt.text}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      const optionBtns = this.container.querySelectorAll('.story-option-btn');
      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.optIdx, 10);
          const chosen = story.options[idx];
          this.empathyChoices.push({
            storyId: story.id,
            rubric: chosen.rubric,
            text: chosen.text
          });

          const entry = EventLogManager.createLogEntry({
            itemId: story.id,
            stage: 3,
            strand: 'empathy',
            room: 'room3',
            response: chosen.rubric,
            correct: true,
            latencyMs: 8000
          });
          window.SessionState?.events.push(entry);

          currentStoryIdx++;
          if (currentStoryIdx < stories.length) {
            renderStory();
          } else {
            this.renderGrowthMindset();
          }
        });
      });
    };

    renderStory();
  },

  renderGrowthMindset() {
    this.step = 'mindset';
    const mindsetPrompt = "Last little bit! How do you feel about challenges and learning? Just tap the smiley that feels most true.";

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 760px; margin: 0 auto;">
        <div class="room-ribbon">
          <div class="room-title-group">
            <span class="room-badge">Room 3: How You Feel</span>
            <span class="room-name">Feelings & Learning</span>
          </div>
        </div>

        ${MiraGuide.renderSpeech(mindsetPrompt, { canSpeak: true, expression: 'friendly' })}

        <div style="margin: 24px 0; display: flex; flex-direction: column; gap: 20px;">
          <!-- Item 1 -->
          <div style="background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-md); padding: 18px;">
            <p style="font-weight: 700; margin-bottom: 10px;">When a puzzle feels tricky at first...</p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <button class="confidence-btn mindset-btn" data-q="m1" data-val="growth" type="button">
                <span class="confidence-face">🌱</span>
                <span class="confidence-label">I like trying different ways</span>
              </button>
              <button class="confidence-btn mindset-btn" data-q="m1" data-val="cautious" type="button">
                <span class="confidence-face">🙂</span>
                <span class="confidence-label">I take a deep breath</span>
              </button>
              <button class="confidence-btn mindset-btn" data-q="m1" data-val="hesitant" type="button">
                <span class="confidence-face">🤔</span>
                <span class="confidence-label">I sometimes feel unsure</span>
              </button>
            </div>
          </div>

          <!-- Item 2 -->
          <div style="background: var(--color-warm-white); border: 1px solid var(--color-soft-sand); border-radius: var(--radius-md); padding: 18px;">
            <p style="font-weight: 700; margin-bottom: 10px;">Making a mistake usually means...</p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <button class="confidence-btn mindset-btn" data-q="m2" data-val="growth" type="button">
                <span class="confidence-face">💡</span>
                <span class="confidence-label">My brain is learning</span>
              </button>
              <button class="confidence-btn mindset-btn" data-q="m2" data-val="cautious" type="button">
                <span class="confidence-face">🔄</span>
                <span class="confidence-label">Time to try another way</span>
              </button>
              <button class="confidence-btn mindset-btn" data-q="m2" data-val="hesitant" type="button">
                <span class="confidence-face">💭</span>
                <span class="confidence-label">I prefer getting it right</span>
              </button>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <button id="btn-finish-all-rooms" class="btn-primary" type="button" style="padding: 14px 36px; font-size: 1.1rem;">
            Finish Session & Meet Mira 🌿 →
          </button>
        </div>
      </div>
    `;

    const btns = this.container.querySelectorAll('.mindset-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.q;
        const val = btn.dataset.val;
        btns.forEach(b => {
          if (b.dataset.q === q) b.classList.remove('selected');
        });
        btn.classList.add('selected');
        this.mindsetResponses.push({ question: q, response: val });
      });
    });

    document.getElementById('btn-finish-all-rooms').addEventListener('click', () => {
      const entry = EventLogManager.createLogEntry({
        itemId: 'growth-mindset-survey',
        stage: 3,
        strand: 'mindset',
        room: 'room3',
        response: JSON.stringify(this.mindsetResponses),
        correct: true,
        latencyMs: 15000
      });
      window.SessionState?.events.push(entry);

      if (this.onComplete) this.onComplete('cooldown');
    });
  }
};
