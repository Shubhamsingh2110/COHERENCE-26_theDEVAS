const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'District name is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'District code is required'],
    unique: true,
    uppercase: true
  },
  population: {
    type: Number,
    default: 0
  },
  area: {
    type: Number, // in square kilometers
    default: 0
  },
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    }
  },
  headquarters: {
    type: String,
    trim: true
  },
  totalBudgetAllocated: {
    type: Number,
    default: 0
  },
  totalBudgetSpent: {
    type: Number,
    default: 0
  },
  schemes: [{
    name: String,
    allocated: Number,
    spent: Number
  }],
  anomalyCount: {
    type: Number,
    default: 0
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes
districtSchema.index({ state: 1, name: 1 });
districtSchema.index({ code: 1 });
districtSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Virtual for utilization percentage
districtSchema.virtual('utilization').get(function() {
  return this.totalBudgetAllocated === 0 
    ? 0 
    : ((this.totalBudgetSpent / this.totalBudgetAllocated) * 100).toFixed(2);
});

// Virtual for per capita allocation
districtSchema.virtual('perCapitaAllocation').get(function() {
  return this.population === 0 
    ? 0 
    : (this.totalBudgetAllocated / this.population).toFixed(2);
});

districtSchema.set('toJSON', { virtuals: true });
districtSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('District', districtSchema);
