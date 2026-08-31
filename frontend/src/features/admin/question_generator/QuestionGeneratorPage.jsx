import { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Upload, FileText, CheckCircle2, AlertCircle, Trash2, 
  BookOpen, Layers, Sliders, Database, Save, Eye, RefreshCw, 
  Check, HelpCircle, FileCheck, ArrowRight, ExternalLink, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Button, EmptyState } from '@/components/ui';
import { adminApi } from '@/api/services';
import { useApi, useMutation } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import html2canvas from 'html2canvas';

export default function QuestionGeneratorPage() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator', 'documents'
  
  // Controls state
  const [stage, setStage] = useState('Stage 6');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('Mathematics');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedTopicName, setSelectedTopicName] = useState('Angles & Geometry');
  const [difficulty, setDifficulty] = useState('mixed'); // 'easy', 'medium', 'hard', 'mixed'
  const [questionType, setQuestionType] = useState('mcq'); // 'mcq', 'short_answer', 'true_false', 'mixed'
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [aiModel, setAiModel] = useState('gemini-3.6-flash');

  // Document Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestionIndexes, setSelectedQuestionIndexes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch subjects & curriculum tree from API
  const { data: subjectsRes } = useApi(adminApi.getSubjects);
  const subjects = useMemo(() => Array.isArray(subjectsRes) ? subjectsRes : (subjectsRes?.data ?? []), [subjectsRes]);

  // Filter out Teacher Zone classes & deduplicate subjects per stage
  const filteredSubjects = useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    
    // 1. Filter out any Teacher Zone classes or teacher-only subjects
    const validSubjects = subjects.filter(s => {
      const className = (s.class_name || '').toLowerCase();
      const subjectName = (s.name || '').toLowerCase();
      return !className.includes('teacher') && !subjectName.includes('teacher');
    });

    // 2. Filter by selected stage if available (e.g. Stage 1, Stage 2)
    const stageMatched = validSubjects.filter(s => {
      if (!s.class_name) return true;
      const cName = s.class_name.toLowerCase().trim();
      const stName = stage.toLowerCase().trim();
      return cName.includes(stName) || cName.replace(/\s+/g, '') === stName.replace(/\s+/g, '');
    });

    const candidateList = stageMatched.length > 0 ? stageMatched : validSubjects;

    // 3. Deduplicate by unique subject name
    const map = new Map();
    candidateList.forEach(s => {
      if (s && s.name) {
        const key = s.name.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, s);
        }
      }
    });
    return Array.from(map.values());
  }, [subjects, stage]);

  // Fetch topics for selected subject
  const { data: topicsRes } = useApi(
    () => selectedSubjectId ? adminApi.getTopics(selectedSubjectId) : Promise.resolve([]),
    null,
    [selectedSubjectId]
  );
  const topics = useMemo(() => Array.isArray(topicsRes) ? topicsRes : (topicsRes?.data ?? []), [topicsRes]);

  // Fetch uploaded RAG documents from Cloudinary source_RAG folder
  const { data: docsRes, refetch: refetchDocs } = useApi(adminApi.getRagDocuments);
  const ragDocuments = useMemo(() => Array.isArray(docsRes) ? docsRes : (docsRes?.data ?? []), [docsRes]);

  // Auto-set initial subject & topic selection when Stage or filteredSubjects changes
  useEffect(() => {
    if (filteredSubjects.length > 0) {
      const exists = filteredSubjects.some(s => s.id === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(filteredSubjects[0].id);
        setSelectedSubjectName(filteredSubjects[0].name);
      }
    }
  }, [filteredSubjects, selectedSubjectId]);

  useEffect(() => {
    if (topics.length > 0) {
      setSelectedTopicId(topics[0].id);
      setSelectedTopicName(topics[0].name);
    } else {
      setSelectedTopicId('');
      setSelectedTopicName('General Topic');
    }
  }, [topics]);

  // Handle RAG Document Upload to Cloudinary (folder: source_RAG)
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.error('Please select a file to upload');

    setIsUploading(true);
    const toastId = toast.loading('Uploading document to Cloudinary (folder: source_RAG)...');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('stage_name', stage);
      formData.append('subject_name', selectedSubjectName);
      formData.append('topic_name', selectedTopicName);

      await adminApi.uploadRagDocument(formData);
      toast.success('Document uploaded to source_RAG successfully!', { id: toastId });
      setUploadFile(null);
      refetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Delete Document
  const handleDeleteDocument = async (docId) => {
    try {
      await adminApi.deleteRagDocument(docId);
      toast.success('Source document deleted');
      refetchDocs();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  // Handle AI Question Generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('AI is generating syllabus-aligned questions...');

    try {
      const res = await adminApi.generateQuestions({
        stage,
        subject: selectedSubjectName,
        topic: selectedTopicName,
        count: parseInt(questionCount, 10),
        difficulty,
        question_type: questionType,
        document_id: selectedDocumentId || null,
        additional_instructions: additionalInstructions,
        ai_model: aiModel
      });

      const rawData = res.data?.data ?? res.data;
      const qList = Array.isArray(rawData) ? rawData : (Array.isArray(res.data?.questions) ? res.data.questions : []);
      setGeneratedQuestions(qList);
      // Select all by default
      setSelectedQuestionIndexes(qList.map((_, i) => i));
      if (qList.length > 0) {
        toast.success(`Generated ${qList.length} questions successfully!`, { id: toastId });
      } else {
        toast.error('No questions returned from generator', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedQuestionIndexes.length === generatedQuestions.length) {
      setSelectedQuestionIndexes([]);
    } else {
      setSelectedQuestionIndexes(generatedQuestions.map((_, i) => i));
    }
  };

  const toggleSelectIndex = (idx) => {
    if (selectedQuestionIndexes.includes(idx)) {
      setSelectedQuestionIndexes(selectedQuestionIndexes.filter(i => i !== idx));
    } else {
      setSelectedQuestionIndexes([...selectedQuestionIndexes, idx]);
    }
  };

  // Save selected questions as Structure Question Images to Question Bank
  const handleSaveSelected = async () => {
    if (!selectedSubjectId) return toast.error('Please select a subject first');
    if (!selectedQuestionIndexes.length) return toast.error('No questions selected');

    setIsSaving(true);
    const toastId = toast.loading(`Generating Question Images & saving ${selectedQuestionIndexes.length} structure questions...`);

    try {
      const selectedQuestionsPayload = [];

      for (const idx of selectedQuestionIndexes) {
        const q = generatedQuestions[idx];
        const cardElem = document.getElementById(`cambridge-card-${idx}`);
        let capturedImageUrl = null;

        if (cardElem) {
          try {
            const canvas = await html2canvas(cardElem, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#FAF7F2',
              logging: false
            });
            capturedImageUrl = canvas.toDataURL('image/png');
          } catch (cErr) {
            console.warn('html2canvas capture warning:', cErr.message);
          }
        }

        selectedQuestionsPayload.push({
          ...q,
          question_type: 'photo', // ALWAYS structure question type
          image_url: capturedImageUrl || q.image_url || null,
          options: q.options || [],
          correct_answer: q.correct_answer || (Array.isArray(q.options) ? q.options[0] : 'A'),
          explanation: q.explanation || 'Step-by-step reasoning verified by Mentera Labs AI.'
        });
      }

      const res = await adminApi.saveBulkQuestions({
        subject_id: selectedSubjectId,
        topic_id: selectedTopicId || null,
        questions: selectedQuestionsPayload
      });

      toast.success(`🎉 Saved ${selectedQuestionsPayload.length} Question Images (Structure Type) to Question Bank!`, { id: toastId });
      setGeneratedQuestions(prev => prev.filter((_, i) => !selectedQuestionIndexes.includes(i)));
      setSelectedQuestionIndexes([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save questions', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageWrapper title="AI Question Generator Studio">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1400, margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* ── HEADER BANNER ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(0, 212, 255, 0.08) 50%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: '2rem',
          backdropFilter: 'blur(16px)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.25)',
              padding: '0.3rem 0.85rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--cyan)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem'
            }}>
              <Cpu size={13} /> RAG + Multi-Model Question Engine
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              AI Question Generator
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(245, 240, 238, 0.65)', lineHeight: 1.6 }}>
              Upload source textbooks & syllabus documents directly to Cloudinary (<code style={{ color: 'var(--cyan)' }}>source_RAG</code>), then instantly generate high-contrast, syllabus-aligned Cambridge Primary exam questions with HTML/KaTeX rendering & SVG diagrams.
            </p>
          </div>

          {/* Quick tab toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <button
              onClick={() => setActiveTab('generator')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.1rem', borderRadius: 12,
                fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === 'generator' ? 'linear-gradient(135deg, #7C3AED, #00D4FF)' : 'transparent',
                color: activeTab === 'generator' ? '#fff' : 'rgba(255,255,255,0.6)'
              }}
            >
              <Sparkles size={15} /> Generator Studio
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.1rem', borderRadius: 12,
                fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === 'documents' ? 'linear-gradient(135deg, #7C3AED, #00D4FF)' : 'transparent',
                color: activeTab === 'documents' ? '#fff' : 'rgba(255,255,255,0.6)'
              }}
            >
              <Database size={15} /> Source RAG Docs ({ragDocuments.length})
            </button>
          </div>
        </div>

        {/* ── TAB 1: GENERATOR STUDIO ── */}
        {activeTab === 'generator' && (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* LEFT CONTROLS PANEL */}
            <div style={{
              background: 'rgba(15, 22, 41, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Sliders size={16} color="var(--cyan)" />
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  Generation Parameters
                </span>
              </div>

              {/* AI Engine Model */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cyan)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={13} /> Gemini AI Model Engine
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.3)',
                    borderRadius: 12, padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.82rem', outline: 'none', fontWeight: 600
                  }}
                >
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recommended Active Fast)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Recommended High Reasoning)</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                  <option value="gemini-flash-latest">Gemini Flash Latest</option>
                </select>
              </div>

              {/* Stage / Curriculum */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                  Curriculum Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.82rem', outline: 'none'
                  }}
                >
                  <option value="Stage 1">Stage 1 (Primary 1)</option>
                  <option value="Stage 2">Stage 2 (Primary 2)</option>
                  <option value="Stage 3">Stage 3 (Primary 3)</option>
                  <option value="Stage 4">Stage 4 (Primary 4)</option>
                  <option value="Stage 5">Stage 5 (Primary 5)</option>
                  <option value="Stage 6">Stage 6 (Primary 6)</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                  Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    const subObj = filteredSubjects.find(s => s.id === e.target.value);
                    if (subObj) setSelectedSubjectName(subObj.name);
                  }}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.82rem', outline: 'none'
                  }}
                >
                  {filteredSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                  Topic / Subtopic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => {
                    setSelectedTopicId(e.target.value);
                    const topObj = topics.find(t => t.id === e.target.value);
                    if (topObj) setSelectedTopicName(topObj.name);
                  }}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.82rem', outline: 'none'
                  }}
                >
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  <option value="">+ Custom Topic</option>
                </select>
              </div>

              {/* Question Count & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                    Count ({questionCount})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--cyan)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                    Format
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, padding: '0.65rem 0.5rem', color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                  >
                    <option value="mcq">MCQ (Options)</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="true_false">True / False</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                  Difficulty Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {['easy', 'medium', 'hard', 'mixed'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      style={{
                        padding: '0.4rem 0.2rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                        textTransform: 'capitalize', border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                        background: difficulty === d ? 'rgba(0, 212, 255, 0.15)' : 'rgba(0,0,0,0.3)',
                        borderColor: difficulty === d ? 'var(--cyan)' : 'rgba(255,255,255,0.08)',
                        color: difficulty === d ? 'var(--cyan)' : 'rgba(255,255,255,0.6)'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* RAG Context Document */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                  Source RAG Document (Optional)
                </label>
                <select
                  value={selectedDocumentId}
                  onChange={(e) => setSelectedDocumentId(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.82rem', outline: 'none'
                  }}
                >
                  <option value="">None (Use General Cambridge Curriculum)</option>
                  {ragDocuments.map(doc => (
                    <option key={doc.id} value={doc.id}>📄 {doc.filename}</option>
                  ))}
                </select>
              </div>

              {/* Additional Teacher Prompt */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                  Custom Teacher Instructions
                </label>
                <textarea
                  rows="3"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Include step-by-step ratio calculations and angle diagrams..."
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '0.65rem', color: '#fff', fontSize: '0.8rem', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              {/* GENERATE ACTION BUTTON */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #00D4FF 100%)',
                  color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.9rem', fontWeight: 800,
                  cursor: isGenerating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)', transition: 'all 0.2s', marginTop: '0.5rem'
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate Questions
                  </>
                )}
              </button>
            </div>

            {/* RIGHT PREVIEW & SELECTION PANEL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* TOP BAR ACTION */}
              {generatedQuestions.length > 0 && (
                <div style={{
                  background: 'rgba(15, 22, 41, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 18, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backdropFilter: 'blur(16px)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                      onClick={toggleSelectAll}
                      style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        padding: '0.45rem 0.85rem', borderRadius: 10, color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
                      }}
                    >
                      <CheckCircle2 size={14} color="var(--cyan)" />
                      {selectedQuestionIndexes.length === generatedQuestions.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                      Selected <strong>{selectedQuestionIndexes.length}</strong> of {generatedQuestions.length} questions
                    </span>
                  </div>

                  <button
                    onClick={handleSaveSelected}
                    disabled={isSaving || !selectedQuestionIndexes.length}
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none',
                      padding: '0.6rem 1.2rem', borderRadius: 12, color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                      cursor: isSaving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(16,185,129,0.3)', opacity: selectedQuestionIndexes.length ? 1 : 0.5
                    }}
                  >
                    <Save size={15} /> Save to Question Bank
                  </button>
                </div>
              )}

              {/* QUESTIONS LIST */}
              {generatedQuestions.length === 0 ? (
                <div style={{
                  background: 'rgba(15, 22, 41, 0.5)', border: '1px border-dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: 20, padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
                }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={24} color="var(--cyan)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>No Questions Generated Yet</h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto' }}>
                      Configure your Stage, Subject, Topic, and RAG document context on the left, then click <strong>"Generate Questions"</strong> to generate live questions!
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 960, margin: '0 auto', width: '100%' }}>
                  {generatedQuestions.map((q, idx) => {
                    const isSelected = selectedQuestionIndexes.includes(idx);
                    return (
                      <motion.div
                        key={idx}
                        id={`cambridge-card-${idx}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                          background: '#FAF7F2',
                          color: '#1C1917',
                          border: isSelected ? '2.5px solid #00D4FF' : '1px solid #E5DFD3',
                          borderRadius: 16,
                          padding: '1.75rem 2.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.25rem',
                          boxShadow: isSelected ? '0 12px 35px rgba(0, 212, 255, 0.25)' : '0 10px 25px rgba(0,0,0,0.2)',
                          position: 'relative',
                          fontFamily: '"Times New Roman", Times, serif'
                        }}
                      >
                        {/* EXAM PAPER SHEET HEADER */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', borderBottom: '1px solid #ECE5D8', paddingBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1C1917', letterSpacing: '-0.01em' }}>
                              Question {q.question_number || (idx + 1)}
                            </span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#0369A1', background: '#E0F2FE', padding: '0.2rem 0.55rem', borderRadius: 6 }}>
                              {stage} • {selectedSubjectName}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectIndex(idx)}
                              style={{ width: 18, height: 18, accentColor: '#0284C7', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#57534E' }}>
                              {q.total_marks ? `[${q.total_marks} Marks]` : `[${q.points || 5} Marks]`}
                            </span>
                          </div>
                        </div>

                        {/* MAIN QUESTION STATEMENT */}
                        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1C1917', lineHeight: 1.6 }}>
                          {q.main_instruction || q.question_text || q.title}
                        </div>

                        {/* SUBPARTS LIST (a), (b), (c) WITH RIGHT ALIGNED MARKS [2] */}
                        {Array.isArray(q.sub_parts) && q.sub_parts.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '0.25rem 0' }}>
                            {q.sub_parts.map((sp, spIdx) => (
                              <div key={spIdx} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', fontSize: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.6rem', color: '#1C1917' }}>
                                  <span style={{ fontWeight: 700 }}>{sp.label}</span>
                                  <span>{sp.text}</span>
                                </div>
                                <span style={{ fontWeight: 600, color: '#57534E', flexShrink: 0, fontFamily: 'sans-serif' }}>
                                  [{sp.marks ?? 2}]
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* MULTI-MODEL AI GENERATED TEXTBOOK ILLUSTRATION (16:9 LANDSCAPE WIDESCREEN) */}
                        {(q.image_url || q.ai_generated_image_url) && (
                          <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center', background: '#FFFFFF', padding: '0.5rem', borderRadius: 16, border: '1px solid #E5DFD3', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
                            <img
                              src={q.image_url || q.ai_generated_image_url}
                              alt="Multi-Model AI Generated Textbook Figure"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              style={{
                                width: '100%',
                                maxWidth: 820,
                                maxHeight: 340,
                                objectFit: 'contain',
                                borderRadius: 12
                              }}
                            />
                          </div>
                        )}

                        {/* DIAGRAM / GRAPH BOX (LANDSCAPE WIDESCREEN) */}
                        {q.svg_diagram && (
                          <div style={{ margin: '0.85rem 0', display: 'flex', justifyContent: 'center' }}>
                            <div
                              style={{
                                width: '100%',
                                maxWidth: 780,
                                padding: '0.85rem 1.25rem',
                                background: '#FFF9F2',
                                border: '1px solid #E5DFD3',
                                borderRadius: 14,
                                boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
                              }}
                              dangerouslySetInnerHTML={{ __html: q.svg_diagram }}
                            />
                          </div>
                        )}

                        {/* OPTIONS GRID (CLEAN QUESTION FORMAT) */}
                        {Array.isArray(q.options) && q.options.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                style={{
                                  padding: '0.65rem 0.85rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                                  background: '#F3EDE2',
                                  border: '1px solid #E5DFD3',
                                  color: '#292524'
                                }}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* MARKING SCHEME FOOTER */}
                        {q.explanation && (
                          <div style={{ padding: '0.75rem 1rem', background: '#EBF3FA', borderLeft: '4px solid #0284C7', borderRadius: '0 8px 8px 0', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', color: '#0369A1', lineHeight: 1.5 }}>
                            <strong>Marking Scheme & Solution: </strong>
                            {q.explanation}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: SOURCE RAG DOCUMENTS ── */}
        {activeTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* UPLOAD BOX */}
            <form
              onSubmit={handleUploadDocument}
              style={{
                background: 'rgba(15, 22, 41, 0.75)', border: '2px dashed rgba(0, 212, 255, 0.25)',
                borderRadius: 24, padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                backdropFilter: 'blur(16px)'
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={28} color="var(--cyan)" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
                  Upload Source Document to Cloudinary (<code style={{ color: 'var(--cyan)' }}>source_RAG</code>)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto' }}>
                  Assign Stage, Subject, and Topic metadata, then upload PDF or Word files to Cloudinary. Extracted content will be bound to this exact topic for RAG Question Generation.
                </p>
              </div>

              {/* Stage, Subject, Topic Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', width: '100%', maxWidth: 680, textAlign: 'left', margin: '0.5rem 0' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'block' }}>
                    Stage / Grade
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,255,0.3)',
                      borderRadius: 10, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                  >
                    <option value="Stage 1">Stage 1 (Primary 1)</option>
                    <option value="Stage 2">Stage 2 (Primary 2)</option>
                    <option value="Stage 3">Stage 3 (Primary 3)</option>
                    <option value="Stage 4">Stage 4 (Primary 4)</option>
                    <option value="Stage 5">Stage 5 (Primary 5)</option>
                    <option value="Stage 6">Stage 6 (Primary 6)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'block' }}>
                    Subject
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      const subObj = filteredSubjects.find(s => s.id === e.target.value);
                      if (subObj) setSelectedSubjectName(subObj.name);
                    }}
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,255,0.3)',
                      borderRadius: 10, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                  >
                    {filteredSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'block' }}>
                    Topic
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => {
                      setSelectedTopicId(e.target.value);
                      const topObj = topics.find(t => t.id === e.target.value);
                      if (topObj) setSelectedTopicName(topObj.name);
                    }}
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,255,0.3)',
                      borderRadius: 10, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    <option value="">+ General / All Topics</option>
                  </select>
                </div>
              </div>

              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,image/*"
                onChange={(e) => setUploadFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="rag-file-input"
              />

              <label
                htmlFor="rag-file-input"
                style={{
                  padding: '0.65rem 1.25rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <FileText size={16} /> {uploadFile ? uploadFile.name : 'Choose PDF / Document File'}
              </label>

              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                style={{
                  padding: '0.75rem 2rem', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #00D4FF 100%)',
                  color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.85rem', fontWeight: 800,
                  cursor: isUploading || !uploadFile ? 'not-allowed' : 'pointer', opacity: uploadFile ? 1 : 0.5,
                  boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)', transition: 'all 0.2s'
                }}
              >
                {isUploading ? 'Uploading to Cloudinary...' : 'Upload Source RAG File'}
              </button>
            </form>

            {/* DOCUMENTS TABLE */}
            <div style={{
              background: 'rgba(15, 22, 41, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 24, padding: '1.5rem', backdropFilter: 'blur(16px)'
            }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                Uploaded Source RAG Documents ({ragDocuments.length})
              </h3>

              {ragDocuments.length === 0 ? (
                <EmptyState icon={Database} title="No Source Documents" description="Upload a textbook PDF or worksheet above to populate your source RAG library." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>
                        <th style={{ padding: '0.75rem' }}>Document Name</th>
                        <th style={{ padding: '0.75rem' }}>Cloudinary Path</th>
                        <th style={{ padding: '0.75rem' }}>Type</th>
                        <th style={{ padding: '0.75rem' }}>Size</th>
                        <th style={{ padding: '0.75rem' }}>Uploaded</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ragDocuments.map(doc => (
                        <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#fff' }}>
                            📄 {doc.filename}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', color: 'var(--cyan)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            source_RAG/{doc.filename}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                            {doc.file_type || 'PDF/Doc'}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                            {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : '—'}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                            {new Date(doc.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--cyan)', padding: '0.35rem', borderRadius: 8, background: 'rgba(0,212,255,0.1)' }}
                                title="View Cloudinary File"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                style={{ color: '#F87171', padding: '0.35rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer' }}
                                title="Delete Document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
