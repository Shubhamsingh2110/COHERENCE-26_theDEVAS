const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  chat,
  analyzeBudget,
  generateInsights,
  generateReport
} = require('../controllers/aiController');

// @route   POST /api/ai/chat
router.post('/chat', auth, chat);

// @route   POST /api/ai/analyze
router.post('/analyze', auth, analyzeBudget);

// @route   POST /api/ai/insights
router.post('/insights', auth, generateInsights);

// @route   POST /api/ai/report
router.post('/report', auth, generateReport);

module.exports = router;
