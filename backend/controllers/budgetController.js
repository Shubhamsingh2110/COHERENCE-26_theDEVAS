const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Department = require('../models/Department');

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const { department, financialYear, status, district, state } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (financialYear) filter.financialYear = financialYear;
    if (status) filter.status = status;
    if (district) filter.district = district;
    if (state) filter.state = state;

    const budgets = await Budget.find(filter)
      .populate('department', 'name code')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget by ID
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('department')
      .populate('approvedBy', 'name email');

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Get associated transactions
    const transactions = await Transaction.find({ budget: budget._id })
      .sort({ transactionDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        budget,
        recentTransactions: transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res, next) => {
  try {
    const budgetData = {
      ...req.body,
      approvedBy: req.user.userId
    };

    const budget = await Budget.create(budgetData);

    // Update department total allocated budget
    await Department.findByIdAndUpdate(
      budget.department,
      { $inc: { totalAllocatedBudget: budget.allocatedAmount } }
    );

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget flow/timeline
// @route   GET /api/budgets/:id/flow
// @access  Private
exports.getBudgetFlow = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('department');
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const transactions = await Transaction.find({ budget: budget._id })
      .sort({ transactionDate: 1 })
      .populate('approvedBy', 'name');

    // Calculate cumulative spending
    let cumulative = 0;
    const flowData = transactions.map(txn => {
      cumulative += txn.amount;
      return {
        date: txn.transactionDate,
        amount: txn.amount,
        cumulative,
        description: txn.description,
        type: txn.type,
        transactionId: txn.transactionId
      };
    });

    res.json({
      success: true,
      data: {
        budget,
        flowData,
        totalTransactions: transactions.length,
        totalSpent: cumulative
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budgets by department
// @route   GET /api/budgets/department/:deptId
// @access  Private
exports.getBudgetsByDepartment = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ department: req.params.deptId })
      .sort({ financialYear: -1, createdAt: -1 });

    const department = await Department.findById(req.params.deptId);

    res.json({
      success: true,
      data: {
        department,
        budgets,
        count: budgets.length
      }
    });
  } catch (error) {
    next(error);
  }
};
