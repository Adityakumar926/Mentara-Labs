/**
 * Mentara Labs | Learning Profile Check
 * Room 2: Imagine (Creativity, Drawing & Curiosity)
 */

import { AudioGuide } from './audio.js';
import { MiraGuide } from './mira.js';
import { DrawingCanvas } from './canvas.js';
import { EventLogManager } from '../lib/schemas/event-log.js';

export const Room2Imagine = {
  container: null,
  onComplete: null,
  ideas: [],
  curiosityTilesOpened: 0,
  totalCuriosityTiles: 3,
  step: 'cup', // 'cup' | 'drawing' | 'curiosity'

  init(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.ideas = [];
    this.curiosityTilesOpened = 0;
    this.step = 'cup';
    this.renderManyUsesCup();
  },

  renderManyUsesCup() {
    this.step = 'cup';
    const promptText = "How many different things could a simple paper cup become? Tap any ideas you like, or type your own!";

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 760px; margin: 0 auto;">
        <div class="room-ribbon">
          <div class="room-title-group">
            <span class="room-badge">Room 2: Imagine</span>
            <span class="room-name">Many Uses Challenge</span>
          </div>
          <button id="btn-skip-cup" class="btn-quiet-skip" type="button">Skip this task →</button>
        </div>

        ${MiraGuide.renderSpeech(promptText, { canSpeak: true, expression: 'encouraging' })}

        <div style="text-align: center; margin: 16px 0;">
          <div style="font-size: 3rem; margin-bottom: 8px;">🥤</div>
          <h2 style="font-size: 1.35rem; margin-bottom: 6px;">A Paper Cup</h2>
          <p class="text-muted" style="font-size: 0.95rem;">What else could it be?</p>
        </div>

        <!-- Quick Idea Chips -->
        <div style="margin-bottom: 20px;">
          <div class="form-label">Tap to add an idea:</div>
          <div id="cup-quick-chips" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Telephone with string" type="button">+ Telephone with string</button>
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Mini flower pot" type="button">+ Mini flower pot</button>
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Pencil and crayon cup" type="button">+ Pencil holder</button>
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Party hat for a toy bear" type="button">+ Party hat for a toy</button>
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Sound shaker with beans" type="button">+ Shaker with beans</button>
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Castle tower for building blocks" type="button">+ Castle tower</button>
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Target game bowling pin" type="button">+ Bowling pin</button>
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Bug catcher with air holes" type="button">+ Bug observation cup</button>
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Megaphone for calling out" type="button">+ Voice megaphone</button>
            <button class="btn-ghost btn-sm idea-chip-btn" data-idea="Cookie cutter for dough" type="button">+ Dough cutter</button>
          </div>
        </div>

        <!-- Custom Idea Input -->
        <div style="display: flex; gap: 10px; margin-bottom: 24px;">
          <input 
            type="text" 
            id="input-custom-idea" 
            class="form-input" 
            placeholder="Type your own idea here..." 
            maxlength="60"
          />
          <button id="btn-add-custom-idea" class="btn-secondary" type="button" style="flex-shrink: 0;">
            Add Idea
          </button>
        </div>

        <!-- Ideas Collected List -->
        <div style="background: var(--color-soft-sand-light); border-radius: var(--radius-md); padding: 16px; min-height: 80px; margin-bottom: 24px;">
          <div style="font-size: 0.85rem; font-weight: 800; color: var(--color-deep-ink-muted); text-transform: uppercase; margin-bottom: 8px;">
            Your Ideas So Far (<span id="idea-count-badge">0</span>)
          </div>
          <div id="ideas-collection" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span class="text-muted" style="font-size: 0.95rem; font-style: italic;" id="ideas-empty-msg">No ideas added yet—tap one above or type your own!</span>
          </div>
        </div>

        <div style="text-align: center;">
          <button id="btn-finish-cup" class="btn-primary" type="button" style="padding: 14px 32px;">
            Done with Ideas → Let's Draw!
          </button>
        </div>
      </div>
    `;

    this.attachCupEvents();
  },

  attachCupEvents() {
    const chipsContainer = document.getElementById('cup-quick-chips');
    const inputCustom = document.getElementById('input-custom-idea');
    const btnAdd = document.getElementById('btn-add-custom-idea');
    const btnFinish = document.getElementById('btn-finish-cup');
    const btnSkip = document.getElementById('btn-skip-cup');

    chipsContainer.querySelectorAll('.idea-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idea = btn.dataset.idea;
        this.addIdea(idea);
        btn.disabled = true;
        btn.style.opacity = '0.5';
      });
    });

    const handleAddCustom = () => {
      const text = inputCustom.value.trim();
      if (text) {
        this.addIdea(text);
        inputCustom.value = '';
        inputCustom.focus();
      }
    };

    btnAdd.addEventListener('click', handleAddCustom);
    inputCustom.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCustom();
      }
    });

    btnFinish.addEventListener('click', () => {
      this.recordCupCreativityEvent();
      this.renderCompleteTheDrawing();
    });

    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        this.renderCompleteTheDrawing();
      });
    }

    const speakBtn = document.getElementById('btn-mira-speak');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        AudioGuide.speak("How many different things could a simple paper cup become? Tap any ideas you like, or type your own!");
      });
    }
  },

  addIdea(text) {
    if (!this.ideas.includes(text)) {
      this.ideas.push(text);
      this.updateIdeasUI();
    }
  },

  updateIdeasUI() {
    const collection = document.getElementById('ideas-collection');
    const countBadge = document.getElementById('idea-count-badge');
    const emptyMsg = document.getElementById('ideas-empty-msg');
    
    if (emptyMsg) emptyMsg.style.display = this.ideas.length > 0 ? 'none' : 'inline';
    if (countBadge) countBadge.textContent = this.ideas.length;

    collection.innerHTML = this.ideas.map((idea, index) => `
      <span style="background: #FFFFFF; border: 1px solid var(--color-sage); border-radius: var(--radius-full); padding: 6px 14px; font-size: 0.95rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
        <span>${idea}</span>
        <button type="button" data-del-idx="${index}" style="border: none; background: none; cursor: pointer; color: var(--color-deep-ink-muted); font-size: 0.85rem;" aria-label="Remove idea">×</button>
      </span>
    `).join('');

    collection.querySelectorAll('button[data-del-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.delIdx, 10);
        this.ideas.splice(idx, 1);
        this.updateIdeasUI();
      });
    });
  },

  recordCupCreativityEvent() {
    const entry = EventLogManager.createLogEntry({
      itemId: 'creativity-paper-cup',
      stage: 3,
      strand: 'creativity',
      room: 'room2',
      response: JSON.stringify(this.ideas),
      correct: true,
      latencyMs: 15000,
      attempts: this.ideas.length
    });
    window.SessionState?.events.push(entry);
    if (!window.SessionState.creativityIdeas) {
      window.SessionState.creativityIdeas = [];
    }
    window.SessionState.creativityIdeas = [...this.ideas];
  },

  renderCompleteTheDrawing() {
    this.step = 'drawing';
    const drawPrompt = "Turn these gentle curves into whatever picture comes into your imagination. Draw anything you like!";

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 760px; margin: 0 auto;">
        <div class="room-ribbon">
          <div class="room-title-group">
            <span class="room-badge">Room 2: Imagine</span>
            <span class="room-name">Complete the Drawing</span>
          </div>
          <button id="btn-skip-draw" class="btn-quiet-skip" type="button">Skip this task →</button>
        </div>

        ${MiraGuide.renderSpeech(drawPrompt, { canSpeak: true, expression: 'friendly' })}

        <!-- Drawing Canvas Area -->
        <div style="margin: 16px 0; display: flex; flex-direction: column; align-items: center;">
          <canvas 
            id="drawing-canvas" 
            style="width: 100%; max-width: 600px; height: 320px; background: #FFFFFF; border: 2px dashed var(--color-soft-sand); border-radius: var(--radius-md); touch-action: none; cursor: crosshair; box-shadow: var(--shadow-sm);"
          ></canvas>

          <!-- Color palette & tools -->
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 600px; margin-top: 14px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <span class="form-label" style="margin-bottom: 0;">Colours:</span>
              <button class="color-dot-btn active" data-color="#26333A" style="width: 32px; height: 32px; border-radius: 50%; background: #26333A; border: 2px solid #FAF8F4; cursor: pointer;"></button>
              <button class="color-dot-btn" data-color="#4F7F86" style="width: 32px; height: 32px; border-radius: 50%; background: #4F7F86; border: 2px solid #FAF8F4; cursor: pointer;"></button>
              <button class="color-dot-btn" data-color="#8FA998" style="width: 32px; height: 32px; border-radius: 50%; background: #8FA998; border: 2px solid #FAF8F4; cursor: pointer;"></button>
              <button class="color-dot-btn" data-color="#E29B63" style="width: 32px; height: 32px; border-radius: 50%; background: #E29B63; border: 2px solid #FAF8F4; cursor: pointer;"></button>
            </div>
            
            <div style="display: flex; gap: 8px;">
              <button id="btn-draw-undo" class="btn-ghost btn-sm" type="button">Undo ↩</button>
              <button id="btn-draw-clear" class="btn-ghost btn-sm" type="button">Start Over ↺</button>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <button id="btn-finish-drawing" class="btn-primary" type="button" style="padding: 14px 32px;">
            I Finished My Picture! →
          </button>
        </div>
      </div>
    `;

    const canvasElem = document.getElementById('drawing-canvas');
    DrawingCanvas.init(canvasElem);

    // Color buttons
    const colorBtns = this.container.querySelectorAll('.color-dot-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.style.outline = 'none');
        btn.style.outline = '3px solid var(--color-muted-teal)';
        DrawingCanvas.setColor(btn.dataset.color);
      });
    });

    document.getElementById('btn-draw-undo').addEventListener('click', () => DrawingCanvas.undo());
    document.getElementById('btn-draw-clear').addEventListener('click', () => DrawingCanvas.clear());

    document.getElementById('btn-finish-drawing').addEventListener('click', () => {
      const dataUrl = DrawingCanvas.getDataUrl();
      if (window.SessionState) {
        window.SessionState.drawingDataUrl = dataUrl;
      }
      const entry = EventLogManager.createLogEntry({
        itemId: 'creativity-canvas-drawing',
        stage: 3,
        strand: 'creativity',
        room: 'room2',
        response: 'DRAWING_SAVED_FOR_TEACHER',
        correct: true,
        latencyMs: 30000
      });
      window.SessionState?.events.push(entry);
      this.renderCuriosityTiles();
    });

    document.getElementById('btn-skip-draw').addEventListener('click', () => {
      this.renderCuriosityTiles();
    });
  },

  renderCuriosityTiles() {
    this.step = 'curiosity';
    const curiosityPrompt = "Here are three quiet wonders from the world. If you are curious, tap to peek inside—or move on whenever you are ready!";

    this.container.innerHTML = `
      <div class="calm-card screen-enter" style="max-width: 760px; margin: 0 auto;">
        <div class="room-ribbon">
          <div class="room-title-group">
            <span class="room-badge">Room 2: Imagine</span>
            <span class="room-name">Curiosity Corner</span>
          </div>
        </div>

        ${MiraGuide.renderSpeech(curiosityPrompt, { canSpeak: true, expression: 'thoughtful' })}

        <div style="display: grid; grid-template-columns: 1fr; gap: 14px; margin: 24px 0;">
          <!-- Tile 1 -->
          <div class="calm-card curiosity-tile" data-tile-id="c1" style="cursor: pointer; padding: 18px 22px; transition: all 300ms ease; border: 1.5px solid var(--color-soft-sand);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; font-size: 1.05rem;">🐝 Why do honeybees build hexagons?</span>
              <span class="tile-icon" style="font-size: 1.2rem;">+</span>
            </div>
            <div class="tile-body" style="display: none; margin-top: 12px; font-size: 0.95rem; color: var(--color-deep-ink-muted); line-height: 1.6;">
              Hexagons fit together with zero gaps between them! Mathematicians discovered it uses the least amount of wax to hold the most honey. Bees are natural geometry experts.
            </div>
          </div>

          <!-- Tile 2 -->
          <div class="calm-card curiosity-tile" data-tile-id="c2" style="cursor: pointer; padding: 18px 22px; transition: all 300ms ease; border: 1.5px solid var(--color-soft-sand);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; font-size: 1.05rem;">☁️ Where do rain clouds get their water?</span>
              <span class="tile-icon" style="font-size: 1.2rem;">+</span>
            </div>
            <div class="tile-body" style="display: none; margin-top: 12px; font-size: 0.95rem; color: var(--color-deep-ink-muted); line-height: 1.6;">
              Water evaporates from puddles, rivers, and even tree leaves! It rises as invisible vapour into the chilly sky, clustering around tiny specks of dust until it is heavy enough to fall as raindrops.
            </div>
          </div>

          <!-- Tile 3 -->
          <div class="calm-card curiosity-tile" data-tile-id="c3" style="cursor: pointer; padding: 18px 22px; transition: all 300ms ease; border: 1.5px solid var(--color-soft-sand);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; font-size: 1.05rem;">🌳 How do tree roots find water underground?</span>
              <span class="tile-icon" style="font-size: 1.2rem;">+</span>
            </div>
            <div class="tile-body" style="display: none; margin-top: 12px; font-size: 0.95rem; color: var(--color-deep-ink-muted); line-height: 1.6;">
              Root tips have microscopic moisture sensors that can sense tiny changes in damp soil from centimetres away. They steer themselves toward moisture just like a compass!
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <button id="btn-finish-room2" class="btn-primary" type="button" style="padding: 14px 32px;">
            Continue to Room 3: Keep Going →
          </button>
        </div>
      </div>
    `;

    const tiles = this.container.querySelectorAll('.curiosity-tile');
    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        const body = tile.querySelector('.tile-body');
        const icon = tile.querySelector('.tile-icon');
        const isClosed = body.style.display === 'none';
        body.style.display = isClosed ? 'block' : 'none';
        icon.textContent = isClosed ? '−' : '+';
        if (isClosed) {
          tile.style.borderColor = 'var(--color-muted-teal)';
          this.curiosityTilesOpened++;
          const entry = EventLogManager.createLogEntry({
            itemId: 'curiosity-tile-' + tile.dataset.tileId,
            stage: 3,
            strand: 'curiosity',
            room: 'room2',
            response: 'EXPLORED',
            correct: true,
            latencyMs: 5000
          });
          window.SessionState?.events.push(entry);
        }
      });
    });

    document.getElementById('btn-finish-room2').addEventListener('click', () => {
      if (this.onComplete) this.onComplete('room3');
    });
  }
};
