const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/stats').get(protect, getDashboardStats);

module.exports = router;
