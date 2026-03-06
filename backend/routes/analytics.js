const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getOverview,
  getSpendingTrends,
  getDepartmentComparison,
  getUtilization,
  getPredictions
} = require('../controllers/analyticsController');

// @route   GET /api/analytics/overview
router.get('/overview', auth, getOverview);

// @route   GET /api/analytics/trends
router.get('/trends', auth, getSpendingTrends);

// @route   GET /api/analytics/department-comparison
router.get('/department-comparison', auth, getDepartmentComparison);

// @route   GET /api/analytics/utilization
router.get('/utilization', auth, getUtilization);

// @route   GET /api/analytics/predictions
router.get('/predictions', auth, getPredictions);

module.exports = router;
