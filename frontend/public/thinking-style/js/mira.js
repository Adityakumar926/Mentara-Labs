/**
 * Mentara Labs | Learning Profile Check
 * Shruti Guide Character & Dialogue Engine
 * 
 * Rules:
 * - Friendly, calm, illustrated guide (not a doctor, no medical title).
 * - Short, quiet sentences.
 * - Guide name: Shruti.
 * - Never praise intelligence ("You're so smart"); praise effort & ideas ("You kept trying. I noticed.").
 */

export const ShrutiGuide = {
  // SVG Graphic representation of Shruti (Calm, friendly guide)
  renderAvatar(expression = 'friendly') {
    return `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Shruti, your guide" role="img" style="width: 100%; height: 100%;">
        <circle cx="50" cy="50" r="48" fill="#F4EFE7" stroke="#8FA998" stroke-width="2.5" />
        
        <!-- Soft Hair Style -->
        <path d="M22 46C22 30 35 18 50 18C65 18 78 30 78 46C78 52 75 58 72 60C70 48 64 32 50 32C36 32 30 48 28 60C25 58 22 52 22 46Z" fill="#4F7F86" />
        
        <!-- Face -->
        <circle cx="50" cy="54" r="28" fill="#FAF8F4" />
        
        <!-- Gentle Eyes -->
        <ellipse cx="40" cy="52" rx="3.5" ry="4" fill="#26333A" />
        <ellipse cx="60" cy="52" rx="3.5" ry="4" fill="#26333A" />
        <circle cx="41.5" cy="50.5" r="1.2" fill="#FFFFFF" />
        <circle cx="61.5" cy="50.5" r="1.2" fill="#FFFFFF" />
        
        <!-- Cheeks -->
        <circle cx="34" cy="58" r="4" fill="#E29B63" opacity="0.35" />
        <circle cx="66" cy="58" r="4" fill="#E29B63" opacity="0.35" />
        
        <!-- Smile / Expression -->
        ${expression === 'thoughtful' 
          ? '<path d="M44 64C47 66 53 66 56 64" stroke="#26333A" stroke-width="2" stroke-linecap="round" />'
          : expression === 'encouraging'
          ? '<path d="M42 63C46 68 54 68 58 63" stroke="#26333A" stroke-width="2.5" stroke-linecap="round" fill="none" />'
          : '<path d="M43 63C46 66 54 66 57 63" stroke="#26333A" stroke-width="2" stroke-linecap="round" fill="none" />'
        }
        
        <!-- Friendly Sage Scarf / Collar -->
        <path d="M35 78C40 73 60 73 65 78C62 84 38 84 35 78Z" fill="#8FA998" />
      </svg>
    `;
  },

  renderSpeech(text, options = {}) {
    const { 
      expression = 'friendly', 
      canSpeak = true, 
      speakerName = 'Shruti' 
    } = options;

    return `
      <section class="mira-container mira-idle" aria-label="Message from Shruti">
        <div class="mira-avatar">
          ${this.renderAvatar(expression)}
        </div>
        <div class="mira-speech">
          <div class="mira-name">${speakerName}</div>
          <div class="mira-text" id="mira-text-content">${text}</div>
          ${canSpeak ? `
            <div class="mira-speech-actions">
              <button class="btn-read-aloud btn-listen-speech" id="btn-mira-speak" type="button" aria-label="Listen to Shruti read this aloud" data-text="${text.replace(/"/g, '&quot;')}">
                <span aria-hidden="true">🔊</span>
                <span>Listen</span>
              </button>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  },

  // Effort-based, calm encouragement cues
  phrases: {
    welcome: "Hello! I am Shruti. Take your time today. There are no wrong answers here.",
    confidencePrompt: "Before you choose, how does this question feel to you?",
    warmupIntro: "We will start with a few curious puzzles to see how your mind likes to think.",
    thinkIntro: "Here are a few questions where we can look at how you work things out.",
    imagineIntro: "In this room, you can make, draw, and imagine. What ideas can you dream up?",
    keepGoingIntro: "Here is a puzzle that is meant to be tricky. You can try as many times as you like, or use a hint.",
    storyIntro: "Here are some short stories about friends at school. What would you do?",
    coolDown: "Wonderful effort today. You kept trying and exploring. Shruti has some notes ready for your grown-up now.",
    effortNotice: [
      "You took your time to think carefully. I noticed.",
      "You kept going even when it was tricky. That was thoughtful.",
      "You tried a different way when the first one didn't work.",
      "You have such unique ideas. Thank you for sharing them."
    ]
  }
};

// Aliased export for compatibility
export const MiraGuide = ShrutiGuide;
