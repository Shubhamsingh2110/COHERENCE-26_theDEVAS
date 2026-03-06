const openai = require('../config/openai');

/**
 * AI Service for OpenAI interactions
 */
class AIService {
  /**
   * Generate contextual response using GPT
   */
  static async generateResponse(prompt, systemContext, options = {}) {
    try {
      const {
        temperature = 0.7,
        maxTokens = 500,
        model = 'gpt-3.5-turbo'
      } = options;

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemContext },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      });

      return {
        success: true,
        response: completion.choices[0].message.content,
        usage: completion.usage
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze anomaly and provide explanation
   */
  static async explainAnomaly(anomaly, transaction, budget) {
    const prompt = `Analyze this budget anomaly and provide a clear explanation:

Anomaly Type: ${anomaly.type}
Risk Level: ${anomaly.riskLevel}
Description: ${anomaly.description}

Transaction Details:
- Amount: ₹${transaction.amount.toLocaleString('en-IN')}
- Date: ${new Date(transaction.transactionDate).toLocaleDateString()}
- Beneficiary: ${transaction.beneficiary?.name || 'N/A'}

Budget Context:
- Allocated: ₹${budget.allocatedAmount.toLocaleString('en-IN')}
- Spent: ₹${budget.spentAmount.toLocaleString('en-IN')}
- Utilization: ${budget.utilizationPercentage}%

Provide:
1. Why this is flagged as an anomaly
2. Potential implications
3. Recommended actions`;

    const systemContext = 'You are a financial auditor specializing in government budget analysis and fraud detection.';

    return await this.generateResponse(prompt, systemContext, {
      temperature: 0.6,
      maxTokens: 400
    });
  }

  /**
   * Generate budget recommendations
   */
  static async generateBudgetRecommendations(budget, spendingData) {
    const prompt = `Generate actionable recommendations for this government budget:

Budget: ${budget.title}
Department: ${budget.department?.name}
Allocated: ₹${(budget.allocatedAmount / 10000000).toFixed(2)} Cr
Spent: ₹${(budget.spentAmount / 10000000).toFixed(2)} Cr
Utilization: ${budget.utilizationPercentage}%
Days Remaining: ${budget.daysRemaining}

Recent Spending Pattern:
${spendingData}

Provide 5 specific, actionable recommendations to optimize budget utilization and prevent fund lapse.`;

    const systemContext = 'You are a government budget optimization consultant with expertise in public finance management.';

    return await this.generateResponse(prompt, systemContext, {
      temperature: 0.7,
      maxTokens: 600
    });
  }

  /**
   * Summarize budget performance
   */
  static async summarizeBudgetPerformance(budgets) {
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
    const utilization = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(2) : 0;

    const prompt = `Summarize the budget performance:

Total Budgets: ${budgets.length}
Total Allocated: ₹${(totalAllocated / 10000000).toFixed(2)} Cr
Total Spent: ₹${(totalSpent / 10000000).toFixed(2)} Cr
Overall Utilization: ${utilization}%

Provide a concise executive summary highlighting:
1. Overall performance
2. Key concerns
3. Positive trends
4. Priority actions`;

    const systemContext = 'You are a senior financial analyst preparing executive summaries for government officials.';

    return await this.generateResponse(prompt, systemContext, {
      temperature: 0.5,
      maxTokens: 400
    });
  }

  /**
   * Predict fund lapse risk
   */
  static async predictFundLapseRisk(budget) {
    const prompt = `Assess the risk of fund lapse for this budget:

Budget: ${budget.title}
Allocated: ₹${(budget.allocatedAmount / 10000000).toFixed(2)} Cr
Spent: ₹${(budget.spentAmount / 10000000).toFixed(2)} Cr
Available: ₹${(budget.availableAmount / 10000000).toFixed(2)} Cr
Utilization: ${budget.utilizationPercentage}%
Days Remaining: ${budget.daysRemaining}
Status: ${budget.status}

Provide:
1. Risk assessment (Low/Medium/High/Critical)
2. Probability of fund lapse (%)
3. Key risk factors
4. Urgent actions needed`;

    const systemContext = 'You are a predictive analytics expert specializing in government budget management and fund lapse prevention.';

    return await this.generateResponse(prompt, systemContext, {
      temperature: 0.5,
      maxTokens: 500
    });
  }

  /**
   * Generate natural language query insights
   */
  static async answerBudgetQuery(query, contextData) {
    const systemContext = `You are GovIntel AI, an intelligent assistant for government budget analysis.
You have access to budget data and can provide insights about spending, allocations, and trends.
Context Data: ${JSON.stringify(contextData, null, 2)}
Provide accurate, concise answers based on the available data.`;

    return await this.generateResponse(query, systemContext, {
      temperature: 0.6,
      maxTokens: 400
    });
  }
}

module.exports = AIService;
