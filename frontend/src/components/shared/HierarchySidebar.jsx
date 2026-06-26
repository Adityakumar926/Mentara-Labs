import { useState, useMemo } from 'react';
import { BookOpen, Folder, FolderOpen, Layers, ChevronDown, ChevronRight, Book, HelpCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const CSS = `
  .hs-root {
    width: 250px;
    background: rgba(255, 255, 255, 0.015);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    font-family: 'Inter', sans-serif;
    user-select: none;
    flex-shrink: 0;
  }
  .hs-root::-webkit-scrollbar { width: 4px; }
  .hs-root::-webkit-scrollbar-track { background: transparent; }
  .hs-root::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 2px; }
  
  .hs-header {
    padding: 1.15rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .hs-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: rgba(245, 240, 232, 0.5);
  }
  .hs-content {
    padding: 0.75rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .hs-item {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.65rem;
    border-radius: 10px;
    font-size: 0.76rem;
    font-weight: 500;
    color: rgba(245, 240, 232, 0.55);
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }
  .hs-item:hover {
    color: rgba(245, 240, 232, 0.9);
    background: rgba(255, 255, 255, 0.03);
  }
  .hs-item.active {
    color: #fff;
    background: rgba(124, 58, 237, 0.12);
    border-color: rgba(124, 58, 237, 0.22);
  }
  .hs-item.active .hs-icon {
    color: #C4B5FD;
  }
  .hs-icon {
    color: rgba(245, 240, 232, 0.35);
    flex-shrink: 0;
    transition: color 0.2s;
  }
  .hs-chevron {
    color: rgba(245, 240, 232, 0.25);
    flex-shrink: 0;
    cursor: pointer;
    padding: 2px;
    border-radius: 4px;
  }
  .hs-chevron:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--cream);
  }
  .hs-nested {
    padding-left: 0.65rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    border-left: 1px dashed rgba(255, 255, 255, 0.04);
    margin-left: 0.45rem;
  }
  .hs-all-btn {
    margin-bottom: 0.5rem;
  }
`;

export default function HierarchySidebar({ onSelectNode, selectedNodeId, selectedNodeType }) {
  const { data: hierarchy, loading } = useApi(adminApi.getHierarchy);
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleExpand = (nodeId, e) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const selectNode = (node, type, pathIds, pathNames) => {
    onSelectNode({
      id: node.id,
      name: node.name,
      type,
      pathIds,
      pathNames
    });
  };

  // Render recursive topic node
  const renderTopicNode = (topic, subjectPathIds, subjectPathNames, depth = 0) => {
    const nodeId = `topic-${topic.id}`;
    const isExpanded = !!expandedNodes[nodeId];
    const hasChildren = topic.children && topic.children.length > 0;
    
    const pathIds = { ...subjectPathIds, topic_id: topic.id };
    const pathNames = [...subjectPathNames, topic.name];
    const isActive = selectedNodeId === topic.id && selectedNodeType === 'topic';

    return (
      <div key={topic.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div 
          className={clsx('hs-item', isActive && 'active')}
          onClick={() => selectNode(topic, 'topic', pathIds, pathNames)}
        >
          {hasChildren ? (
            <span onClick={(e) => toggleExpand(nodeId, e)} style={{ display: 'flex', alignItems: 'center' }}>
              {isExpanded ? <ChevronDown size={11} className="hs-chevron" /> : <ChevronRight size={11} className="hs-chevron" />}
            </span>
          ) : (
            <span style={{ width: 11 }} />
          )}
          {isExpanded ? <FolderOpen size={13} className="hs-icon" /> : <Folder size={13} className="hs-icon" />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {topic.name}
          </span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="hs-nested">
            {topic.children.map(child => renderTopicNode(child, subjectPathIds, subjectPathNames, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="hs-root">
        <style>{CSS}</style>
        <div className="hs-header">
          <div className="hs-title">Curriculum</div>
        </div>
        <div className="hs-content" style={{ gap: '0.45rem' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="ui-skeleton" style={{ height: 26, borderRadius: 10, width: i % 2 === 0 ? '70%' : '85%' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hs-root">
      <style>{CSS}</style>
      <div className="hs-header">
        <BookOpen size={14} className="hs-icon" style={{ color: 'var(--ui-violet-l)' }} />
        <span className="hs-title">Curriculum folders</span>
      </div>
      <div className="hs-content">
        {/* "All" button to clear filters */}
        <div 
          className={clsx('hs-item hs-all-btn', !selectedNodeId && 'active')}
          onClick={() => onSelectNode(null)}
        >
          <Book size={13} className="hs-icon" />
          <span>All Subjects</span>
        </div>

        {/* Curriculums */}
        {(hierarchy ?? []).map(curr => {
          const currNodeId = `curr-${curr.id}`;
          const isCurrExpanded = !!expandedNodes[currNodeId];
          const hasClasses = curr.classes && curr.classes.length > 0;
          const isCurrActive = selectedNodeId === curr.id && selectedNodeType === 'curriculum';

          return (
            <div key={curr.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div 
                className={clsx('hs-item', isCurrActive && 'active')}
                onClick={() => selectNode(curr, 'curriculum', { curriculum_id: curr.id }, [curr.name])}
              >
                {hasClasses ? (
                  <span onClick={(e) => toggleExpand(currNodeId, e)} style={{ display: 'flex', alignItems: 'center' }}>
                    {isCurrExpanded ? <ChevronDown size={11} className="hs-chevron" /> : <ChevronRight size={11} className="hs-chevron" />}
                  </span>
                ) : (
                  <span style={{ width: 11 }} />
                )}
                <BookOpen size={13} className="hs-icon" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: 600 }}>
                  {curr.name}
                </span>
              </div>

              {hasClasses && isCurrExpanded && (
                <div className="hs-nested">
                  {curr.classes.map(cls => {
                    const classNodeId = `class-${cls.id}`;
                    const isClassExpanded = !!expandedNodes[classNodeId];
                    const hasSubjects = cls.subjects && cls.subjects.length > 0;
                    
                    const classPathIds = { curriculum_id: curr.id, class_id: cls.id };
                    const classPathNames = [curr.name, cls.name];
                    const isClassActive = selectedNodeId === cls.id && selectedNodeType === 'class';

                    return (
                      <div key={cls.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div 
                          className={clsx('hs-item', isClassActive && 'active')}
                          onClick={() => selectNode(cls, 'class', classPathIds, classPathNames)}
                        >
                          {hasSubjects ? (
                            <span onClick={(e) => toggleExpand(classNodeId, e)} style={{ display: 'flex', alignItems: 'center' }}>
                              {isClassExpanded ? <ChevronDown size={11} className="hs-chevron" /> : <ChevronRight size={11} className="hs-chevron" />}
                            </span>
                          ) : (
                            <span style={{ width: 11 }} />
                          )}
                          <Layers size={13} className="hs-icon" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {cls.name}
                          </span>
                        </div>

                        {hasSubjects && isClassExpanded && (
                          <div className="hs-nested">
                            {cls.subjects.map(subj => {
                              const subjNodeId = `subj-${subj.id}`;
                              const isSubjExpanded = !!expandedNodes[subjNodeId];
                              const hasTopics = subj.topics && subj.topics.length > 0;
                              
                              const subjPathIds = { curriculum_id: curr.id, class_id: cls.id, subject_id: subj.id };
                              const subjPathNames = [curr.name, cls.name, subj.name];
                              const isSubjActive = selectedNodeId === subj.id && selectedNodeType === 'subject';

                              return (
                                <div key={subj.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div 
                                    className={clsx('hs-item', isSubjActive && 'active')}
                                    onClick={() => selectNode(subj, 'subject', subjPathIds, subjPathNames)}
                                  >
                                    {hasTopics ? (
                                      <span onClick={(e) => toggleExpand(subjNodeId, e)} style={{ display: 'flex', alignItems: 'center' }}>
                                        {isSubjExpanded ? <ChevronDown size={11} className="hs-chevron" /> : <ChevronRight size={11} className="hs-chevron" />}
                                      </span>
                                    ) : (
                                      <span style={{ width: 11 }} />
                                    )}
                                    <Book size={13} className="hs-icon" />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                      {subj.name}
                                    </span>
                                  </div>

                                  {hasTopics && isSubjExpanded && (
                                    <div className="hs-nested">
                                      {subj.topics.map(topic => renderTopicNode(topic, subjPathIds, subjPathNames))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
