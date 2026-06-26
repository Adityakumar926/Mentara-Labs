const db = require('../../config/db');

// Mark a resource (content) as completed
exports.trackResourceCompletion = async (req, res) => {
  try {
    const { contentId, topicId, completed } = req.body;

    // Support marking topics completed directly if no contentId is supplied
    if (!contentId && topicId) {
      const { rows } = await db.query(
        `INSERT INTO user_progress (user_id, topic_id, completed, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, topic_id)
         DO UPDATE SET completed = EXCLUDED.completed, updated_at = NOW()
         RETURNING *`,
        [req.user.id, topicId, completed === true]
      );
      return res.json({ success: true, data: rows[0], topic_completed: completed === true });
    }

    if (!contentId)
      return res.status(400).json({ success: false, message: 'contentId is required' });

    // Verify content exists
    const { rows: contentRows } = await db.query('SELECT topic_id FROM content WHERE id = $1', [contentId]);
    if (!contentRows[0])
      return res.status(404).json({ success: false, message: 'Content not found' });

    const contentTopicId = contentRows[0].topic_id;

    // Upsert user_progress for resource
    const { rows } = await db.query(
      `INSERT INTO user_progress (user_id, content_id, topic_id, completed, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, content_id)
       DO UPDATE SET completed = EXCLUDED.completed, updated_at = NOW()
       RETURNING *`,
      [req.user.id, contentId, contentTopicId, completed === true]
    );

    // Check if all resources under this topic are completed
    const { rows: progressCount } = await db.query(
      `SELECT 
         (SELECT COUNT(*) FROM content WHERE topic_id = $1) AS total_resources,
         (SELECT COUNT(*) FROM user_progress up 
          JOIN content c ON c.id = up.content_id 
          WHERE c.topic_id = $1 AND up.user_id = $2 AND up.completed = true) AS completed_resources`,
      [contentTopicId, req.user.id]
    );

    const total = parseInt(progressCount[0].total_resources || 0);
    const completedCount = parseInt(progressCount[0].completed_resources || 0);
    const allCompleted = total > 0 && total === completedCount;

    // Upsert topic progress
    await db.query(
      `INSERT INTO user_progress (user_id, topic_id, completed, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, topic_id)
       DO UPDATE SET completed = EXCLUDED.completed, updated_at = NOW()`,
      [req.user.id, contentTopicId, allCompleted]
    );

    res.json({ success: true, data: rows[0], topic_completed: allCompleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Track video watch progress
exports.trackVideoProgress = async (req, res) => {
  try {
    const { contentId, progress, completed } = req.body;
    if (!contentId)
      return res.status(400).json({ success: false, message: 'contentId is required' });

    // Verify content exists
    const { rows: contentRows } = await db.query('SELECT topic_id FROM content WHERE id = $1', [contentId]);
    if (!contentRows[0])
      return res.status(404).json({ success: false, message: 'Content not found' });

    const topicId = contentRows[0].topic_id;

    // Upsert user_progress for video progress
    const { rows } = await db.query(
      `INSERT INTO user_progress (user_id, content_id, topic_id, video_progress, completed, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id, content_id)
       DO UPDATE SET video_progress = EXCLUDED.video_progress,
                     completed = CASE WHEN EXCLUDED.completed = true THEN true ELSE user_progress.completed END,
                     updated_at = NOW()
       RETURNING *`,
      [req.user.id, contentId, topicId, progress || 0, completed === true]
    );

    // Recheck topic completion if video was completed
    if (completed === true) {
      const { rows: progressCount } = await db.query(
        `SELECT 
           (SELECT COUNT(*) FROM content WHERE topic_id = $1) AS total_resources,
           (SELECT COUNT(*) FROM user_progress up 
            JOIN content c ON c.id = up.content_id 
            WHERE c.topic_id = $1 AND up.user_id = $2 AND up.completed = true) AS completed_resources`,
        [topicId, req.user.id]
      );

      const total = parseInt(progressCount[0].total_resources || 0);
      const completedCount = parseInt(progressCount[0].completed_resources || 0);
      const allCompleted = total > 0 && total === completedCount;

      await db.query(
        `INSERT INTO user_progress (user_id, topic_id, completed, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, topic_id)
         DO UPDATE SET completed = EXCLUDED.completed, updated_at = NOW()`,
        [req.user.id, topicId, allCompleted]
      );
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get student class completion percentage summary
exports.getProgressSummary = async (req, res) => {
  try {
    if (!req.user.class_id) {
      return res.json({
        success: true,
        data: { total_topics: 0, total_resources: 0, completed_topics: 0, completed_resources: 0, topic_percentage: 0, resource_percentage: 0 }
      });
    }

    // Get total topics and resources in student's class
    const { rows: totals } = await db.query(
      `SELECT 
         (SELECT COUNT(*) FROM topics t 
          JOIN subjects s ON s.id = t.subject_id 
          WHERE s.class_id = $1) AS total_topics,
         (SELECT COUNT(*) FROM content c 
          JOIN topics t ON t.id = c.topic_id 
          JOIN subjects s ON s.id = t.subject_id 
          WHERE s.class_id = $1) AS total_resources`,
      [req.user.class_id]
    );

    // Get completed counts
    const { rows: completed } = await db.query(
      `SELECT 
         (SELECT COUNT(DISTINCT up.topic_id) FROM user_progress up 
          JOIN topics t ON t.id = up.topic_id
          JOIN subjects s ON s.id = t.subject_id
          WHERE up.user_id = $1 AND s.class_id = $2 AND up.completed = true) AS completed_topics,
         (SELECT COUNT(DISTINCT up.content_id) FROM user_progress up 
          JOIN content c ON c.id = up.content_id
          JOIN topics t ON t.id = c.topic_id
          JOIN subjects s ON s.id = t.subject_id
          WHERE up.user_id = $1 AND s.class_id = $2 AND up.completed = true) AS completed_resources`,
      [req.user.id, req.user.class_id]
    );

    const totalTopics = parseInt(totals[0].total_topics || 0);
    const totalResources = parseInt(totals[0].total_resources || 0);
    const completedTopics = parseInt(completed[0].completed_topics || 0);
    const completedResources = parseInt(completed[0].completed_resources || 0);

    const topicPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const resourcePercentage = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

    res.json({
      success: true,
      data: {
        total_topics: totalTopics,
        total_resources: totalResources,
        completed_topics: completedTopics,
        completed_resources: completedResources,
        topic_percentage: topicPercentage,
        resource_percentage: resourcePercentage
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
