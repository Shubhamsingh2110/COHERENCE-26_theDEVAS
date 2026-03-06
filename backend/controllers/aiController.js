const openai = require('../config/openai');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Anomaly = require('../models/Anomaly');

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context from database
    const totalBudgets = await Budget.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalAnomalies = await Anomaly.countDocuments({ status: 'open' });

    const budgetStats = await Budget.aggregate([
      {
        $group: {
          _id: null,
          totalAllocated: { $sum: '$allocatedAmount' },
          totalSpent: { $sum: '$spentAmount' }
        }
      }
    ]);

    const contextInfo = budgetStats[0] || { totalAllocated: 0, totalSpent: 0 };

    const systemPrompt = `You are GovIntel AI, an expert assistant for government budget analysis and financial intelligence. 
You have access to a comprehensive budget management system.

Current System Context:
- Total Budgets: ${totalBudgets}
- Total Transactions: ${totalTransactions}
- Open Anomalies: ${totalAnomalies}
- Total Allocated: ₹${(contextInfo.totalAllocated / 10000000).toFixed(2)} Cr
- Total Spent: ₹${(contextInfo.totalSpent / 10000000).toFixed(2)} Cr

Provide insightful, accurate responses about budget flows, anomalies, spending patterns, and financial recommendations.
Use Indian Rupee (₹) format for amounts. Be concise but comprehensive.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      data: {
        message: aiResponse,
        usage: completion.usage
      }
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      error: 'AI service error',
      message: error.message 
    });
  }
};

// @desc    Analyze budget data with AI
// @route   POST /api/ai/analyze
// @access  Private
exports.analyzeBudget = async (req, res, next) => {
  try {
    const { budgetId } = req.body;

    if (!budgetId) {
      return res.status(400).json({ error: 'Budget ID is required' });
    }

    const budget = await Budget.findById(budgetId).populate('department');
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const transactions = await Transaction.find({ budget: budgetId })
      .sort({ transactionDate: -1 })
      .limit(20);

    const anomalies = await Anomaly.find({ budget: budgetId, status: 'open' });

    const prompt = `Analyze the following government budget and provide insights:

Budget Details:
- Title: ${budget.title}
- Department: ${budget.department.name}
- Allocated: ₹${(budget.allocatedAmount / 100000).toFixed(2)} Lakhs
- Spent: ₹${(budget.spentAmount / 100000).toFixed(2)} Lakhs
- Utilization: ${budget.utilizationPercentage}%
- Days Remaining: ${budget.daysRemaining}
- Status: ${budget.status}

Recent Transactions: ${transactions.length}
Open Anomalies: ${anomalies.length}

Provide:
1. Overall assessment
2. Spending pattern analysis
3. Risk factors
4. Recommendations for optimization
5. Red flags (if any)

Keep the analysis concise and actionable.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a government budget analyst expert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 800
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      success: true,
      data: {
        budget,
        analysis,
        transactionCount: transactions.length,
        anomalyCount: anomalies.length
      }
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      error: 'AI analysis failed',
      message: error.message 
    });
  }
};

// @desc    Generate AI insights
// @route   POST /api/ai/insights
// @access  Private
exports.generateInsights = async (req, res, next) => {
  try {
    const { timeframe = '30' } = req.body;

    const days = parseInt(timeframe);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Gather data
    const recentBudgets = await Budget.find({
      createdAt: { $gte: startDate }
    }).countDocuments();

    const recentTransactions = await Transaction.find({
      transactionDate: { $gte: startDate }
    });

    const recentAnomalies = await Anomaly.find({
      detectedDate: { $gte: startDate }
    });

    const totalTransactionAmount = recentTransactions.reduce(
      (sum, t) => sum + t.amount, 0
    );

    const prompt = `Generate strategic insights for government budget management based on the last ${days} days:

Statistics:
- New Budgets: ${recentBudgets}
- Transactions: ${recentTransactions.length} (₹${(totalTransactionAmount / 10000000).toFixed(2)} Cr)
- Anomalies Detected: ${recentAnomalies.length}

Provide:
1. Key trends
2. Notable patterns
3. Potential concerns
4. Strategic recommendations
5. Next action items

Format as bullet points for each section.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a strategic financial advisor for government operations.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 700
    });

    const insights = completion.choices[0].message.content;

    res.json({
      success: true,
      data: {
        timeframe: `${days} days`,
        insights,
        statistics: {
          newBudgets: recentBudgets,
          transactions: recentTransactions.length,
          anomalies: recentAnomalies.length,
          totalAmount: totalTransactionAmount
        }
      }
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights',
      message: error.message 
    });
  }
};

// @desc    Generate AI report
// @route   POST /api/ai/report
// @access  Private
exports.generateReport = async (req, res, next) => {
  try {
    const { type = 'summary', departmentId, financialYear } = req.body;

    let filter = {};
    if (departmentId) filter.department = departmentId;
    if (financialYear) filter.financialYear = financialYear;

    const budgets = await Budget.find(filter);
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);

    const prompt = `Generate a ${type} report for government budget management:

Scope: ${departmentId ? 'Department-specific' : 'All Departments'}
${financialYear ? `Financial Year: ${financialYear}` : ''}

Data:
- Total Budgets: ${budgets.length}
- Total Allocated: ₹${(totalAllocated / 10000000).toFixed(2)} Crores
- Total Spent: ₹${(totalSpent / 10000000).toFixed(2)} Crores
- Utilization: ${totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(2) : 0}%

Generate a professional report with:
1. Executive Summary
2. Financial Overview
3. Key Findings
4. Recommendations
5. Conclusion`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional report writer for government financial analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const report = completion.choices[0].message.content;

    res.json({
      success: true,
      data: {
        report,
        metadata: {
          type,
          generatedAt: new Date(),
          budgetCount: budgets.length,
          totalAllocated,
          totalSpent
        }
      }
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      message: error.message 
    });
  }
};
