const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getSchemeStatistics,
  getSchemeFactSheet,
  getAllSchemes
} = require('../controllers/factsController');

// @route   GET /api/facts/schemes
router.get('/schemes', auth, getAllSchemes);

// @route   GET /api/facts/scheme-statistics
router.get('/scheme-statistics', auth, getSchemeStatistics);

// @route   GET /api/facts/scheme/:schemeName
router.get('/scheme/:schemeName', auth, getSchemeFactSheet);

module.exports = router;
