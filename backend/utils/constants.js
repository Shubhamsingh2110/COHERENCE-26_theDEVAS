// Department categories
const DEPARTMENTS = [
  'Health & Family Welfare',
  'Education',
  'Rural Development',
  'Agriculture',
  'Defence',
  'Infrastructure',
  'Social Welfare',
  'Finance',
  'Home Affairs',
  'Transport'
];

// Indian states and UTs
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Transaction types
const TRANSACTION_TYPES = {
  ALLOCATION: 'allocation',
  TRANSFER: 'transfer',
  EXPENDITURE: 'expenditure',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment'
};

// Anomaly types
const ANOMALY_TYPES = {
  HIGH_VALUE: 'high_value_transaction',
  DUPLICATE: 'duplicate_transaction',
  UNUSUAL_PATTERN: 'unusual_spending_pattern',
  GHOST_BENEFICIARY: 'ghost_beneficiary',
  ROUND_FIGURE: 'round_figure_transaction',
  OFF_HOURS: 'off_hours_transaction',
  VELOCITY: 'high_velocity_spending',
  THRESHOLD: 'threshold_breach'
};

// Risk levels
const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Budget status
const BUDGET_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  ACTIVE: 'active',
  CLOSED: 'closed',
  LAPSED: 'lapsed'
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  AUDITOR: 'auditor',
  DEPARTMENT_HEAD: 'department_head',
  ANALYST: 'analyst',
  VIEWER: 'viewer'
};

module.exports = {
  DEPARTMENTS,
  STATES,
  TRANSACTION_TYPES,
  ANOMALY_TYPES,
  RISK_LEVELS,
  BUDGET_STATUS,
  USER_ROLES
};
