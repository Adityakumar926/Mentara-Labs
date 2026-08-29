import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, ChevronDown, Square, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Skeleton, EmptyState } from '@/components/ui';
import { studentApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function TopicsPage() {
  const { curriculumId, subjectId } = useParams();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  // Fetch topics and progress summary
  const fetchData = () => {
    setLoading(true);
    Promise.all([
      studentApi.getSubjectTopics(subjectId),
      studentApi.getProgressSummary()
    ])
      .then(([topicsRes, summaryRes]) => {
        setTopics(topicsRes.data.data || []);
        setSummary(summaryRes.data.data || null);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Failed to load subject topics');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  // Handle manual topic completion check/uncheck
  const handleToggleTopic = async (topicId, currentCompleted) => {
    try {
      await studentApi.trackResource({
        contentId: null, // this will track completed topic directly if contentId is null
        topicId: topicId,
        completed: !currentCompleted
      });
      toast.success(currentCompleted ? 'Topic marked incomplete' : 'Topic marked completed!');
      fetchData(); // refresh data
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  // Root topics are those without a parent_topic_id
  const rootTopics = topics.filter(t => !t.parent_topic_id);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

    .top-root {
      --navy:     var(--local-navy, #0A0E1A);
      --navy2:    var(--local-navy2, #0F1629);
      --violet:   #7C3AED;
      --violet-l: var(--local-violet-l, #9D6FEF);
      --cyan:     var(--local-cyan, #00D4FF);
      --cream:    var(--local-cream, #F5F0E8);
      --lavender: var(--local-lavender, #C4B5FD);
      --green:    var(--local-green, #10B981);
      --amber:    var(--local-amber, #F59E0B);
      --muted:    var(--local-muted, rgba(245,240,232,0.45));
      --card-bg:  var(--local-card-bg, rgba(255,255,255,0.04));
      --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.08));
      font-family: 'Inter', sans-serif;
      color: var(--cream);
    }

    .top-header {
      position: relative;
      background: linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(0,212,255,0.05) 100%);
      border: 2px solid var(--card-bdr);
      border-radius: 24px; padding: 1.5rem 1.75rem;
      overflow: hidden; backdrop-filter: blur(16px);
      margin-bottom: 1.5rem;
      display: flex; align-items: center; gap: 1rem;
    }

    .top-back-btn {
      width: 40px; height: 40px; border-radius: 14px;
      background: var(--local-card-bg);
      border: 2px solid var(--local-card-bdr);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--muted);
      transition: background 0.2s, color 0.2s, transform 0.2s;
      font-weight: 700;
    }
    .top-back-btn:hover {
      background: var(--color-surface-hover); color: var(--cream); transform: translateX(-2px);
    }

    .top-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.35rem; font-weight: 700;
      background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      line-height: 1.2;
    }

    /* Progress bar */
    .top-progress-container {
      background: var(--card-bg);
      border: 2px solid var(--card-bdr);
      border-radius: 18px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .top-progress-bar {
      height: 8px;
      background: var(--local-navy);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 0.5rem;
      border: 1px solid var(--local-card-bdr);
    }
    .top-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--violet) 0%, var(--cyan) 100%);
      border-radius: 4px;
      transition: width 0.4s ease;
    }

    /* Topic item */
    .top-parent-card {
      background: var(--card-bg);
      border: 2px solid var(--card-bdr);
      border-radius: 20px;
      padding: 1.1rem 1.25rem;
      margin-bottom: 0.65rem;
      transition: border-color 0.2s;
    }
    .top-parent-card:hover {
      border-color: var(--violet);
    }
    .top-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .top-check-btn {
      background: none; border: none; color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: color 0.2s;
    }
    .top-check-btn:hover { color: var(--violet); }
    .top-check-btn.completed { color: var(--local-green); }

    .top-name-section {
      flex: 1;
      cursor: pointer;
    }
    .top-name {
      font-weight: 700;
      font-size: 1.02rem;
      color: var(--cream);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .top-resource-count {
      display: inline-flex;
      align-items: center;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--cyan);
      background: rgba(0, 212, 255, 0.08);
      border: 2px solid rgba(0, 212, 255, 0.3);
      padding: 0.12rem 0.5rem;
      border-radius: 50px;
    }
    .top-desc {
      font-size: 0.78rem;
      color: var(--muted);
      margin-top: 2px;
      font-weight: 600;
    }

    /* Subtopics list */
    .subtop-list {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    
    .top-subtopic-row {
      background: var(--local-card-bg);
      border: 2px solid var(--local-card-bdr);
      border-radius: 14px;
      padding: 0.8rem 1rem;
      margin-top: 0.25rem;
      transition: border-color 0.2s, background 0.2s;
    }
    .top-subtopic-row:hover {
      border-color: var(--violet);
      background: var(--color-surface-hover);
    }
    
    .top-chevron {
      color: var(--muted);
      transition: transform 0.25s ease;
      cursor: pointer;
    }
    .top-chevron.open {
      transform: rotate(180deg);
    }
  `;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="top-root">
        {/* Header */}
        <div className="top-header">
          <button 
            className="top-back-btn" 
            onClick={() => {
              if (curriculumId) {
                navigate(`/courses/${curriculumId}/subjects`);
              } else {
                navigate('/courses');
              }
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div className="top-header-text">
            <h1 className="top-title">Select Topic</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Browse topics and subtopics inside this subject</p>
          </div>
        </div>

        {/* Progress Summary Card */}
        {summary && (
          <div className="top-progress-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Overall Progress</span>
              <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{summary.topic_percentage}% completed</span>
            </div>
            <div className="top-progress-bar">
              <div className="top-progress-fill" style={{ width: `${summary.topic_percentage}%` }} />
            </div>
          </div>
        )}

        {/* Topics List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} style={{ height: 90, borderRadius: 20 }} />
            ))}
          </div>
        ) : rootTopics.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No topics added yet"
            description="Contact your administrator to add learning topics for this subject."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rootTopics.map((rt) => (
              <StudentTopicNode
                key={rt.id}
                topic={rt}
                allTopics={topics}
                curriculumId={curriculumId}
                subjectId={subjectId}
                onToggleTopic={handleToggleTopic}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// ── Recursive Student Topic Node Component ─────────────────────────────────────
function StudentTopicNode({ topic, allTopics, curriculumId, subjectId, onToggleTopic }) {
  const [isOpen, setIsOpen] = useState(false);
  const childTopics = allTopics.filter(t => t.parent_topic_id === topic.id);
  const navigate = useNavigate();
  const isSub = !!topic.parent_topic_id;

  const rCount = Number(topic.resource_count || 0);
  const eCount = Number(topic.exam_count || 0);
  const total = rCount + eCount;

  return (
    <div className={isSub ? 'top-subtopic-row' : 'top-parent-card'} style={{ marginLeft: isSub ? '0.5rem' : '0' }}>
      <div className="top-item-row">
        <button 
          className={`top-check-btn ${topic.is_completed ? 'completed' : ''}`}
          onClick={() => onToggleTopic(topic.id, topic.is_completed)}
        >
          {topic.is_completed ? <CheckCircle2 size={18} /> : <Square size={18} />}
        </button>
        <div 
          className="top-name-section"
          onClick={() => {
            if (childTopics.length > 0) {
              setIsOpen(!isOpen);
            } else {
              navigate(`/topics/${topic.id}`);
            }
          }}
        >
          <div className="top-name">
            {topic.name}
            {(rCount > 0 || eCount > 0) && (
              <span className="top-resource-count">
                {total} resource{total !== 1 ? 's' : ''}
                {eCount > 0 && ` (${eCount} exam${eCount !== 1 ? 's' : ''})`}
              </span>
            )}
          </div>
          {topic.description && <div className="top-desc">{topic.description}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }} onClick={e => e.stopPropagation()}>
          <Link to={`/topics/${topic.id}`} style={{ color: 'var(--violet-l)' }} title="View Resources">
            <ChevronRight size={16} />
          </Link>
          {childTopics.length > 0 && (
            <ChevronDown 
              size={15} 
              className={`top-chevron ${isOpen ? 'open' : ''}`} 
              onClick={() => setIsOpen(!isOpen)} 
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && childTopics.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="subtop-list"
            style={{ borderLeft: '2px dashed var(--local-card-bdr)', paddingLeft: '0.25rem', overflow: 'hidden' }}
          >
            {childTopics.map(ct => (
              <StudentTopicNode
                key={ct.id}
                topic={ct}
                allTopics={allTopics}
                curriculumId={curriculumId}
                subjectId={subjectId}
                onToggleTopic={onToggleTopic}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
