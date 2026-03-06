/**
 * Predictive Analytics Service
 * Provides prediction models for fund lapse, spending forecast, etc.
 */

/**
 * Calculate fund lapse probability
 */
const predictFundLapse = (budget) => {
  const {
    allocatedAmount,
    spentAmount,
    daysRemaining,
    startDate,
    endDate
  } = budget;

  const utilizationRate = (spentAmount / allocatedAmount) * 100;
  const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - daysRemaining;
  const expectedUtilization = (daysElapsed / totalDays) * 100;

  let probability = 0;
  let riskLevel = 'low';

  // Calculate lapse probability based on multiple factors
  if (daysRemaining <= 30) {
    if (utilizationRate < 50) {
      probability = 85;
      riskLevel = 'critical';
    } else if (utilizationRate < 70) {
      probability = 65;
      riskLevel = 'high';
    } else {
      probability = 30;
      riskLevel = 'medium';
    }
  } else if (daysRemaining <= 60) {
    if (utilizationRate < 40) {
      probability = 70;
      riskLevel = 'high';
    } else if (utilizationRate < 60) {
      probability = 45;
      riskLevel = 'medium';
    } else {
      probability = 20;
      riskLevel = 'low';
    }
  } else if (daysRemaining <= 90) {
    if (utilizationRate < 30) {
      probability = 55;
      riskLevel = 'medium';
    } else {
      probability = 15;
      riskLevel = 'low';
    }
  } else {
    // More than 90 days remaining
    if (utilizationRate < expectedUtilization - 20) {
      probability = 40;
      riskLevel = 'medium';
    } else {
      probability = 10;
      riskLevel = 'low';
    }
  }

  return {
    probability: Math.min(100, probability),
    riskLevel,
    utilizationRate: parseFloat(utilizationRate.toFixed(2)),
    expectedUtilization: parseFloat(expectedUtilization.toFixed(2)),
    daysRemaining
  };
};

/**
 * Forecast spending for remaining period
 */
const forecastSpending = (transactions, budget) => {
  if (transactions.length < 2) {
    return {
      forecast: 0,
      confidence: 'low'
    };
  }

  // Calculate average daily spending
  const sortedTxns = transactions.sort((a, b) => 
    new Date(a.transactionDate) - new Date(b.transactionDate)
  );

  const firstDate = new Date(sortedTxns[0].transactionDate);
  const lastDate = new Date(sortedTxns[sortedTxns.length - 1].transactionDate);
  const daysCovered = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) || 1;

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const dailyAverage = totalSpent / daysCovered;

  // Project for remaining days
  const daysRemaining = budget.daysRemaining;
  const forecastSpending = dailyAverage * daysRemaining;

  // Calculate confidence based on transaction consistency
  const amounts = transactions.map(t => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / mean) * 100;

  let confidence;
  if (coefficientOfVariation < 30) {
    confidence = 'high';
  } else if (coefficientOfVariation < 60) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    forecast: forecastSpending,
    dailyAverage,
    projectedTotal: budget.spentAmount + forecastSpending,
    projectedUtilization: ((budget.spentAmount + forecastSpending) / budget.allocatedAmount * 100).toFixed(2),
    confidence,
    daysRemaining
  };
};

/**
 * Calculate spending velocity
 */
const calculateSpendingVelocity = (transactions, timeframe = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeframe);

  const recentTransactions = transactions.filter(t => 
    new Date(t.transactionDate) >= cutoffDate
  );

  const totalAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const dailyVelocity = totalAmount / timeframe;

  return {
    totalAmount,
    transactionCount: recentTransactions.length,
    dailyVelocity,
    timeframe,
    averageTransactionSize: recentTransactions.length > 0 
      ? totalAmount / recentTransactions.length 
      : 0
  };
};

/**
 * Detect quarter-end rush pattern
 */
const detectQuarterEndRush = (transactions) => {
  const quarterEndRushes = [];

  // Group transactions by month
  const monthGroups = transactions.reduce((acc, txn) => {
    const month = new Date(txn.transactionDate).getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(txn);
    return acc;
  }, {});

  // Check for Q1, Q2, Q3, Q4 end months (March, June, September, December)
  const quarterEndMonths = [2, 5, 8, 11]; // 0-indexed

  for (const month of quarterEndMonths) {
    const monthTxns = monthGroups[month] || [];
    
    if (monthTxns.length === 0) continue;

    // Check last week of quarter-end month
    const lastWeekTxns = monthTxns.filter(t => {
      const date = new Date(t.transactionDate).getDate();
      return date >= 23; // Last week
    });

    const lastWeekAmount = lastWeekTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalMonthAmount = monthTxns.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (lastWeekAmount / totalMonthAmount) * 100;

    // If > 50% of spending in last week, it's a rush
    if (percentage > 50 && lastWeekTxns.length >= 3) {
      quarterEndRushes.push({
        quarter: Math.floor(month / 3) + 1,
        month: month + 1,
        lastWeekTransactions: lastWeekTxns.length,
        lastWeekAmount,
        totalMonthAmount,
        percentage: percentage.toFixed(2),
        risk: percentage > 70 ? 'high' : 'medium'
      });
    }
  }

  return quarterEndRushes;
};

/**
 * Calculate budget health score
 */
const calculateBudgetHealthScore = (budget, transactions, anomalies) => {
  let score = 100;

  // Factor 1: Utilization appropriateness (25 points)
  const utilization = parseFloat(budget.utilizationPercentage);
  const daysRemaining = budget.daysRemaining;
  const totalDays = Math.ceil((new Date(budget.endDate) - new Date(budget.startDate)) / (1000 * 60 * 60 * 24));
  const expectedUtilization = ((totalDays - daysRemaining) / totalDays) * 100;

  const utilizationDiff = Math.abs(utilization - expectedUtilization);
  if (utilizationDiff > 30) score -= 25;
  else if (utilizationDiff > 20) score -= 15;
  else if (utilizationDiff > 10) score -= 8;

  // Factor 2: Anomaly count (25 points)
  if (anomalies.length > 10) score -= 25;
  else if (anomalies.length > 5) score -= 15;
  else if (anomalies.length > 2) score -= 8;

  // Factor 3: Transaction regularity (25 points)
  if (transactions.length < 3 && daysRemaining < 60) {
    score -= 20;
  } else {
    const daysSinceLastTransaction = transactions.length > 0
      ? (Date.now() - new Date(transactions[0].transactionDate)) / (1000 * 60 * 60 * 24)
      : 999;

    if (daysSinceLastTransaction > 30) score -= 15;
    else if (daysSinceLastTransaction > 14) score -= 8;
  }

  // Factor 4: Fund lapse risk (25 points)
  const lapseRisk = predictFundLapse(budget);
  if (lapseRisk.probability > 70) score -= 25;
  else if (lapseRisk.probability > 50) score -= 15;
  else if (lapseRisk.probability > 30) score -= 8;

  return {
    score: Math.max(0, score),
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    factors: {
      utilization: 25 - Math.min(25, Math.floor(utilizationDiff / 3)),
      anomalies: 25 - Math.min(25, anomalies.length * 2.5),
      regularity: score >= 60 ? 25 : score >= 40 ? 15 : 10,
      lapseRisk: 25 - Math.min(25, Math.floor(lapseRisk.probability / 4))
    }
  };
};

module.exports = {
  predictFundLapse,
  forecastSpending,
  calculateSpendingVelocity,
  detectQuarterEndRush,
  calculateBudgetHealthScore
};
