// Format currency to Indian Rupees
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format amount in Crores/Lakhs
export const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else {
    return formatCurrency(amount);
  }
};

// Format date
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate percentage
export const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0;
  return ((part / total) * 100).toFixed(2);
};

// Get risk level color
export const getRiskColor = (riskLevel) => {
  const colors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100',
  };
  return colors[riskLevel] || colors.medium;
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    active: 'text-green-600 bg-green-100',
    approved: 'text-blue-600 bg-blue-100',
    pending: 'text-yellow-600 bg-yellow-100',
    completed: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100',
    draft: 'text-gray-600 bg-gray-100',
    open: 'text-red-600 bg-red-100',
    resolved: 'text-green-600 bg-green-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Calculate days difference
export const daysDifference = (date1, date2 = new Date()) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Get utilization color based on percentage
export const getUtilizationColor = (percentage) => {
  if (percentage < 50) return 'text-red-600';
  if (percentage < 75) return 'text-yellow-600';
  return 'text-green-600';
};

// Generate random color for charts
export const generateColor = (index) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ];
  return colors[index % colors.length];
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Download data as JSON
export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  formatCurrency,
  formatAmount,
  formatDate,
  formatDateTime,
  calculatePercentage,
  getRiskColor,
  getStatusColor,
  truncateText,
  daysDifference,
  getUtilizationColor,
  generateColor,
  debounce,
  downloadJSON,
};
