const db = require('../../config/db');

exports.getTree = async (req, res) => {
  try {
    const [currRes, classRes, subRes, topicRes] = await Promise.all([
      db.query("SELECT id, name, description FROM curriculums ORDER BY name"),
      db.query("SELECT id, curriculum_id, name, description, order_index FROM public.classes ORDER BY order_index, name"),
      db.query("SELECT id, class_id, name, description, order_index FROM public.subjects ORDER BY order_index, name"),
      db.query("SELECT id, subject_id, parent_topic_id, name, description, order_index, (SELECT COUNT(*)::int FROM content c WHERE c.topic_id = topics.id) AS resource_count FROM public.topics ORDER BY order_index, name")
    ]);

    const curriculums = currRes.rows;
    const classes = classRes.rows;
    const subjects = subRes.rows;
    const topics = topicRes.rows;

    // 1. Group topics by parent_topic_id and subject_id
    const topicMap = {};
    topics.forEach(t => {
      topicMap[t.id] = { ...t, children: [] };
    });

    const rootTopicsBySubject = {};
    topics.forEach(t => {
      const topicObj = topicMap[t.id];
      if (t.parent_topic_id) {
        const parent = topicMap[t.parent_topic_id];
        if (parent) {
          parent.children.push(topicObj);
        }
      } else {
        if (!rootTopicsBySubject[t.subject_id]) {
          rootTopicsBySubject[t.subject_id] = [];
        }
        rootTopicsBySubject[t.subject_id].push(topicObj);
      }
    });

    // Recursively sort children of root topics
    const sortChildren = (tNode) => {
      tNode.children.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      tNode.children.forEach(sortChildren);
    };

    Object.values(topicMap).forEach(tNode => {
      if (!tNode.parent_topic_id) {
        sortChildren(tNode);
      }
    });

    // 2. Group subjects by class_id
    const subjectsByClass = {};
    subjects.forEach(s => {
      if (!subjectsByClass[s.class_id]) {
        subjectsByClass[s.class_id] = [];
      }
      const rootTopics = rootTopicsBySubject[s.id] ?? [];
      rootTopics.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      subjectsByClass[s.class_id].push({
        ...s,
        topics: rootTopics
      });
    });

    // 3. Group classes by curriculum_id
    const classesByCurriculum = {};
    classes.forEach(c => {
      if (!classesByCurriculum[c.curriculum_id]) {
        classesByCurriculum[c.curriculum_id] = [];
      }
      classesByCurriculum[c.curriculum_id].push({
        ...c,
        subjects: subjectsByClass[c.id] ?? []
      });
    });

    // 4. Construct final curriculums list with nested classes
    const hierarchy = curriculums.map(curr => ({
      ...curr,
      classes: classesByCurriculum[curr.id] ?? []
    }));

    res.json({ success: true, data: hierarchy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
