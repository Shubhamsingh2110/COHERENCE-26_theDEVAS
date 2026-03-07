const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getReallocationRecommendations,
  getSchemeAnalysis
} = require('../controllers/reallocationController');

// @route   GET /api/reallocation/recommendations
router.get('/recommendations', auth, getReallocationRecommendations);

// @route   GET /api/reallocation/scheme-analysis/:schemeName
router.get('/scheme-analysis/:schemeName', auth, getSchemeAnalysis);

module.exports = router;
