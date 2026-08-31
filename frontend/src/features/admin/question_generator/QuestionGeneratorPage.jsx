import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, Upload, FileText, CheckCircle2, AlertCircle, Trash2, 
  BookOpen, Layers, Sliders, Database, Save, Eye, RefreshCw, 
  Check, HelpCircle, FileCheck, ArrowRight, ExternalLink, Cpu, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Button, EmptyState } from '@/components/ui';
import { adminApi } from '@/api/services';
import { useApi, useMutation } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import html2canvas from 'html2canvas';

export default function QuestionGeneratorPage({ isSimpleMode = false }) {
  const location = useLocation();
  const hideAdvancedOptions = isSimpleMode || (location.pathname && (location.pathname.includes('/student/') || location.pathname === '/question-generator'));

  const [activeTab, setActiveTab] = useState('generator'); // 'generator', 'documents'
  
  // Controls state
  const [stage, setStage] = useState('Stage 2');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('Mathematics');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedTopicName, setSelectedTopicName] = useState('Counting & Sequences');
  const [difficulty, setDifficulty] = useState('mixed'); // 'easy', 'medium', 'hard', 'mixed'
  const [questionType, setQuestionType] = useState('fill_in_lines'); // 'mcq', 'short_answer', 'true_false', 'mixed'
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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' or 'list'

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
        strand: selectedTopicName,
        substrand: additionalInstructions || 'General Practice',
        topic: selectedTopicName,
        subtopic: additionalInstructions,
        count: parseInt(questionCount, 10),
        difficulty,
        format: questionType,
        question_type: questionType,
        additional_instructions: additionalInstructions,
        ai_model: aiModel
      });

      const rawData = res.data?.data ?? res.data;
      const qList = Array.isArray(rawData) ? rawData : (Array.isArray(res.data?.questions) ? res.data.questions : []);
      setGeneratedQuestions(qList);
      setCurrentCardIndex(0);
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

  // Handle Export to PDF
  const handleDownloadPdf = () => {
    const questionsToExport = generatedQuestions.filter((_, idx) => selectedQuestionIndexes.includes(idx));
    if (!questionsToExport.length) {
      return toast.error('Please select at least one question to export as PDF');
    }

    const totalMarks = questionsToExport.reduce((acc, q) => acc + (q.total_marks || (q.sub_parts ? q.sub_parts.length : 1)), 0);

    const questionsHtml = questionsToExport.map((q, idx) => {
      const subPartsHtml = (q.sub_parts || []).map(sp => `
        <div style="margin-top: 10px; font-size: 14px; line-height: 1.6;">
          <div style="font-weight: 600; display: flex; justify-content: space-between;">
            <span>${sp.label} ${sp.text}</span>
            <span style="font-weight: 700; color: #4b5563;">[${sp.marks || 1}]</span>
          </div>
          <div style="margin-top: 16px; margin-bottom: 20px; border-bottom: 2px dashed #9ca3af; height: 12px; width: 100%;"></div>
        </div>
      `).join('');

      return `
        <div style="margin-bottom: 24px; padding: 16px 20px; border: 1.5px solid #cbd5e1; border-radius: 12px; page-break-inside: avoid; background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">
            <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0;">Question ${idx + 1} (${q.title || 'Question'})</h3>
            <span style="font-size: 12px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 20px;">[ ${q.total_marks || 3} Marks ]</span>
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">
            ${q.main_instruction || ''}
          </div>
          ${q.svg_diagram ? `<div style="margin: 12px 0; text-align: center;">${q.svg_diagram}</div>` : ''}
          ${subPartsHtml}
        </div>
      `;
    }).join('');

    const solutionsHtml = questionsToExport.map((q, idx) => `
      <div style="margin-bottom: 14px; padding: 12px 16px; border-left: 4px solid #10b981; background: #f0fdf4; border-radius: 6px; page-break-inside: avoid;">
        <div style="font-weight: 800; font-size: 13px; color: #065f46; margin-bottom: 4px;">Question ${idx + 1} Marking Scheme & Solution:</div>
        <div style="font-size: 13px; color: #15803d; line-height: 1.5;">${q.explanation || 'See textbook solution.'}</div>
      </div>
    `).join('');

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cambridge Primary Exam - ${selectedSubjectName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; color: #0f172a; margin: 0; padding: 28px; background: #fff; }
          .header { text-align: center; border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #0f172a; margin: 0 0 6px 0; }
          .meta { font-size: 13px; font-weight: 600; color: #475569; display: flex; justify-content: center; gap: 20px; }
          .student-box { display: flex; justify-content: space-between; margin-top: 16px; font-size: 13px; font-weight: 700; border: 1px solid #cbd5e1; padding: 10px 16px; border-radius: 8px; background: #f8fafc; }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff; padding: 12px 20px; border-radius: 10px;">
          <span style="font-weight: 700; font-size: 14px;">📄 Cambridge Exam Worksheet - Ready to Save as PDF</span>
          <button onclick="window.print()" style="background: #10b981; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">Save as PDF / Print</button>
        </div>

        <div class="header">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 6px;">
            <img src="${window.location.origin}/mentara-new.png" alt="Mentara Labs Logo" style="height: 36px; width: 36px; object-fit: contain;" />
            <span style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">MENTARA LABS</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0284c7; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 14px;">CAMBRIDGE PRIMARY ASSESSMENT STUDIO</div>
          <div class="meta">
            <span><strong>Stage:</strong> ${stage}</span>
            <span><strong>Subject:</strong> ${selectedSubjectName}</span>
            <span><strong>Strand:</strong> ${selectedTopicName}</span>
          </div>
          <div class="student-box">
            <span>Student Name: __________________________</span>
            <span>Date: ____________</span>
            <span>Total Marks: [ ${totalMarks} ]</span>
          </div>
        </div>

        <div>
          ${questionsHtml}
        </div>

        <div style="page-break-before: always; margin-top: 30px;">
          <h2 style="font-size: 16px; font-weight: 800; border-bottom: 2px solid #10b981; padding-bottom: 6px; color: #065f46; margin-bottom: 16px;">Teacher Marking Scheme & Answer Key</h2>
          ${solutionsHtml}
        </div>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.print();
    }, 500);
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
    <PageWrapper title="Cambridge Primary Assessment Studio">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1400, margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* ── HEADER BANNER ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(0, 212, 255, 0.1) 50%, rgba(15, 23, 42, 0.8) 100%)',
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
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.25)',
              padding: '0.35rem 0.85rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700,
              color: 'var(--cyan)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem'
            }}>
              <img src="/mentara-new.png" alt="Mentara Labs Logo" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              <span>Mentara Labs • Cambridge Primary Curriculum Generator</span>
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              Cambridge Primary Assessment Studio
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(245, 240, 238, 0.65)', lineHeight: 1.6 }}>
              Select your Stage, Subject, Curriculum Strand & Sub-strand to instantly generate high-contrast, authentic Cambridge Primary exam questions with student fill-in answer lines, vector diagrams, and marking schemes.
            </p>
          </div>
        </div>

        {/* ── GENERATOR STUDIO ── */}
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
                Curriculum Parameters
              </span>
            </div>

            {/* AI Engine Model (Hidden in Student & Teacher simplified mode) */}
            {!hideAdvancedOptions && (
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
            )}

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
                value={selectedSubjectName}
                onChange={(e) => {
                  const name = e.target.value;
                  setSelectedSubjectName(name);
                  const subObj = filteredSubjects.find(s => s.name.toLowerCase() === name.toLowerCase());
                  if (subObj) setSelectedSubjectId(subObj.id);
                  // Update default topic based on subject
                  if (name.toLowerCase().includes('sci')) {
                    setSelectedTopicName('States of Matter');
                  } else if (name.toLowerCase().includes('eng')) {
                    setSelectedTopicName('Grammar & Vocabulary');
                  } else {
                    setSelectedTopicName('Counting & Sequences');
                  }
                }}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.82rem', outline: 'none'
                }}
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                {filteredSubjects.map(s => (
                  !['mathematics', 'science', 'english'].includes(s.name.toLowerCase()) && (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  )
                ))}
              </select>
            </div>

            {/* Topic / Strand */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                Curriculum Strand / Topic Name
              </label>
              {topics && topics.length > 0 && (
                <select
                  value={selectedTopicId}
                  onChange={(e) => {
                    setSelectedTopicId(e.target.value);
                    const topObj = topics.find(t => t.id === e.target.value);
                    if (topObj) setSelectedTopicName(topObj.name);
                  }}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.82rem', outline: 'none', marginBottom: '0.5rem'
                  }}
                >
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  <option value="">Custom Topic Input Below</option>
                </select>
              )}
              <input
                type="text"
                value={selectedTopicName}
                onChange={(e) => setSelectedTopicName(e.target.value)}
                placeholder="e.g. Counting & Sequences, States of Matter, Light & Shadows..."
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.82rem', outline: 'none'
                }}
              />
            </div>

            {/* Sub-strand / Subtopic */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>
                Sub-strand / Focus Skill (Optional)
              </label>
              <input
                type="text"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Carroll Diagrams, Equivalent Fractions..."
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.82rem', outline: 'none'
                }}
              />
            </div>

            {/* Question Count & Format */}
            <div style={{ display: 'grid', gridTemplateColumns: hideAdvancedOptions ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
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
              {!hideAdvancedOptions && (
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
                    <option value="fill_in_lines">Authentic Fill-in Lines (Paper Structure)</option>
                    <option value="mcq">MCQ (Options)</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              )}
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
              
              {/* TOP BAR ACTION & NOTEBOOKLM CAROUSEL TOGGLE */}
              {generatedQuestions.length > 0 && (
                <div style={{
                  background: 'rgba(15, 22, 41, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 18, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backdropFilter: 'blur(16px)', flexWrap: 'wrap', gap: '1rem'
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

                  {/* VIEW MODE TOGGLE BUTTONS (NotebookLM Carousel vs Full List) */}
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '0.25rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('carousel')}
                      style={{
                        padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
                        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                        background: viewMode === 'carousel' ? 'var(--cyan)' : 'transparent',
                        color: viewMode === 'carousel' ? '#000' : 'rgba(255,255,255,0.7)'
                      }}
                    >
                      🎴 Carousel View (1-by-1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      style={{
                        padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
                        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                        background: viewMode === 'list' ? 'var(--cyan)' : 'transparent',
                        color: viewMode === 'list' ? '#000' : 'rgba(255,255,255,0.7)'
                      }}
                    >
                      📜 List All
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={!selectedQuestionIndexes.length}
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none',
                        padding: '0.6rem 1.2rem', borderRadius: 12, color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(59,130,246,0.3)', opacity: selectedQuestionIndexes.length ? 1 : 0.5
                      }}
                    >
                      <Download size={15} /> Download PDF
                    </button>

                    {!hideAdvancedOptions && (
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
                    )}
                  </div>
                </div>
              )}

              {/* QUESTIONS DISPLAY AREA */}
              {generatedQuestions.length === 0 ? (
                <div style={{
                  background: 'rgba(15, 22, 41, 0.5)', border: '1px border-dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: 20, padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
                }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={24} color="var(--cyan)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>No Questions Generated Yet</h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto' }}>
                      Configure your Stage, Subject, Topic, and RAG document context on the left, then click <strong>"Generate Questions"</strong> to generate live questions!
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 960, margin: '0 auto', width: '100%' }}>
                  
                  {/* NOTEBOOKLM CAROUSEL NAVIGATION CONTROLS */}
                  {viewMode === 'carousel' && (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(15, 22, 41, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 16, padding: '0.85rem 1.5rem', backdropFilter: 'blur(12px)'
                    }}>
                      <button
                        type="button"
                        onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentCardIndex === 0}
                        style={{
                          background: currentCardIndex === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0, 212, 255, 0.15)',
                          border: '1px solid',
                          borderColor: currentCardIndex === 0 ? 'rgba(255,255,255,0.08)' : 'var(--cyan)',
                          color: currentCardIndex === 0 ? 'rgba(255,255,255,0.3)' : 'var(--cyan)',
                          padding: '0.5rem 1.1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700,
                          cursor: currentCardIndex === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        ◄ Previous Question
                      </button>

                      {/* PAGINATION DOTS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        {generatedQuestions.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setCurrentCardIndex(dotIdx)}
                            title={`Jump to Question ${dotIdx + 1}`}
                            style={{
                              width: currentCardIndex === dotIdx ? 24 : 10,
                              height: 10,
                              borderRadius: 10,
                              border: 'none',
                              background: currentCardIndex === dotIdx ? 'var(--cyan)' : 'rgba(255,255,255,0.2)',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentCardIndex(prev => Math.min(generatedQuestions.length - 1, prev + 1))}
                        disabled={currentCardIndex === generatedQuestions.length - 1}
                        style={{
                          background: currentCardIndex === generatedQuestions.length - 1 ? 'rgba(255,255,255,0.04)' : 'rgba(0, 212, 255, 0.15)',
                          border: '1px solid',
                          borderColor: currentCardIndex === generatedQuestions.length - 1 ? 'rgba(255,255,255,0.08)' : 'var(--cyan)',
                          color: currentCardIndex === generatedQuestions.length - 1 ? 'rgba(255,255,255,0.3)' : 'var(--cyan)',
                          padding: '0.5rem 1.1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700,
                          cursor: currentCardIndex === generatedQuestions.length - 1 ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        Next Question ►
                      </button>
                    </div>
                  )}

                  {/* CAROUSEL MODE vs LIST MODE CARDS */}
                  {(viewMode === 'carousel' ? [generatedQuestions[currentCardIndex]] : generatedQuestions).map((q, rawIdx) => {
                    const idx = viewMode === 'carousel' ? currentCardIndex : rawIdx;
                    if (!q) return null;
                    const isSelected = selectedQuestionIndexes.includes(idx);

                    return (
                      <motion.div
                        key={idx}
                        id={`cambridge-card-${idx}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
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

                        {/* SUBPARTS LIST (a), (b), (c) WITH AUTHENTIC SOURCE FILL-IN LINES AND MARKS [1] */}
                        {Array.isArray(q.sub_parts) && q.sub_parts.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '0.5rem 0' }}>
                            {q.sub_parts.map((sp, spIdx) => (
                              <div key={spIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', fontSize: '1.02rem' }}>
                                  <div style={{ display: 'flex', gap: '0.6rem', color: '#1C1917' }}>
                                    <span style={{ fontWeight: 700 }}>{sp.label}</span>
                                    <span>{sp.text}</span>
                                  </div>
                                  <span style={{ fontWeight: 600, color: '#57534E', flexShrink: 0, fontFamily: 'sans-serif' }}>
                                    [{sp.marks ?? 1}]
                                  </span>
                                </div>
                                {/* AUTHENTIC CAMBRIDGE WORKSHEET ANSWER FILL-IN LINE */}
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                                  <div style={{ width: '45%', borderBottom: '2px dotted #78716C', minHeight: '24px', position: 'relative' }}>
                                    <span style={{ position: 'absolute', right: 0, bottom: -18, fontSize: '0.7rem', color: '#A8A29E', fontFamily: 'monospace' }}>
                                      _______________________
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* CLOUDINARY SOURCE DOCUMENT ORIGINAL FIGURE */}
                        {(q.image_url || q.ai_generated_image_url) && (
                          <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', padding: '0.75rem', borderRadius: 16, border: '1px solid #E5DFD3', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4F46E5', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#EEF2FF', padding: '0.2rem 0.6rem', borderRadius: 20 }}>
                              📷 Original Source Document Figure (Cloudinary: source_RAG)
                            </div>
                            <img
                              src={q.image_url || q.ai_generated_image_url}
                              alt="Original Source Document Figure"
                              onError={(e) => {
                                console.warn('Cloudinary image preview fallback to SVG diagram');
                                e.target.parentElement.style.display = 'none';
                              }}
                              style={{
                                width: '100%',
                                maxWidth: 840,
                                maxHeight: 380,
                                objectFit: 'contain',
                                borderRadius: 12
                              }}
                            />
                          </div>
                        )}

                        {/* DIAGRAM / GRAPH BOX (CARROLL DIAGRAM VECTOR BACKUP) */}
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
        </div>
    </PageWrapper>
  );
}
