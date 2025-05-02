const express = require('express');
const {
  getSettings,
  updateSettings,
  uploadLogo,
  uploadFavicon,
  uploadBanner
} = require('../controllers/settings');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public route to get settings
router.route('/').get(getSettings);

// Protected routes for admin/enterprise_admin
router.route('/')
  .put(protect, authorize('admin', 'enterprise_admin'), updateSettings);

router.route('/logo')
  .put(protect, authorize('admin', 'enterprise_admin'), uploadLogo);

router.route('/favicon')
  .put(protect, authorize('admin', 'enterprise_admin'), uploadFavicon);

router.route('/banner')
  .put(protect, authorize('admin', 'enterprise_admin'), uploadBanner);

module.exports = router;
