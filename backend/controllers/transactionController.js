const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Department = require('../models/Department');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { budget, status, type, startDate, endDate, flagged } = req.query;
    const filter = {};

    if (budget) filter.budget = budget;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (flagged !== undefined) filter.flagged = flagged === 'true';
    
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('budget', 'title scheme department')
      .populate({
        path: 'budget',
        populate: { path: 'department', select: 'name code' }
      })
      .populate('approvedBy', 'name email')
      .sort({ transactionDate: -1 })
      .limit(100);

    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('budget')
      .populate('approvedBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const transactionData = {
      ...req.body,
      approvedBy: req.user.userId
    };

    const transaction = await Transaction.create(transactionData);

    // Update budget spent amount
    if (transaction.type === 'expenditure' && transaction.status === 'completed') {
      const budget = await Budget.findById(transaction.budget);
      if (budget) {
        budget.spentAmount += transaction.amount;
        await budget.save();

        // Update department spent amount
        await Department.findByIdAndUpdate(
          budget.department,
          { $inc: { totalSpent: transaction.amount } }
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transactions by budget
// @route   GET /api/transactions/budget/:budgetId
// @access  Private
exports.getTransactionsByBudget = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ budget: req.params.budgetId })
      .populate('approvedBy', 'name email')
      .sort({ transactionDate: -1 });

    const budget = await Budget.findById(req.params.budgetId).populate('department');

    const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);

    res.json({
      success: true,
      data: {
        budget,
        transactions,
        count: transactions.length,
        totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Flag transaction
// @route   PUT /api/transactions/:id/flag
// @access  Private
exports.flagTransaction = async (req, res, next) => {
  try {
    const { flagReason } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { flagged: true, flagReason },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      message: 'Transaction flagged successfully',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};
