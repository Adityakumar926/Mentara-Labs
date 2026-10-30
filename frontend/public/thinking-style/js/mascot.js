/**
 * Mentara Labs | Mentp Learning Compass
 * Premium Animated Mascot & Storytelling Guide Engine
 * 
 * Features:
 * - 3D Pip the robotic bunny astronaut guide & crystal compass
 * - Emotional & pedagogical states: 'welcome', 'instructions', 'thinking', 'celebrate', 'hint'
 * - Safe-sided, growth-mindset voice and text guidance
 * - Accessible Web Speech API integration
 */

import { VisualAssetSystem } from './visual-asset-system.js';

export const MascotGuide = {
  name: 'Pip',

  /**
   * Generates dynamic 3D Pip mascot based on state
   */
  renderMascotSvg(state = 'welcome', size = 96) {
    return VisualAssetSystem.renderPip3D(state, size);
  },

  /**
   * Renders the bespoke translucent 3D crystal compass artifact
   */
  render3DCompassSvg(size = 88) {
    return `
      <div class="anim-compass-crystal" style="width: ${size}px; height: ${size}px; display: inline-flex; align-items: center; justify-content: center; position: relative;" title="Interactive 3D Crystal Compass">
        <img src="assets/3d/compass-3d-crystal.png" alt="Translucent 3D Crystal Compass" style="width: 100%; height: 100%; object-fit: contain; display: block;" loading="eager" />
      </div>
    `;
  },

  /**
   * Renders the complete Mascot Speech Stage with audio read-aloud and character avatar
   */
  renderStage(speechText, options = {}) {
    const {
      state = 'welcome',
      characterKey = 'pip',
      characterName = 'Pip',
      speakerTitle = null,
      canSpeak = true,
      hintText = null
    } = options;

    const displayTitle = speakerTitle || `${characterName} • Guide`;
    const cleanText = speechText.replace(/"/g, '&quot;');
    const avatarSvg = VisualAssetSystem.renderCharacterSvg(characterKey, state, 72);

    return `
      <section class="mira-container screen-enter" aria-label="Guidance from ${displayTitle}">
        <div class="mira-avatar" style="border-color: var(--mission-accent, #78BFA5);">
          ${avatarSvg}
        </div>
        <div class="mira-speech">
          <div class="mira-name" style="color: var(--mission-accent, #4F7F86);">${displayTitle}</div>
          <div class="mira-text">${speechText}</div>
          
          <div class="mira-speech-actions">
            ${canSpeak ? `
              <button class="btn-read-aloud btn-listen-speech" type="button" aria-label="Listen to guidance" data-text="${cleanText}">
                <span aria-hidden="true">🔊</span>
                <span>Listen</span>
              </button>
            ` : ''}

            ${hintText ? `
              <button class="btn-read-aloud" id="btn-toggle-hint" type="button" aria-expanded="false" aria-label="Need a gentle clue?">
                <span aria-hidden="true">💡</span>
                <span>Need a clue?</span>
              </button>
            ` : ''}
          </div>

          ${hintText ? `
            <div id="drawer-hint" class="hint-drawer glass-surface" style="display: none;">
              <div style="font-weight: 800; font-size: 0.85rem; color: #E29B63; margin-bottom: 4px;">🏮 ${characterName}'s Gentle Clue:</div>
              <div class="hint-content">${hintText}</div>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  },

  /**
   * Supportive, encouraging voice cues
   */
  dialogues: {
    patternPlanet: "Welcome to Pattern Planet! Look closely at the floating shapes and see what repeats.",
    memoryForest: "Welcome to Memory Forest! Take a deep breath and watch the trail of forest lights.",
    switchLab: "Welcome to the Switch Lab! Gears turn and rules can flip. Let's see how quick you adapt!",
    storyShip: "Ahoy on the Story Ship! Read the tale of friends at sea. What happens next?",
    inventorWorkshop: "Welcome to the Inventor's Workshop! There are no wrong answers—what could this become?",
    feelingsGarden: "Welcome to Feelings Garden. The flowers bloom when we understand each other's feelings.",
    friendshipFairness: "Welcome to Friendship & Fairness! How would you share and work together here?",
    learningDetective: "Welcome to the Learning Detective headquarters! Use all your clues to crack the case.",
    correctEffort: "Wonderful exploration! You took your time and figured that out.",
    neutralSupport: "Thank you for sharing your answer! Every idea helps us see how your brain likes to work.",
    takeBreak: "Remember, you can take a pause whenever you wish. Learning is a marathon, not a rush!"
  }
};
