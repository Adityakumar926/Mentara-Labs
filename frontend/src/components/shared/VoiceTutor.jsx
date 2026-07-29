import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, AlertCircle, Play, Square, Settings, RefreshCw } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { aiApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function VoiceTutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'listening', 'thinking', 'speaking'
  const [history, setHistory] = useState([]); // [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech Recognition API is not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setTranscript('');
    };

    rec.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      handleSendToAI(resultText);
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please check your browser settings.');
      } else {
        toast.error(`Voice error: ${event.error}`);
      }
      setIsListening(false);
      setStatus('idle');
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    // Load available voices for text-to-speech
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        // Filter english voices
        const engVoices = availableVoices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('en-'));
        const list = engVoices.length > 0 ? engVoices : availableVoices;

        // Sort natural and female voices to the top
        const sortedVoices = [...list].sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aNatural = aName.includes('natural') || aName.includes('neural') || aName.includes('google') || aName.includes('female') || aName.includes('zira') || aName.includes('samantha') || aName.includes('aria') || aName.includes('jenny');
          const bNatural = bName.includes('natural') || bName.includes('neural') || bName.includes('google') || bName.includes('female') || bName.includes('zira') || bName.includes('samantha') || bName.includes('aria') || bName.includes('jenny');
          if (aNatural && !bNatural) return -1;
          if (!aNatural && bNatural) return 1;
          return 0;
        });

        setVoices(sortedVoices);
        
        // Auto-select a natural female voice by default
        if (sortedVoices.length > 0 && !selectedVoiceName) {
          const priorities = [
            'natural',
            'neural',
            'google uk english female',
            'google us english',
            'microsoft jenny',
            'microsoft aria',
            'microsoft sonia',
            'microsoft zira',
            'microsoft hazel',
            'samantha',
            'karen',
            'victoria',
            'female'
          ];
          
          let selected = null;
          for (const keyword of priorities) {
            selected = sortedVoices.find(v => v.name.toLowerCase().includes(keyword));
            if (selected) break;
          }
          
          const defaultVoice = selected || sortedVoices[0];
          setSelectedVoiceName(defaultVoice.name);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Stop speaking on unmount
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll to bottom when conversation history changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, status]);

  // Toggle microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    // Stop speaking if active
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Stop AI from speaking
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (status === 'speaking') {
        setStatus('idle');
      }
    }
  };

  // Send request to Groq backend
  const handleSendToAI = async (textQuery) => {
    setStatus('thinking');
    
    // Add user message to history
    const updatedHistory = [...history, { role: 'user', content: textQuery }];
    setHistory(updatedHistory);

    try {
      const res = await aiApi.voiceTutor(textQuery, history);
      
      if (res.data.success) {
        const aiResponse = res.data.response;
        setResponse(aiResponse);
        setHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        
        // Trigger voice response
        speakResponse(aiResponse);
      } else {
        throw new Error(res.data.message || 'Failed to get a response.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Server error.');
      setStatus('idle');
    }
  };

  // Clean text for speech synthesis so it sounds natural without reading markdown symbols or emojis
  const cleanTextForSpeech = (rawText) => {
    if (!rawText) return '';
    return rawText
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove markdown bold
      .replace(/\*(.*?)\*/g, '$1')     // remove markdown italic
      .replace(/[`#_]/g, '')            // remove code ticks, hashes
      .replace(/https?:\/\/\S+/g, '')   // remove URLs
      .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '') // remove emojis
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Speak response out loud using Web Speech Synthesis
  const speakResponse = (text) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStatus('idle');
      return;
    }

    window.speechSynthesis.cancel(); // Clear any ongoing speech
    
    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) {
      setStatus('idle');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Assign selected voice dynamically from fresh system voices
    const freshVoices = typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : [];
    const available = freshVoices.length > 0 ? freshVoices : voices;
    
    if (selectedVoiceName) {
      const selected = available.find(v => v.name === selectedVoiceName);
      if (selected) utterance.voice = selected;
    } else if (available.length > 0) {
      utterance.voice = available[0];
    }

    // Set speaking attributes (natural female teacher tone: 1.0 pitch avoids robotic pitch-shift artifacts)
    utterance.rate = 0.95; 
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setStatus('speaking');
    };

    utterance.onend = () => {
      setStatus('idle');
    };

    utterance.onerror = (err) => {
      console.error('Speech synthesis error:', err);
      setStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Preview voice sample when user selects a voice from settings dropdown
  const handleVoiceSelect = (voiceName) => {
    setSelectedVoiceName(voiceName);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const freshVoices = window.speechSynthesis.getVoices();
      const chosen = freshVoices.find(v => v.name === voiceName) || voices.find(v => v.name === voiceName);
      if (chosen) {
        const preview = new SpeechSynthesisUtterance("Hello! I am your AI voice tutor.");
        preview.voice = chosen;
        preview.rate = 0.95;
        preview.pitch = 1.0;
        window.speechSynthesis.speak(preview);
      }
    }
  };

  const clearChat = () => {
    setHistory([]);
    setTranscript('');
    setResponse('');
    stopSpeaking();
    setStatus('idle');
  };

  return (
    <>
      {/* Floating Robot Button to open Voice Tutor */}
      <motion.button
        className="fixed bottom-2 right-2 z-50 flex h-28 w-28 items-center justify-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        style={{ background: 'transparent', border: 'none', outline: 'none' }}
      >
        <DotLottieReact src="/RobotSaludando.json" loop autoplay style={{ width: '100%', height: '100%' }} />
      </motion.button>

      {/* Main Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-96 flex-col rounded-3xl border border-slate-700 bg-slate-900/90 text-white backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 to-slate-900 px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 border border-cyan-500/20 overflow-hidden">
                  <DotLottieReact src="/RobotSaludando.json" loop autoplay style={{ width: '100%', height: '100%' }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white tracking-wide">AI Voice Tutor</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Cambridge Primary Assistant</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  title="Voice Settings"
                >
                  <Settings className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={clearChat}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  title="Clear Conversation"
                >
                  <RefreshCw className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => { setIsOpen(false); stopSpeaking(); }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Main Area: Switch Settings or Chat Area */}
            {showSettings ? (
              <div className="flex-1 overflow-y-auto p-5">
                <h4 className="font-bold text-xs text-cyan-400 uppercase tracking-wider mb-4">Voice Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Speak Responses</label>
                    <button
                      onClick={() => {
                        const newMuteState = !isMuted;
                        setIsMuted(newMuteState);
                        if (newMuteState) stopSpeaking();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold border transition-all ${
                        !isMuted 
                          ? 'bg-purple-600/20 border-purple-500 text-purple-200' 
                          : 'bg-slate-800/40 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span>{!isMuted ? 'Read Aloud Enabled 🔊' : 'Muted / Text Only 🔇'}</span>
                      {!isMuted ? <Volume2 size={16} className="text-purple-400" /> : <VolumeX size={16} />}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Voice Accent & Gender</label>
                    {voices.length === 0 ? (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-800/50 p-3 text-xs text-slate-400">
                        <AlertCircle size={14} />
                        <span>No browser voices loaded. Using system default.</span>
                      </div>
                    ) : (
                      <select
                        value={selectedVoiceName}
                        onChange={(e) => handleVoiceSelect(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-3 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        {voices.map((v) => (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:brightness-105 transition-all mt-4"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Chat History Panel */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <div className="w-28 h-28 mb-1">
                        <DotLottieReact src="/RobotSaludando.json" loop autoplay style={{ width: '100%', height: '100%' }} />
                      </div>
                      <h4 className="font-bold text-sm mb-1 text-slate-200">Hi! I'm your AI Voice Tutor.</h4>
                      <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                        Click the microphone and ask me anything about your Math, Science, or English lessons!
                      </p>
                    </div>
                  ) : (
                    history.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed ${
                          msg.role === 'user'
                            ? 'ml-auto bg-purple-600 text-white rounded-br-none shadow-md'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))
                  )}

                  {/* Transcript of currently recording question */}
                  {status === 'listening' && (
                    <div className="flex gap-2.5 items-center justify-start text-xs text-slate-400 bg-slate-800/30 border border-slate-800/50 rounded-xl p-3 italic">
                      <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      <span>Listening: {transcript || '...'}</span>
                    </div>
                  )}

                  {/* AI Response thinking spinner */}
                  {status === 'thinking' && (
                    <div className="flex gap-2 items-center text-xs text-slate-400 italic">
                      <span className="flex h-4.5 w-4.5 items-center justify-center animate-spin text-purple-400">
                        <RefreshCw size={14} />
                      </span>
                      <span>AI Tutor is thinking...</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Status Indicator & Voice Controls Panel */}
                <div className="bg-slate-950/80 border-t border-slate-800 p-4 flex flex-col items-center justify-center gap-3">
                  
                  {/* Glowing Mic button & active speaker */}
                  <div className="flex items-center justify-center gap-6">
                    {/* Secondary Stop Speaking button */}
                    {status === 'speaking' ? (
                      <button
                        onClick={stopSpeaking}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                        title="Stop Reading Aloud"
                      >
                        <Square size={16} />
                      </button>
                    ) : (
                      <div className="w-9" /> // placeholder spacer
                    )}

                    {/* Microphone Pulse button */}
                    <button
                      onClick={toggleListening}
                      className={`relative flex h-16 w-16 items-center justify-center rounded-full text-white transition-all duration-300 ${
                        isListening
                          ? 'bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                          : status === 'thinking'
                          ? 'bg-yellow-500'
                          : 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:scale-105'
                      }`}
                    >
                      {/* Pulse rings for recording visual feedback */}
                      {isListening && (
                        <>
                          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                          <span className="absolute -inset-2 rounded-full border-2 border-red-400/30 animate-pulse" />
                        </>
                      )}
                      
                      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    {/* Volume Mute state toggle */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                        isMuted
                          ? 'bg-slate-800 border-slate-700 text-slate-500'
                          : 'bg-purple-500/10 border-purple-500/20 text-cyan-400 hover:bg-purple-500/20'
                      }`}
                      title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none">
                    {status === 'listening'
                      ? 'Listening... Speak now'
                      : status === 'thinking'
                      ? 'Processing question...'
                      : status === 'speaking'
                      ? 'AI is speaking...'
                      : 'Tap mic to ask tutor'}
                  </span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
