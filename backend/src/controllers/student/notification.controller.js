const Notification = require('../../models/Notification');

exports.getAll = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const notifications = await Notification.findByStudent(req.user.id, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    const unread_count = await Notification.unreadCount(req.user.id);
    res.json({ success: true, data: { notifications, unread_count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.markRead(req.params.id, req.user.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.markAllRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};