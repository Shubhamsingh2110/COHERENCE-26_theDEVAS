const mongoose = require('mongoose');
const { BUDGET_STATUS } = require('../utils/constants');

const budgetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Budget title is required'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  financialYear: {
    type: String,
    required: [true, 'Financial year is required'],
    match: [/^\d{4}-\d{4}$/, 'Financial year must be in format YYYY-YYYY']
  },
  scheme: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true
  },
  allocatedAmount: {
    type: Number,
    required: [true, 'Allocated amount is required'],
    min: 0
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(BUDGET_STATUS),
    default: BUDGET_STATUS.DRAFT
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  district: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  tags: [String],
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lapseProbability: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for better query performance
budgetSchema.index({ department: 1, financialYear: 1 });
budgetSchema.index({ status: 1 });
budgetSchema.index({ district: 1, state: 1 });

// Virtual for available amount
budgetSchema.virtual('availableAmount').get(function() {
  return this.allocatedAmount - this.spentAmount;
});

// Virtual for utilization percentage
budgetSchema.virtual('utilizationPercentage').get(function() {
  return this.allocatedAmount === 0 
    ? 0 
    : ((this.spentAmount / this.allocatedAmount) * 100).toFixed(2);
});

// Virtual for days remaining
budgetSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

// Pre-save validation
budgetSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  if (this.spentAmount > this.allocatedAmount) {
    next(new Error('Spent amount cannot exceed allocated amount'));
  }
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
