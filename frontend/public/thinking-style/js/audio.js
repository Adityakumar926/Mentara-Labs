/**
 * Mentara Labs | Learning Profile Check
 * Audio & Read-Aloud Engine using Web Speech Synthesis
 */

export const AudioGuide = {
  enabled: true,
  autoRead: false,
  synth: null,
  currentUtterance: null,
  preferredVoice: null,

  init(stage = 3) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Stages 1-2 have autoRead on by default to assist younger readers
      this.autoRead = stage <= 2;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  },

  loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer warm British or English female/natural voice for calm educator tone
    this.preferredVoice = voices.find(v => 
      (v.lang.includes('en-GB') || v.lang.includes('en-US')) && 
      (v.name.includes('Natural') || v.name.includes('Female') || v.name.includes('Serena') || v.name.includes('Google UK English Female'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  },

  speak(text, onEnd) {
    if (!this.enabled || !this.synth || !text) return;
    this.stop();

    // Clean text for speech
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    
    // Calm, kind, slightly slower tempo for primary school children
    utterance.rate = 0.88;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
      this.updateSpeakingUI(false);
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      this.updateSpeakingUI(false);
    };

    this.currentUtterance = utterance;
    this.updateSpeakingUI(true);
    this.synth.speak(utterance);
  },

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.currentUtterance = null;
      this.updateSpeakingUI(false);
    }
  },

  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stop();
    return this.enabled;
  },

  updateSpeakingUI(isSpeaking) {
    const speakBtns = document.querySelectorAll('.btn-read-aloud');
    speakBtns.forEach(btn => {
      if (isSpeaking) {
        btn.classList.add('speaking');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('speaking');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }
};
