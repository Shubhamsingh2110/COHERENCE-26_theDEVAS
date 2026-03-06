const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDistricts,
  getDistrictById,
  getMapData,
  updateDistrict
} = require('../controllers/districtController');

// @route   GET /api/districts
router.get('/', auth, getDistricts);

// @route   GET /api/districts/map-data
router.get('/map-data', auth, getMapData);

// @route   GET /api/districts/:id
router.get('/:id', auth, getDistrictById);

// @route   PUT /api/districts/:id
router.put('/:id', auth, updateDistrict);

module.exports = router;
