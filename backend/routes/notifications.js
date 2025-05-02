const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} = require('../controllers/notifications');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('admin', 'enterprise_admin'), createNotification);

router.route('/unread/count').get(protect, getUnreadCount);
router.route('/read-all').put(protect, markAllAsRead);
router.route('/:id/read').put(protect, markAsRead);
router.route('/:id').delete(protect, deleteNotification);

module.exports = router;
