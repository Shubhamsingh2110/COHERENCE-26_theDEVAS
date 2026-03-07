const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Department = require('../models/Department');

// @desc    Get comprehensive scheme-wise facts and figures
// @route   GET /api/facts/scheme-statistics
// @access  Private
exports.getSchemeStatistics = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentFY = `${currentYear}-${currentYear + 1}`;

    // Get all budgets for current financial year
    const budgets = await Budget.find({ financialYear: currentFY })
      .populate('department')
      .sort({ scheme: 1 });

    // Group by scheme
    const schemeMap = new Map();

    for (const budget of budgets) {
      const schemeName = budget.scheme;
      
      if (!schemeMap.has(schemeName)) {
        schemeMap.set(schemeName, {
          scheme: schemeName,
          totalAllocated: 0,
          totalSpent: 0,
          totalPending: 0,
          totalAvailable: 0,
          budgetCount: 0,
          departments: new Set(),
          budgets: [],
          avgUtilization: 0,
          status: {
            active: 0,
            completed: 0,
            onHold: 0,
            underReview: 0
          }
        });
      }

      const schemeData = schemeMap.get(schemeName);
      schemeData.totalAllocated += budget.allocatedAmount || 0;
      schemeData.totalSpent += budget.spentAmount || 0;
      schemeData.totalPending += (budget.allocatedAmount || 0) - (budget.spentAmount || 0);
      schemeData.totalAvailable += budget.availableAmount || 0;
      schemeData.budgetCount++;
      schemeData.departments.add(budget.department?.name || 'Unknown');
      schemeData.budgets.push({
        id: budget._id,
        title: budget.title,
        department: budget.department?.name,
        allocated: budget.allocatedAmount,
        spent: budget.spentAmount,
        available: budget.availableAmount,
        utilization: budget.utilizationPercentage,
        status: budget.status,
        daysRemaining: budget.daysRemaining
      });
      
      // Count status
      if (budget.status === 'active') schemeData.status.active++;
      else if (budget.status === 'completed') schemeData.status.completed++;
      else if (budget.status === 'on_hold') schemeData.status.onHold++;
      else if (budget.status === 'under_review') schemeData.status.underReview++;
    }

    // Calculate average utilization for each scheme
    const schemeStatistics = Array.from(schemeMap.values()).map(scheme => {
      const totalUtilization = scheme.budgets.reduce((sum, b) => sum + (b.utilization || 0), 0);
      scheme.avgUtilization = scheme.budgetCount > 0 ? (totalUtilization / scheme.budgetCount).toFixed(2) : 0;
      scheme.departments = Array.from(scheme.departments);
      scheme.utilizationRate = scheme.totalAllocated > 0 
        ? ((scheme.totalSpent / scheme.totalAllocated) * 100).toFixed(2) 
        : 0;
      
      return scheme;
    });

    // Sort by total allocated amount (descending)
    schemeStatistics.sort((a, b) => b.totalAllocated - a.totalAllocated);

    // Calculate overall statistics
    const overallStats = {
      totalSchemes: schemeStatistics.length,
      totalBudgets: budgets.length,
      grandTotalAllocated: schemeStatistics.reduce((sum, s) => sum + s.totalAllocated, 0),
      grandTotalSpent: schemeStatistics.reduce((sum, s) => sum + s.totalSpent, 0),
      grandTotalPending: schemeStatistics.reduce((sum, s) => sum + s.totalPending, 0),
      grandTotalAvailable: schemeStatistics.reduce((sum, s) => sum + s.totalAvailable, 0),
      overallUtilization: 0
    };

    overallStats.overallUtilization = overallStats.grandTotalAllocated > 0
      ? ((overallStats.grandTotalSpent / overallStats.grandTotalAllocated) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        financialYear: currentFY,
        overallStats,
        schemes: schemeStatistics
      }
    });
  } catch (error) {
    console.error('Scheme Statistics Error:', error);
    next(error);
  }
};

