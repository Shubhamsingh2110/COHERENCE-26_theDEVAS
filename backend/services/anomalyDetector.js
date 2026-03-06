const { calculateStats, calculateZScore, isRoundFigure, isWeekend } = require('../utils/helpers');
const { ANOMALY_TYPES, RISK_LEVELS } = require('../utils/constants');

/**
 * Main anomaly detection function
 * Analyzes transactions and identifies suspicious patterns
 */
const detectAnomalies = async (transactions) => {
  const anomalies = [];

  if (!transactions || transactions.length === 0) {
    return anomalies;
  }

  // Get transaction amounts for statistical analysis
  const amounts = transactions.map(t => t.amount);
  const stats = calculateStats(amounts);

  for (const transaction of transactions) {
    // 1. High Value Transaction Detection
    const zScore = calculateZScore(transaction.amount, stats.mean, stats.stdDev);
    if (zScore > 3) {
      anomalies.push({
        transaction: transaction._id,
        budget: transaction.budget._id,
        type: ANOMALY_TYPES.HIGH_VALUE,
        riskLevel: zScore > 4 ? RISK_LEVELS.CRITICAL : RISK_LEVELS.HIGH,
        title: 'Unusually High Transaction Amount',
        description: `Transaction amount of ₹${transaction.amount.toLocaleString('en-IN')} is ${zScore.toFixed(2)} standard deviations above the mean (₹${stats.mean.toFixed(2)}).`,
        amount: transaction.amount,
        confidence: Math.min(95, 60 + (zScore * 10)),
        detectedDate: new Date()
      });
    }

    // 2. Round Figure Detection (Suspicious)
    if (isRoundFigure(transaction.amount) && transaction.amount > 1000000) {
      anomalies.push({
        transaction: transaction._id,
        budget: transaction.budget._id,
        type: ANOMALY_TYPES.ROUND_FIGURE,
        riskLevel: RISK_LEVELS.MEDIUM,
        title: 'Suspicious Round Figure Transaction',
        description: `Transaction of exactly ₹${transaction.amount.toLocaleString('en-IN')} raises suspicion. Legitimate transactions rarely have perfect round amounts.`,
        amount: transaction.amount,
        confidence: 70,
        detectedDate: new Date()
      });
    }

    // 3. Weekend/Holiday Transaction Detection
    if (isWeekend(transaction.transactionDate)) {
      anomalies.push({
        transaction: transaction._id,
        budget: transaction.budget._id,
        type: ANOMALY_TYPES.OFF_HOURS,
        riskLevel: RISK_LEVELS.LOW,
        title: 'Off-Hours Transaction',
        description: `Transaction occurred on a weekend (${new Date(transaction.transactionDate).toLocaleDateString()}), which is unusual for government transactions.`,
        amount: transaction.amount,
        confidence: 60,
        detectedDate: new Date()
      });
    }
  }

  // 4. Duplicate Transaction Detection
  const duplicates = findDuplicateTransactions(transactions);
  for (const dup of duplicates) {
    anomalies.push({
      transaction: dup.transaction1,
      budget: dup.budget,
      type: ANOMALY_TYPES.DUPLICATE,
      riskLevel: RISK_LEVELS.HIGH,
      title: 'Potential Duplicate Transaction',
      description: `Found ${dup.count} similar transactions with the same amount (₹${dup.amount.toLocaleString('en-IN')}) and beneficiary within a short time period.`,
      amount: dup.amount,
      confidence: 85,
      detectedDate: new Date(),
      metadata: new Map([['duplicateCount', dup.count]])
    });
  }

  // 5. High Velocity Spending Detection
  const velocityAnomalies = detectHighVelocitySpending(transactions);
  anomalies.push(...velocityAnomalies);

  // 6. Unusual Pattern Detection
  const patternAnomalies = detectUnusualPatterns(transactions);
  anomalies.push(...patternAnomalies);

  return anomalies;
};

/**
 * Detect duplicate or near-duplicate transactions
 */
const findDuplicateTransactions = (transactions) => {
  const duplicates = [];
  const seen = new Map();

  for (const txn of transactions) {
    const key = `${txn.amount}-${txn.beneficiary?.name || 'unknown'}`;
    
    if (seen.has(key)) {
      const existing = seen.get(key);
      const timeDiff = Math.abs(new Date(txn.transactionDate) - new Date(existing.date));
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      // If within 7 days, consider it suspicious
      if (daysDiff <= 7) {
        duplicates.push({
          transaction1: existing.id,
          transaction2: txn._id,
          budget: txn.budget._id,
          amount: txn.amount,
          count: existing.count + 1
        });
        existing.count++;
      }
    } else {
      seen.set(key, {
        id: txn._id,
        date: txn.transactionDate,
        count: 1
      });
    }
  }

  return duplicates;
};

