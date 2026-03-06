export const DEPARTMENTS = [
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

export const BUDGET_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  ACTIVE: 'active',
  CLOSED: 'closed',
  LAPSED: 'lapsed'
};

export const TRANSACTION_TYPES = {
  ALLOCATION: 'allocation',
  TRANSFER: 'transfer',
  EXPENDITURE: 'expenditure',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment'
};

export const ANOMALY_TYPES = {
  HIGH_VALUE: 'high_value_transaction',
  DUPLICATE: 'duplicate_transaction',
  UNUSUAL_PATTERN: 'unusual_spending_pattern',
  GHOST_BENEFICIARY: 'ghost_beneficiary',
  ROUND_FIGURE: 'round_figure_transaction',
  OFF_HOURS: 'off_hours_transaction',
  VELOCITY: 'high_velocity_spending',
  THRESHOLD: 'threshold_breach'
};

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  AUDITOR: 'auditor',
  DEPARTMENT_HEAD: 'department_head',
  ANALYST: 'analyst',
  VIEWER: 'viewer'
};

export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export const APP_NAME = 'GovIntel AI';

export default {
  DEPARTMENTS,
  BUDGET_STATUS,
  TRANSACTION_TYPES,
  ANOMALY_TYPES,
  RISK_LEVELS,
  USER_ROLES,
  CHART_COLORS,
  APP_NAME,
};
