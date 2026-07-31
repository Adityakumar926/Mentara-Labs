import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, AlertCircle, Play, Square, Settings, RefreshCw, Send } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { aiApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function VoiceTutor() {
  const navigate = useNavigate();
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [textInput, setTextInput] = useState('');

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const selectedVoiceRef = useRef(selectedVoiceName);
  const isMutedRef = useRef(isMuted);
  const handleSendToAIRef = useRef(null);

  // Listen for whiteboard open/close — shrink chatbot when whiteboard is active
  useEffect(() => {
    const handleWbToggle = (e) => {
      setIsWhiteboardOpen(e.detail?.open ?? false);
    };
    window.addEventListener('whiteboard-toggle', handleWbToggle);
    return () => window.removeEventListener('whiteboard-toggle', handleWbToggle);
  }, []);

  // Auto-collapse / fade widget when user scrolls down (captures scroll inside .sl-main or any div)
  useEffect(() => {
    let timer;
    const handleScroll = (e) => {
      const target = e.target;
      const scrollTop = (target && typeof target.scrollTop === 'number' && target.scrollTop > 0) 
        ? target.scrollTop 
        : (window.scrollY || document.documentElement.scrollTop || 0);

      if (scrollTop > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsScrolled(false);
      }, 2000);
    };

    // 'true' for capture phase to catch scroll on overflow divs like .sl-main
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(timer);
    };
  }, []);

  // Sync refs with state
  useEffect(() => {
    selectedVoiceRef.current = selectedVoiceName;
    if (selectedVoiceName && typeof window !== 'undefined') {
      localStorage.setItem('mentara_voice_name', selectedVoiceName);
    }
  }, [selectedVoiceName]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    handleSendToAIRef.current = handleSendToAI;
  });

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
      handleSendToAIRef.current?.(resultText);
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
        
        // Restore saved voice or auto-select a natural female voice by default
        const savedVoice = localStorage.getItem('mentara_voice_name');
        if (savedVoice && sortedVoices.some(v => v.name === savedVoice)) {
          setSelectedVoiceName(savedVoice);
          selectedVoiceRef.current = savedVoice;
        } else if (sortedVoices.length > 0 && !selectedVoiceRef.current) {
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
          selectedVoiceRef.current = defaultVoice.name;
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

  const [agentMetadata, setAgentMetadata] = useState(null);

  // Send request to Groq backend (State Graph Agentic Tutor)
  const handleSendToAI = async (textQuery) => {
    setStatus('thinking');
    
    // Pass current conversation history so the backend State Graph maintains context
    const currentHistory = [...history];
    const updatedHistory = [...history, { role: 'user', content: textQuery }];
    setHistory(updatedHistory);

    try {
      const res = await aiApi.voiceTutor(textQuery, currentHistory);
      
      if (res.data.success) {
        const aiResponse = res.data.response;
        setResponse(aiResponse);
        if (res.data.agentMetadata) {
          setAgentMetadata(res.data.agentMetadata);
          
          // Check for Agentic Action (e.g. NAVIGATE)
          if (res.data.agentMetadata.action && res.data.agentMetadata.action.type === 'NAVIGATE') {
            const action = res.data.agentMetadata.action;
            const { url, label } = action;
            toast.success(`🚀 ${label || 'Navigating'}...`, { icon: '🤖', duration: 4000 });
            
            // Dispatch event for active page
            window.dispatchEvent(new CustomEvent('VOICE_TUTOR_ACTION', { detail: action }));
            
            if (url) {
              sessionStorage.setItem('pending_voice_action', JSON.stringify(action));
              if (window.location.pathname !== url) {
                setTimeout(() => {
                  navigate(url);
                }, 1800);
              }
            }
          }
        }
        setHistory(prev => [...prev, { role: 'assistant', content: aiResponse, metadata: res.data.agentMetadata }]);
        
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

  const handleTextSubmit = (e) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || status === 'thinking') return;
    const query = textInput.trim();
    setTextInput('');
    handleSendToAI(query);
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
    const activeIsMuted = isMutedRef.current !== undefined ? isMutedRef.current : isMuted;
    if (activeIsMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
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
    
    // Assign selected voice dynamically from fresh system voices using live ref
    const activeVoiceName = selectedVoiceRef.current || selectedVoiceName;
    const freshVoices = typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : [];
    const available = freshVoices.length > 0 ? freshVoices : voices;
    
    if (activeVoiceName) {
      const selected = available.find(v => v.name === activeVoiceName);
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
    selectedVoiceRef.current = voiceName;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mentara_voice_name', voiceName);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isMutedRef.current) {
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
      {/* Unified Floating Gogo Chatbot Trigger (Outer container is click-through) */}
      <div 
        className="fixed bottom-3 right-4 z-50 flex flex-col items-end pointer-events-none select-none transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Integrated Speech Bubble Banner pointing to Gogo (Hides cleanly on scroll unless hovered) */}
        <AnimatePresence>
          {!isOpen && !(isScrolled || isWhiteboardOpen) || (!isOpen && isHovered) ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative mb-2 mr-1 flex items-center gap-2 rounded-2xl border border-cyan-400/50 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/90 px-4 py-2 text-xs font-black text-white shadow-2xl backdrop-blur-md cursor-pointer pointer-events-auto group"
              style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              title="Click to talk with GOGO"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
              <Sparkles className="h-4 w-4 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
              <span className="tracking-wide text-xs sm:text-sm bg-gradient-to-r from-cyan-300 via-purple-200 to-amber-200 bg-clip-text text-transparent font-extrabold whitespace-nowrap">
                Ask GOGO AI Tutor 🎙️
              </span>
              {/* Speech Bubble Arrow Tail pointing down to GOGO */}
              <div className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 border-r border-b border-cyan-400/50 bg-slate-950" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* GOGO Robot Circular Button (Shrinks & semi-fades when scrolled OR whiteboard open) */}
        <motion.button
          className="relative flex items-center justify-center rounded-full cursor-pointer pointer-events-auto group transition-all duration-300"
          animate={{
            scale: !isOpen && (isScrolled || isWhiteboardOpen) && !isHovered ? 0.75 : 1,
            opacity: !isOpen && (isScrolled || isWhiteboardOpen) && !isHovered ? 0.55 : 1,
          }}
          whileHover={{ scale: 1.1, opacity: 1, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            width: !isOpen && (isScrolled || isWhiteboardOpen) && !isHovered ? '3.5rem' : '5rem',
            height: !isOpen && (isScrolled || isWhiteboardOpen) && !isHovered ? '3.5rem' : '5rem',
            background: 'transparent', 
            border: 'none', 
            outline: 'none' 
          }}
          title="Click to talk with GOGO"
        >
          {/* Glowing Radial Background Aura */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-r from-cyan-500/30 via-purple-600/30 to-amber-500/20 blur-xl group-hover:blur-2xl transition-all animate-pulse" />

          {/* Lottie Robot GOGO */}
          <div className="relative z-10 w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
            <DotLottieReact src="/RobotSaludando.json" loop autoplay style={{ width: '100%', height: '100%' }} />
          </div>
        </motion.button>
      </div>

      {/* Main Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[440px] flex-col rounded-3xl border border-slate-700 bg-slate-900/90 text-white backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 to-slate-900 px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 overflow-hidden shadow-inner">
                  <DotLottieReact src="/RobotSaludando.json" loop autoplay style={{ width: '100%', height: '100%' }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white tracking-wide">GOGO AI Voice Tutor 🤖</h3>
                  <p className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-300" /> State Graph Agent Active
                  </p>
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

            {/* Agentic State Graph Active Metadata Bar */}
            {agentMetadata && (
              <div className="flex items-center justify-between bg-purple-950/40 px-5 py-1.5 border-b border-purple-800/30 text-[10px] text-purple-200 font-semibold tracking-wide">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate">Topic: <strong className="text-white font-bold">{agentMetadata.currentTopic}</strong></span>
                </div>
                <span className="shrink-0 bg-purple-900/60 px-2 py-0.5 rounded-md text-[9px] text-cyan-300 font-extrabold uppercase border border-purple-700/50">
                  {agentMetadata.intent || 'TUTORING'}
                </span>
              </div>
            )}

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
                      <h4 className="font-bold text-sm mb-1 text-slate-200">Hi! I'm GOGO, your AI Voice Tutor 🤖</h4>
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
                      : 'Tap mic or type question'}
                  </span>

                  {/* Text Input Option for typing questions */}
                  <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Or type your question here..."
                      className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all"
                      disabled={status === 'thinking'}
                    />
                    <button
                      type="submit"
                      disabled={!textInput.trim() || status === 'thinking'}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all flex-shrink-0"
                      title="Send Message"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