/**
 * Detect high velocity spending (many transactions in short time)
 */
const detectHighVelocitySpending = (transactions) => {
  const anomalies = [];
  
  // Group by budget
  const budgetGroups = transactions.reduce((acc, txn) => {
    const budgetId = txn.budget._id.toString();
    if (!acc[budgetId]) acc[budgetId] = [];
    acc[budgetId].push(txn);
    return acc;
  }, {});

  for (const [budgetId, txns] of Object.entries(budgetGroups)) {
    // Check transactions in last 24 hours
    const sortedTxns = txns.sort((a, b) => 
      new Date(b.transactionDate) - new Date(a.transactionDate)
    );

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTxns = sortedTxns.filter(t => 
      new Date(t.transactionDate) >= oneDayAgo
    );

    if (recentTxns.length >= 5) {
      const totalAmount = recentTxns.reduce((sum, t) => sum + t.amount, 0);
      
      anomalies.push({
        budget: budgetId,
        type: ANOMALY_TYPES.VELOCITY,
        riskLevel: RISK_LEVELS.HIGH,
        title: 'High Velocity Spending Detected',
        description: `${recentTxns.length} transactions totaling ₹${totalAmount.toLocaleString('en-IN')} occurred within 24 hours. This rapid spending pattern requires investigation.`,
        amount: totalAmount,
        confidence: 80,
        detectedDate: new Date(),
        metadata: new Map([
          ['transactionCount', recentTxns.length],
          ['timeframe', '24 hours']
        ])
      });
    }
  }

  return anomalies;
};

/**
 * Detect unusual spending patterns
 */
const detectUnusualPatterns = (transactions) => {
  const anomalies = [];

  // Group by budget
  const budgetGroups = transactions.reduce((acc, txn) => {
    const budgetId = txn.budget._id.toString();
    if (!acc[budgetId]) acc[budgetId] = [];
    acc[budgetId].push(txn);
    return acc;
  }, {});

  for (const [budgetId, txns] of Object.entries(budgetGroups)) {
    // Check for sudden spike in spending
    const sortedTxns = txns.sort((a, b) => 
      new Date(a.transactionDate) - new Date(b.transactionDate)
    );

    if (sortedTxns.length >= 3) {
      const amounts = sortedTxns.map(t => t.amount);
      const recentAmount = amounts[amounts.length - 1];
      const avgPrevious = amounts.slice(0, -1).reduce((a, b) => a + b, 0) / (amounts.length - 1);

      // If recent transaction is 3x the average
      if (recentAmount > avgPrevious * 3) {
        anomalies.push({
          transaction: sortedTxns[sortedTxns.length - 1]._id,
          budget: budgetId,
          type: ANOMALY_TYPES.UNUSUAL_PATTERN,
          riskLevel: RISK_LEVELS.MEDIUM,
          title: 'Unusual Spending Spike',
          description: `Recent transaction of ₹${recentAmount.toLocaleString('en-IN')} is ${(recentAmount / avgPrevious).toFixed(2)}x higher than the average of previous transactions (₹${avgPrevious.toFixed(2)}).`,
          amount: recentAmount,
          confidence: 75,
          detectedDate: new Date()
        });
      }
    }
  }

  return anomalies;
};

/**
 * Calculate risk score for a budget
 */
const calculateBudgetRiskScore = (budget, transactions, anomalies) => {
  let riskScore = 0;

  // Factor 1: Utilization rate (low utilization near end = high risk)
  const utilization = parseFloat(budget.utilizationPercentage);
  const daysRemaining = budget.daysRemaining;
  
  if (daysRemaining <= 30 && utilization < 50) {
    riskScore += 40;
  } else if (daysRemaining <= 60 && utilization < 60) {
    riskScore += 25;
  }

  // Factor 2: Number of anomalies
  const anomalyCount = anomalies.length;
  riskScore += Math.min(30, anomalyCount * 3);

  // Factor 3: Transaction velocity
  const recentTxns = transactions.filter(t => {
    const daysDiff = (Date.now() - new Date(t.transactionDate)) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  if (recentTxns.length > 10) {
    riskScore += 15;
  }

  // Factor 4: Large pending amount near deadline
  if (daysRemaining <= 30 && budget.availableAmount > budget.allocatedAmount * 0.3) {
    riskScore += 15;
  }

  return Math.min(100, riskScore);
};

module.exports = {
  detectAnomalies,
  findDuplicateTransactions,
  detectHighVelocitySpending,
  detectUnusualPatterns,
  calculateBudgetRiskScore
};
