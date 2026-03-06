const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Department = require('../models/Department');
const Anomaly = require('../models/Anomaly');
const { calculateStats } = require('../utils/helpers');

// @desc    Get dashboard overview statistics
// @route   GET /api/analytics/overview
// @access  Private
exports.getOverview = async (req, res, next) => {
  try {
    // Total budgets
    const totalBudgets = await Budget.countDocuments();
    const activeBudgets = await Budget.countDocuments({ status: 'active' });

    // Financial summary
    const budgetStats = await Budget.aggregate([
      {
        $group: {
          _id: null,
          totalAllocated: { $sum: '$allocatedAmount' },
          totalSpent: { $sum: '$spentAmount' }
        }
      }
    ]);

    const financial = budgetStats[0] || { totalAllocated: 0, totalSpent: 0 };
    const available = financial.totalAllocated - financial.totalSpent;
    const utilization = financial.totalAllocated > 0 
      ? ((financial.totalSpent / financial.totalAllocated) * 100).toFixed(2)
      : 0;

    // Transactions
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });

    // Anomalies
    const totalAnomalies = await Anomaly.countDocuments();
    const openAnomalies = await Anomaly.countDocuments({ status: 'open' });
    const criticalAnomalies = await Anomaly.countDocuments({ 
      status: 'open', 
      riskLevel: 'critical' 
    });

    // Departments
    const totalDepartments = await Department.countDocuments();

    // Recent activity
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('budget', 'title scheme');

    const recentAnomalies = await Anomaly.find()
      .sort({ detectedDate: -1 })
      .limit(5)
      .populate('transaction', 'transactionId amount');

    res.json({
      success: true,
      data: {
        summary: {
          budgets: {
            total: totalBudgets,
            active: activeBudgets
          },
          financial: {
            totalAllocated: financial.totalAllocated,
            totalSpent: financial.totalSpent,
            available,
            utilizationPercentage: parseFloat(utilization)
          },
          transactions: {
            total: totalTransactions,
            pending: pendingTransactions
          },
          anomalies: {
            total: totalAnomalies,
            open: openAnomalies,
            critical: criticalAnomalies
          },
          departments: totalDepartments
        },
        recentActivity: {
          transactions: recentTransactions,
          anomalies: recentAnomalies
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending trends over time
// @route   GET /api/analytics/trends
// @access  Private
exports.getSpendingTrends = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.transactionDate = {};
      if (startDate) matchStage.transactionDate.$gte = new Date(startDate);
      if (endDate) matchStage.transactionDate.$lte = new Date(endDate);
    }

    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$transactionDate' } };
        break;
      case 'year':
        groupFormat = { $dateToString: { format: '%Y', date: '$transactionDate' } };
        break;
      default:
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$transactionDate' } };
    }

    const trends = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupFormat,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare departments
// @route   GET /api/analytics/department-comparison
// @access  Private
exports.getDepartmentComparison = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true });

    const comparison = await Promise.all(
      departments.map(async (dept) => {
        const budgets = await Budget.find({ department: dept._id });
        const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
        const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
        const utilization = totalAllocated > 0 
          ? ((totalSpent / totalAllocated) * 100).toFixed(2)
          : 0;

        const anomalyCount = await Anomaly.countDocuments({
          budget: { $in: budgets.map(b => b._id) }
        });

        return {
          department: dept.name,
          code: dept.code,
          totalAllocated,
          totalSpent,
          available: totalAllocated - totalSpent,
          utilizationPercentage: parseFloat(utilization),
          budgetCount: budgets.length,
          anomalyCount
        };
      })
    );

    // Sort by total allocated (descending)
    comparison.sort((a, b) => b.totalAllocated - a.totalAllocated);

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget utilization rates
// @route   GET /api/analytics/utilization
// @access  Private
exports.getUtilization = async (req, res, next) => {
  try {
    const { department, financialYear } = req.query;
    const filter = { status: 'active' };

    if (department) filter.department = department;
    if (financialYear) filter.financialYear = financialYear;

    const budgets = await Budget.find(filter).populate('department', 'name code');

    const utilization = budgets.map(budget => ({
      budgetId: budget._id,
      title: budget.title,
      department: budget.department.name,
      allocated: budget.allocatedAmount,
      spent: budget.spentAmount,
      available: budget.availableAmount,
      utilizationPercentage: parseFloat(budget.utilizationPercentage),
      daysRemaining: budget.daysRemaining,
      riskScore: budget.riskScore
    }));

    // Calculate statistics
    const utilizationRates = utilization.map(u => parseFloat(u.utilizationPercentage));
    const stats = calculateStats(utilizationRates);

    res.json({
      success: true,
      data: {
        budgets: utilization,
        statistics: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fund lapse predictions
// @route   GET /api/analytics/predictions
// @access  Private
exports.getPredictions = async (req, res, next) => {
  try {
    const activeBudgets = await Budget.find({ status: 'active' })
      .populate('department', 'name code');

    const predictions = activeBudgets.map(budget => {
      const daysRemaining = budget.daysRemaining;
      const utilizationRate = parseFloat(budget.utilizationPercentage);
      const availableAmount = budget.availableAmount;

      // Simple prediction logic
      let lapseProbability = 0;
      let riskLevel = 'low';

      if (daysRemaining <= 30 && utilizationRate < 50) {
        lapseProbability = 85;
        riskLevel = 'critical';
      } else if (daysRemaining <= 60 && utilizationRate < 60) {
        lapseProbability = 65;
        riskLevel = 'high';
      } else if (daysRemaining <= 90 && utilizationRate < 70) {
        lapseProbability = 40;
        riskLevel = 'medium';
      } else {
        lapseProbability = 10;
        riskLevel = 'low';
      }

      return {
        budgetId: budget._id,
        title: budget.title,
        department: budget.department.name,
        allocatedAmount: budget.allocatedAmount,
        spentAmount: budget.spentAmount,
        availableAmount,
        utilizationRate,
        daysRemaining,
        lapseProbability,
        riskLevel,
        recommendation: lapseProbability > 50 
          ? 'Immediate action required to utilize funds'
          : 'Monitor regularly'
      };
    });

    // Sort by lapse probability (descending)
    predictions.sort((a, b) => b.lapseProbability - a.lapseProbability);

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    next(error);
  }
};
