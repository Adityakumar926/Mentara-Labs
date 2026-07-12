import { useState, useMemo, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import { PageWrapper, Skeleton } from '@/components/ui';
import { BookOpen, Layers, Book, FileText, Image as ImageIcon, Video, HelpCircle } from 'lucide-react';
import HierarchySidebar from '@/components/shared/HierarchySidebar';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import axios from 'axios';

const CSS = `
  .om-root {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--navy, #09090b);
    color: var(--cream, #f4f4f5);
    font-family: 'Inter', sans-serif;
  }

  .om-main-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 2.5rem;
  }

  .om-header {
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, transparent 100%);
    border: 1px solid var(--local-card-bdr, rgba(255,255,255,0.06));
    border-radius: 28px;
    padding: 2rem 2.5rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(16px);
  }
  html.light .om-header, .light .om-header {
    background: #FFFFFF;
    border-color: #CBD5E1;
  }

  .om-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
  }
  html.light .om-title, .light .om-title {
    color: #0F172A;
  }
  .om-subtitle {
    font-size: 0.85rem;
    color: var(--local-muted, #71717a);
    margin-top: 0.35rem;
  }
  html.light .om-subtitle, .light .om-subtitle {
    color: #475569;
  }

  /* LIST GRID */
  .om-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }

  .om-card {
    background: var(--local-card-bg, rgba(255,255,255,0.015));
    border: 1px solid var(--local-card-bdr, rgba(255,255,255,0.06));
    border-radius: 20px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.25s ease;
  }
  .om-card:hover {
    border-color: rgba(124, 58, 237, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
  html.light .om-card, .light .om-card {
    background: #FFFFFF;
    border-color: #CBD5E1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  .om-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 0.5rem;
  }
  html.light .om-card-header, .light .om-card-header {
    border-bottom-color: #F1F5F9;
  }

  .om-card-title {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--cream, #f4f4f5);
  }
  html.light .om-card-title, .light .om-card-title {
    color: #0F172A;
  }

  .om-badge {
    padding: 0.2rem 0.55rem;
    font-size: 0.65rem;
    font-weight: 700;
    border-radius: 50px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .om-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    font-size: 0.76rem;
    color: var(--local-muted, #71717a);
  }
  html.light .om-card-body, .light .om-card-body {
    color: #475569;
  }

  .om-stat-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .om-icon {
    width: 14px;
    height: 14px;
    color: var(--local-lavender, #C4B5FD);
  }
  html.light .om-icon, .light .om-icon {
    color: #4F46E5;
  }

  .om-crumb {
    font-size: 0.68rem;
    color: var(--local-lavender, #C4B5FD);
    opacity: 0.85;
  }
  html.light .om-crumb, .light .om-crumb {
    color: #4F46E5;
  }

  /* SEARCH & FILTER CONTROLS */
  .om-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  .om-tab-btn {
    padding: 0.5rem 1rem;
    border-radius: 12px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--local-card-bdr, rgba(255,255,255,0.06));
    background: transparent;
    color: var(--local-muted, #71717a);
    transition: all 0.2s;
  }
  .om-tab-btn.active {
    background: linear-gradient(135deg, rgba(124,58,237,0.35), rgba(124,58,237,0.18));
    color: var(--local-lavender, #C4B5FD);
    border-color: rgba(124,58,237,0.3);
  }
  html.light .om-tab-btn, .light .om-tab-btn {
    background: #FFFFFF;
    border-color: #CBD5E1;
    color: #475569;
  }
  html.light .om-tab-btn.active, .light .om-tab-btn.active {
    background: rgba(124, 58, 237, 0.08);
    color: #7C3AED;
    border-color: rgba(124, 58, 237, 0.25);
  }
`;

export default function MaterialsPage() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, worksheets, animations, videos, notes
  const [contentList, setContentList] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);

  const { data: hierarchy, loading: loadingHierarchy } = useApi(adminApi.getHierarchy);

  // Load all material items across topics by recursively scanning curriculum hierarchy
  useEffect(() => {
    if (!hierarchy) return;

    const fetchAllMaterials = async () => {
      setLoadingContent(true);
      const items = [];
      const topicIds = [];
      const topicToMeta = {};

      const traverse = (topics, currName, clsName, subjName) => {
        topics.forEach(t => {
          topicIds.push(t.id);
          topicToMeta[t.id] = { curriculum: currName, stage: clsName, subject: subjName, topic: t.name };
          if (t.children) traverse(t.children, currName, clsName, subjName);
        });
      };

      hierarchy.forEach(curr => {
        curr.classes.forEach(cls => {
          cls.subjects.forEach(subj => {
            traverse(subj.topics || [], curr.name, cls.name, subj.name);
          });
        });
      });

      try {
        const batchSize = 15;
        for (let i = 0; i < topicIds.length; i += batchSize) {
          const batch = topicIds.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(tid => adminApi.getSubjectContent(tid).catch(() => null))
          );

          results.forEach((res, index) => {
            const tid = batch[index];
            const meta = topicToMeta[tid];
            let contentItems = [];
            if (res) {
              contentItems = res.data?.data ?? res.data ?? [];
            }
            if (Array.isArray(contentItems)) {
              contentItems.forEach(item => {
                items.push({
                  id: `mat-${item.id}`,
                  realId: item.id,
                  name: item.title,
                  type: 'material',
                  subType: item.content_type, // note, video, animation, worksheet
                  premium: item.is_premium,
                  curriculum: meta.curriculum,
                  stage: meta.stage,
                  subject: meta.subject,
                  topic: meta.topic,
                  topicId: tid
                });
              });
            }
          });
        }
      } catch (err) {
        console.error('Failed to load topic resources:', err);
      }
      setContentList(items);
      setLoadingContent(false);
    };

    fetchAllMaterials();
  }, [hierarchy]);

  // Combine & Filter everything dynamically
  const structuredData = useMemo(() => {
    let list = [];

    // 1. Add Materials filtered by subType matching Tab filter
    const mats = contentList;
    if (activeTab === 'all') {
      list = [...list, ...mats];
    } else if (activeTab === 'worksheets') {
      list = [...list, ...mats.filter(m => m.subType === 'worksheet')];
    } else if (activeTab === 'animations') {
      list = [...list, ...mats.filter(m => m.subType === 'animation')];
    } else if (activeTab === 'videos') {
      list = [...list, ...mats.filter(m => m.subType === 'video')];
    } else if (activeTab === 'notes') {
      list = [...list, ...mats.filter(m => m.subType === 'note')];
    }

    // 2. Apply left folder tree navigator filters
    if (selectedNode) {
      list = list.filter(item => {
        if (selectedNode.type === 'curriculum') {
          return item.curriculum === selectedNode.name || item.curriculumId === selectedNode.id;
        }
        if (selectedNode.type === 'class') {
          return item.stage === selectedNode.name || item.classId === selectedNode.id;
        }
        if (selectedNode.type === 'subject') {
          return item.subject === selectedNode.name || item.subjectId === selectedNode.id;
        }
        if (selectedNode.type === 'topic') {
          return item.topicId === selectedNode.id;
        }
        return true;
      });
    }

    return list;
  }, [contentList, activeTab, selectedNode]);

  const totalLoading = loadingHierarchy || loadingContent;

  return (
    <PageWrapper className="p-0">
      <style>{CSS}</style>
      <div className="om-root">
        <HierarchySidebar
          selectedNodeId={selectedNode?.id}
          selectedNodeType={selectedNode?.type}
          onSelectNode={setSelectedNode}
        />

        <div className="om-main-content">
          {/* Header */}
          <div className="om-header">
            <h1 className="om-title">Uploaded Contents & Explorer</h1>
            <p className="om-subtitle">
              {selectedNode ? `Showing details under: ${selectedNode.pathNames ? selectedNode.pathNames.join(' > ') : selectedNode.name}` : 'Explore, navigate, and search all worksheets, videos, questions, and exams across the stage directories.'}
            </p>
          </div>

          {/* Tab Filters */}
          <div className="om-controls">
            <button className={clsx('om-tab-btn', activeTab === 'all' && 'active')} onClick={() => setActiveTab('all')}>
              All Content ({structuredData.length})
            </button>
            <button className={clsx('om-tab-btn', activeTab === 'worksheets' && 'active')} onClick={() => setActiveTab('worksheets')}>
              Worksheets
            </button>
            <button className={clsx('om-tab-btn', activeTab === 'animations' && 'active')} onClick={() => setActiveTab('animations')}>
              Animations
            </button>
            <button className={clsx('om-tab-btn', activeTab === 'videos' && 'active')} onClick={() => setActiveTab('videos')}>
              Videos
            </button>
            <button className={clsx('om-tab-btn', activeTab === 'notes' && 'active')} onClick={() => setActiveTab('notes')}>
              Notes
            </button>
          </div>

          {/* Grid display */}
          {totalLoading ? (
            <div className="om-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="om-card" style={{ height: 160 }}>
                  <Skeleton style={{ height: 16, width: '70%' }} />
                  <Skeleton style={{ height: 12, width: '40%', marginTop: 8 }} />
                  <Skeleton style={{ height: 12, width: '50%', marginTop: 4 }} />
                </div>
              ))}
            </div>
          ) : structuredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--local-muted, #71717a)' }}>
              <BookOpen size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>No items found</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Select another curriculum folder or upload new worksheets/questions under this branch.</p>
            </div>
          ) : (
            <div className="om-grid">
              {structuredData.map(item => (
                <div key={item.id} className="om-card">
                  <div className="om-card-header">
                    <span className="om-card-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                      {item.name}
                    </span>
                    <span className={clsx('om-badge', 
                      item.type === 'exam' && 'badge-success',
                      item.type === 'question' && 'badge-indigo',
                      item.type === 'material' && 'badge-premium'
                    )}>
                      {item.type} ({item.subType})
                    </span>
                  </div>
                  <div className="om-card-body">
                    <div className="om-crumb">
                      {item.curriculum} &gt; {item.stage} &gt; {item.subject}
                    </div>
                    <div className="om-stat-row" style={{ marginTop: '0.2rem' }}>
                      <Layers className="om-icon" />
                      <span>Topic: {item.topic}</span>
                    </div>
                    <div className="om-stat-row">
                      {item.subType === 'video' && <Video className="om-icon" />}
                      {item.subType === 'worksheet' && <ImageIcon className="om-icon" />}
                      {item.subType === 'note' && <FileText className="om-icon" />}
                      {item.type === 'question' && <HelpCircle className="om-icon" />}
                      <span>Access: {item.premium ? '⭐ Premium Only' : 'Free tier'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
