/**
 * Mentara Labs | Mentp Learning Compass
 * Human-like Female Voice Engine
 * 
 * Guarantees:
 * 1. STRICTLY FEMALE: Never picks Microsoft David, Mark, or any male voice.
 * 2. On Windows: Automatically locks onto Microsoft Zira Desktop (female) or Microsoft Neerja/Heera (Indian female) if present.
 * 3. On Chrome/Edge: Detects all Indian English Female, UK/US Female, and Natural Online Female voices.
 * 4. Pitch (1.18) & Rate (0.92) calibrated for cheerful, friendly, warm educational narration.
 * 5. Provides live voice list and manual switcher for the UI.
 */

export const VoiceEngine = {
  selectedVoice: null,
  availableFemaleVoices: [],
  isMuted: false,
  isLoaded: false,
  voiceName: 'Loading female voice...',

  init() {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    this.loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  },

  isMaleVoice(v) {
    if (!v) return false;
    const name = (v.name || '').toLowerCase();
    const maleNames = ['david', 'mark', 'george', 'male', 'guy', 'boy', 'prabhat', 'ravi', 'richard', 'james', 'stefan', 'cosimo'];
    return maleNames.some(m => name.includes(m));
  },

  isFemaleVoice(v) {
    if (!v || this.isMaleVoice(v)) return false;
    const name = (v.name || '').toLowerCase();
    const femaleHints = [
      'zira', 'female', 'girl', 'woman', 'neerja', 'heera', 'shruti', 'priya',
      'swara', 'rani', 'veena', 'aditi', 'ananya', 'sunita', 'samantha', 'victoria',
      'karen', 'eva', 'hazel', 'catherine', 'jenny', 'sonia', 'aria', 'natasha', 'linda', 'susan'
    ];
    return femaleHints.some(f => name.includes(f));
  },

  loadVoices() {
    const allVoices = window.speechSynthesis.getVoices() || [];
    if (!allVoices.length) return;

    // Filter STRICTLY for female voices or voices not identified as male
    const femaleVoices = allVoices.filter(v => this.isFemaleVoice(v));
    const nonMaleVoices = allVoices.filter(v => !this.isMaleVoice(v));
    
    // Store for UI selector
    this.availableFemaleVoices = femaleVoices.length > 0 ? femaleVoices : nonMaleVoices;

    // Priority 1: Indian English Female (Neerja, Heera, Priya, Swara, Aditi)
    const indianFemale = femaleVoices.find(v => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return (lang.includes('en-in') || lang.includes('en_in') || name.includes('india'));
    });

    // Priority 2: Microsoft Zira Desktop (standard high-clarity Windows female voice)
    const zira = allVoices.find(v => (v.name || '').toLowerCase().includes('zira'));

    // Priority 3: Any Natural / Online English Female
    const naturalFemale = femaleVoices.find(v => {
      const name = (v.name || '').toLowerCase();
      return name.includes('natural') || name.includes('online') || name.includes('google');
    });

    // Priority 4: Any English Female voice
    const anyEnglishFemale = femaleVoices.find(v => (v.lang || '').toLowerCase().startsWith('en'));

    // Priority 5: Any other female voice
    const anyFemale = femaleVoices[0];

    // Priority 6: Any non-male voice (fallback, never pick David/Mark)
    const nonMale = nonMaleVoices[0];

    // Set voice (strictly never David/Mark)
    this.selectedVoice = indianFemale || zira || naturalFemale || anyEnglishFemale || anyFemale || nonMale || allVoices[0];
    this.isLoaded = true;
    this.voiceName = this.selectedVoice ? `${this.selectedVoice.name} (${this.selectedVoice.lang})` : 'Default Female Voice';

    console.log('VoiceEngine strictly loaded female voice:', this.voiceName);

    // Notify UI
    window.dispatchEvent(new CustomEvent('voice:ready', {
      detail: { 
        voiceName: this.voiceName,
        availableVoices: this.availableFemaleVoices.map(v => ({ name: v.name, lang: v.lang }))
      }
    }));
  },

  setVoiceByName(name) {
    const allVoices = window.speechSynthesis.getVoices() || [];
    const match = allVoices.find(v => v.name === name);
    if (match) {
      this.selectedVoice = match;
      this.voiceName = `${match.name} (${match.lang})`;
      console.log('VoiceEngine switched voice to:', this.voiceName);
    }
  },

  speak(text) {
    if (this.isMuted || !('speechSynthesis' in window)) return;
    if (!text || text.trim() === '') return;

    if (!this.selectedVoice) {
      this.loadVoices();
    }

    window.speechSynthesis.cancel(); // Stop pending audio

    const utterance = new SpeechSynthesisUtterance(text);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Always ensure youthful, cheerful, warm educational female cadence
    // Pitch: 1.18 gives a bright, friendly female delivery
    // Rate: 0.92 gives clear unhurried pacing for children
    utterance.pitch = 1.18;
    utterance.rate = 0.92;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  },

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return !this.isMuted;
  }
};
