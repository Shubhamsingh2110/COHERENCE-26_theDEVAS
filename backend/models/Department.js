const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  ministry: {
    type: String,
    required: [true, 'Ministry is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  headOfDepartment: {
    name: String,
    email: String,
    phone: String
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalAllocatedBudget: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for available budget
departmentSchema.virtual('availableBudget').get(function() {
  return this.totalAllocatedBudget - this.totalSpent;
});

// Virtual for utilization percentage
departmentSchema.virtual('utilizationPercentage').get(function() {
  return this.totalAllocatedBudget === 0 
    ? 0 
    : ((this.totalSpent / this.totalAllocatedBudget) * 100).toFixed(2);
});

departmentSchema.set('toJSON', { virtuals: true });
departmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Department', departmentSchema);
