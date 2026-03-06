const mongoose = require('mongoose');
const { TRANSACTION_TYPES } = require('../utils/constants');

const transactionSchema = new mongoose.Schema({
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: [true, 'Budget reference is required']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: Object.values(TRANSACTION_TYPES),
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  beneficiary: {
    name: {
      type: String,
      required: [true, 'Beneficiary name is required']
    },
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  vendor: {
    name: String,
    gstin: String,
    pan: String
  },
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['NEFT', 'RTGS', 'IMPS', 'Cheque', 'DD', 'UPI', 'Other'],
    default: 'NEFT'
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  remarks: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ budget: 1, transactionDate: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ flagged: 1 });

// Auto-generate transaction ID if not provided
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.transactionId = `TXN${year}${month}${random}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