// @desc    Get detailed fact sheet for a specific scheme
// @route   GET /api/facts/scheme/:schemeName
// @access  Private
exports.getSchemeFactSheet = async (req, res, next) => {
  try {
    const { schemeName } = req.params;
    const currentYear = new Date().getFullYear();
    const currentFY = `${currentYear}-${currentYear + 1}`;

    // Get all budgets for this scheme in current FY
    const budgets = await Budget.find({ 
      scheme: schemeName,
      financialYear: currentFY 
    })
      .populate('department')
      .sort({ allocatedAmount: -1 });

    if (budgets.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'No budgets found for this scheme' 
      });
    }

    // Get all transactions for these budgets
    const budgetIds = budgets.map(b => b._id);
    const transactions = await Transaction.find({
      budget: { $in: budgetIds }
    })
      .populate('budget', 'title')
      .sort({ transactionDate: -1 })
      .limit(50);

    // Get unique departments
    const departments = [...new Set(budgets.map(b => b.department?.name).filter(Boolean))];

    // Calculate statistics
    const statistics = {
      totalBudgets: budgets.length,
      departments: departments,
      departmentCount: departments.length,
      totalAllocated: budgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0),
      totalSpent: budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0),
      totalAvailable: budgets.reduce((sum, b) => sum + (b.availableAmount || 0), 0),
      totalPending: 0,
      utilizationRate: 0,
      avgUtilization: 0,
      transactionCount: transactions.length,
      statusBreakdown: {
        active: budgets.filter(b => b.status === 'active').length,
        completed: budgets.filter(b => b.status === 'completed').length,
        onHold: budgets.filter(b => b.status === 'on_hold').length,
        underReview: budgets.filter(b => b.status === 'under_review').length
      },
      riskAnalysis: {
        highUtilization: budgets.filter(b => (b.utilizationPercentage || 0) > 80).length,
        lowUtilization: budgets.filter(b => (b.utilizationPercentage || 0) < 30).length,
        nearExpiry: budgets.filter(b => (b.daysRemaining || 365) < 30).length
      }
    };

    statistics.totalPending = statistics.totalAllocated - statistics.totalSpent;
    statistics.utilizationRate = statistics.totalAllocated > 0
      ? ((statistics.totalSpent / statistics.totalAllocated) * 100).toFixed(2)
      : 0;
    
    const totalUtilization = budgets.reduce((sum, b) => sum + (b.utilizationPercentage || 0), 0);
    statistics.avgUtilization = budgets.length > 0 
      ? (totalUtilization / budgets.length).toFixed(2) 
      : 0;

    // Format budget details
    const budgetDetails = budgets.map(budget => ({
      id: budget._id,
      title: budget.title,
      department: budget.department?.name || 'Unknown',
      allocated: budget.allocatedAmount,
      spent: budget.spentAmount,
      available: budget.availableAmount,
      pending: (budget.allocatedAmount || 0) - (budget.spentAmount || 0),
      utilization: budget.utilizationPercentage || 0,
      status: budget.status,
      daysRemaining: budget.daysRemaining,
      startDate: budget.startDate,
      endDate: budget.endDate
    }));

    // Format recent transactions
    const recentTransactions = transactions.map(txn => ({
      id: txn._id,
      transactionId: txn.transactionId,
      amount: txn.amount,
      description: txn.description,
      date: txn.transactionDate,
      beneficiary: txn.beneficiary?.name,
      budget: txn.budget?.title,
      status: txn.status
    }));

    res.json({
      success: true,
      data: {
        scheme: schemeName,
        financialYear: currentFY,
        statistics,
        budgets: budgetDetails,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Scheme Fact Sheet Error:', error);
    next(error);
  }
};

// @desc    Get all unique schemes
// @route   GET /api/facts/schemes
// @access  Private
exports.getAllSchemes = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentFY = `${currentYear}-${currentYear + 1}`;

    // Get unique schemes
    const schemes = await Budget.distinct('scheme', { financialYear: currentFY });

    res.json({
      success: true,
      count: schemes.length,
      data: schemes.sort()
    });
  } catch (error) {
    next(error);
  }
};
