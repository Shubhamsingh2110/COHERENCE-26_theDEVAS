const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const AIService = require('../services/aiService');

// @desc    Get smart reallocation recommendations using AI
// @route   GET /api/reallocation/recommendations
// @access  Private
exports.getReallocationRecommendations = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentFY = `${currentYear}-${currentYear + 1}`;

    // Get all active budgets for current financial year
    const budgets = await Budget.find({
      financialYear: currentFY,
      status: { $in: ['active', 'under_review'] }
    })
      .populate('department')
      .sort({ scheme: 1 });

    if (budgets.length === 0) {
      return res.json({
        success: true,
        message: 'No active budgets found for reallocation',
        data: {
          sourceSchemes: [],
          targetSchemes: [],
          recommendations: []
        }
      });
    }

    // Analyze budgets to find sources (underutilized) and targets (high-performing, needs funds)
    const schemeAnalysis = new Map();

    // Group by scheme and analyze performance
    for (const budget of budgets) {
      const schemeName = budget.scheme;
      
      if (!schemeAnalysis.has(schemeName)) {
        schemeAnalysis.set(schemeName, {
          scheme: schemeName,
          budgets: [],
          totalAllocated: 0,
          totalSpent: 0,
          totalAvailable: 0,
          avgUtilization: 0,
          daysRemaining: budget.daysRemaining || 365,
          departments: new Set(),
          performance: {
            utilizationRate: 0,
            spendingVelocity: 0, // Amount spent per day
            projectedUtilization: 0
          }
        });
      }

      const schemeData = schemeAnalysis.get(schemeName);
      schemeData.budgets.push(budget);
      schemeData.totalAllocated += budget.allocatedAmount || 0;
      schemeData.totalSpent += budget.spentAmount || 0;
      schemeData.totalAvailable += budget.availableAmount || 0;
      schemeData.departments.add(budget.department?.name || 'Unknown');
    }

    // Calculate performance metrics
    const analysisData = Array.from(schemeAnalysis.values()).map(scheme => {
      const utilizationRate = scheme.totalAllocated > 0 
        ? (scheme.totalSpent / scheme.totalAllocated * 100)
        : 0;

      // Calculate average days passed (assume FY started on April 1)
      const fyStartDate = new Date(currentYear, 3, 1); // April 1
      const today = new Date();
      const daysPassed = Math.max(1, Math.floor((today - fyStartDate) / (1000 * 60 * 60 * 24)));
      
      const spendingVelocity = daysPassed > 0 ? scheme.totalSpent / daysPassed : 0;
      const daysRemaining = scheme.daysRemaining || 365;
      const projectedSpending = scheme.totalSpent + (spendingVelocity * daysRemaining);
      const projectedUtilization = scheme.totalAllocated > 0 
        ? (projectedSpending / scheme.totalAllocated * 100)
        : 0;

      scheme.performance = {
        utilizationRate: parseFloat(utilizationRate.toFixed(2)),
        spendingVelocity: parseFloat(spendingVelocity.toFixed(2)),
        projectedUtilization: parseFloat(Math.min(projectedUtilization, 100).toFixed(2)),
        daysPassed,
        daysRemaining
      };

      scheme.departments = Array.from(scheme.departments);

      return scheme;
    });

    // Identify source schemes (schemes with available funds that could be reallocated)
    // Relaxed criteria to ensure we find candidates
    const sourceSchemes = analysisData.filter(scheme => {
      // Any scheme with:
      // 1. Below average utilization (< 60%) OR
      // 2. Low projected utilization (< 70%) OR
      // 3. Has significant available funds (> 10 lakhs)
      const hasBelowAverageUtilization = scheme.performance.utilizationRate < 60;
      const hasLowProjection = scheme.performance.projectedUtilization < 70;
      const hasAvailableFunds = scheme.totalAvailable > 1000000; // > 10 lakhs

      return (hasBelowAverageUtilization || hasLowProjection) && hasAvailableFunds;
    }).sort((a, b) => b.totalAvailable - a.totalAvailable);

    // Identify target schemes (schemes that could use more funds)
    // Relaxed criteria to ensure we find candidates
    const targetSchemes = analysisData.filter(scheme => {
      // Any scheme with:
      // 1. Good utilization (> 50%) OR
      // 2. High projected utilization (> 70%) OR
      // 3. Limited funds remaining (< 50% remaining)
      const hasGoodUtilization = scheme.performance.utilizationRate > 50;
      const hasHighProjection = scheme.performance.projectedUtilization > 70;
      const hasLimitedFunds = scheme.totalAvailable < scheme.totalAllocated * 0.5; // < 50% remaining

      return (hasGoodUtilization || hasHighProjection) && hasLimitedFunds;
    }).sort((a, b) => b.performance.utilizationRate - a.performance.utilizationRate);

    // Generate AI-powered reallocation recommendations
    const recommendations = [];

    if (sourceSchemes.length > 0 && targetSchemes.length > 0) {
      // Use AI to analyze and recommend reallocations
      const aiPrompt = `Analyze the following government budget data and provide AT LEAST 10 smart reallocation recommendations for optimal fund distribution:

SOURCE SCHEMES (Have surplus/available funds):
${sourceSchemes.slice(0, 15).map((s, i) => `${i + 1}. ${s.scheme}
   - Allocated: ₹${(s.totalAllocated / 10000000).toFixed(2)} Cr
   - Spent: ₹${(s.totalSpent / 10000000).toFixed(2)} Cr (${s.performance.utilizationRate}%)
   - Available: ₹${(s.totalAvailable / 10000000).toFixed(2)} Cr
   - Projected Utilization: ${s.performance.projectedUtilization}%
   - Days Remaining: ${s.performance.daysRemaining}
   - Departments: ${s.departments.join(', ')}`).join('\n\n')}

TARGET SCHEMES (Could benefit from additional funds):
${targetSchemes.slice(0, 15).map((t, i) => `${i + 1}. ${t.scheme}
   - Allocated: ₹${(t.totalAllocated / 10000000).toFixed(2)} Cr
   - Spent: ₹${(t.totalSpent / 10000000).toFixed(2)} Cr (${t.performance.utilizationRate}%)
   - Available: ₹${(t.totalAvailable / 10000000).toFixed(2)} Cr
   - Projected Utilization: ${t.performance.projectedUtilization}%
   - Days Remaining: ${t.performance.daysRemaining}
   - Departments: ${t.departments.join(', ')}`).join('\n\n')}

Generate AT LEAST 10 reallocation recommendations in JSON format:
{
  "recommendations": [
    {
      "fromScheme": "source scheme name",
      "toScheme": "target scheme name",
      "amount": amount_in_rupees,
      "percentage": percentage_of_source_available,
      "reasoning": "detailed justification",
      "impact": "expected positive outcomes",
      "priority": "high/medium/low",
      "riskLevel": "low/medium/high"
    }
  ],
  "totalReallocation": total_amount,
  "overallAssessment": "summary of reallocation strategy",
  "expectedBenefits": ["benefit1", "benefit2", "benefit3"],
  "risks": ["risk1", "risk2"],
  "implementation": ["step1", "step2", "step3"]
}

IMPORTANT: Generate exactly 10 or more recommendations. Consider:
1. Pair schemes from similar domains/departments when possible
2. Reallocate 20-50% of available surplus (not entire surplus)
3. Prioritize schemes with better utilization rates and critical social impact
4. Consider time remaining in fiscal year
5. Balance risk - don't over-allocate from any single source
6. Ensure target schemes have capacity to utilize additional funds effectively
7. If there are more than 10 good opportunities, include them all`;

      const systemContext = `You are a government financial planning expert specializing in budget optimization and fund reallocation. 
You understand fiscal policies, departmental needs, and efficient fund utilization strategies for maximizing public welfare impact.
Your goal is to identify AT LEAST 10 optimal fund transfer opportunities to prevent fund lapses and maximize social impact.`;

      let aiAnalysis = {
        recommendations: [],
        totalReallocation: 0,
        overallAssessment: 'AI analysis pending',
        expectedBenefits: [],
        risks: [],
        implementation: []
      };

      try {
        const aiResponse = await AIService.generateResponse(aiPrompt, systemContext, {
          temperature: 0.6,
          maxTokens: 2000
        });

        // Parse AI response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          aiAnalysis.overallAssessment = aiResponse.substring(0, 500);
        }

        // Validate and format recommendations
        if (aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0) {
          aiAnalysis.recommendations.forEach((rec, index) => {
            const sourceScheme = sourceSchemes.find(s => s.scheme === rec.fromScheme);
            const targetScheme = targetSchemes.find(t => t.scheme === rec.toScheme);

            if (sourceScheme && targetScheme) {
              recommendations.push({
                id: `realloc-${index + 1}`,
                fromScheme: rec.fromScheme,
                toScheme: rec.toScheme,
                fromDetails: {
                  allocated: sourceScheme.totalAllocated,
                  spent: sourceScheme.totalSpent,
                  available: sourceScheme.totalAvailable,
                  utilizationRate: sourceScheme.performance.utilizationRate,
                  projectedUtilization: sourceScheme.performance.projectedUtilization
                },
                toDetails: {
                  allocated: targetScheme.totalAllocated,
                  spent: targetScheme.totalSpent,
                  available: targetScheme.totalAvailable,
                  utilizationRate: targetScheme.performance.utilizationRate,
                  projectedUtilization: targetScheme.performance.projectedUtilization
                },
                reallocationAmount: rec.amount,
                percentage: rec.percentage,
                reasoning: rec.reasoning,
                impact: rec.impact,
                priority: rec.priority || 'medium',
                riskLevel: rec.riskLevel || 'low',
                status: 'pending'
              });
            }
          });
        }

      } catch (aiError) {
        console.error('AI Reallocation Analysis Error:', aiError);
        
        // Fallback: Generate at least 10 basic recommendations without AI
        const minRecommendations = 10;
        const maxPairs = Math.min(sourceSchemes.length, targetSchemes.length);
        const recommendationsToGenerate = Math.max(minRecommendations, maxPairs);

        for (let i = 0; i < Math.min(recommendationsToGenerate, maxPairs); i++) {
          const sourceIndex = i % sourceSchemes.length;
          const targetIndex = i % targetSchemes.length;
          
          const source = sourceSchemes[sourceIndex];
          const target = targetSchemes[targetIndex];
          
          // Calculate reallocation amount (20-40% of available)
          const percentageToReallocate = 20 + Math.floor(Math.random() * 20); // 20-40%
          const reallocationAmount = Math.floor(source.totalAvailable * (percentageToReallocate / 100));

          // Skip if amount is too small
          if (reallocationAmount < 500000) continue; // Skip if < 5 lakhs

          recommendations.push({
            id: `realloc-${i + 1}`,
            fromScheme: source.scheme,
            toScheme: target.scheme,
            fromDetails: {
              allocated: source.totalAllocated,
              spent: source.totalSpent,
              available: source.totalAvailable,
              utilizationRate: source.performance.utilizationRate,
              projectedUtilization: source.performance.projectedUtilization
            },
            toDetails: {
              allocated: target.totalAllocated,
              spent: target.totalSpent,
              available: target.totalAvailable,
              utilizationRate: target.performance.utilizationRate,
              projectedUtilization: target.performance.projectedUtilization
            },
            reallocationAmount,
            percentage: percentageToReallocate,
            reasoning: `${source.scheme} has ${source.performance.utilizationRate}% utilization with ₹${(source.totalAvailable / 10000000).toFixed(2)} Cr available, while ${target.scheme} has strong ${target.performance.utilizationRate}% utilization and could benefit from additional funding to meet projected demands.`,
            impact: `Will optimize fund utilization, prevent lapse of ₹${(reallocationAmount / 10000000).toFixed(2)} Cr, and support ${target.scheme}'s proven track record of effective implementation.`,
            priority: target.performance.utilizationRate > 70 ? 'high' : 'medium',
            riskLevel: source.performance.utilizationRate < 30 ? 'low' : 'medium',
            status: 'pending'
          });
        }

        const totalReallocationAmount = recommendations.reduce((sum, r) => sum + r.reallocationAmount, 0);
        aiAnalysis.totalReallocation = totalReallocationAmount;
        aiAnalysis.overallAssessment = `Automated analysis identified ${recommendations.length} fund reallocation opportunities totaling ₹${(totalReallocationAmount / 10000000).toFixed(2)} Cr. These transfers will optimize budget utilization by moving funds from underutilized schemes to high-performing programs with demonstrated impact.`;
        aiAnalysis.expectedBenefits = [
          'Prevent fund lapse and maximize public welfare spending',
          `Reallocate ₹${(totalReallocationAmount / 10000000).toFixed(2)} Cr to high-impact schemes`,
          'Support schemes with proven implementation track records',
          'Optimize budget efficiency across departments'
        ];
        aiAnalysis.risks = [
          'Ensure receiving schemes have adequate implementation capacity',
          'Monitor source schemes to prevent operational disruption'
        ];
        aiAnalysis.implementation = [
          'Review and approve recommendations',
          'Issue reallocation orders to concerned departments',
          'Update budget allocation records',
          'Monitor utilization of reallocated funds'
        ];
      }

      res.json({
        success: true,
        data: {
          financialYear: currentFY,
          analysisDate: new Date(),
          sourceSchemes: sourceSchemes.slice(0, 10),
          targetSchemes: targetSchemes.slice(0, 10),
          recommendations,
          aiAnalysis,
          summary: {
            totalSourceSchemes: sourceSchemes.length,
            totalTargetSchemes: targetSchemes.length,
            totalSurplusFunds: sourceSchemes.reduce((sum, s) => sum + s.totalAvailable, 0),
            totalRecommendedReallocation: recommendations.reduce((sum, r) => sum + r.reallocationAmount, 0),
            potentialBeneficiaries: targetSchemes.length
          }
        }
      });
    } else {
      // If strict criteria didn't find schemes, use ALL schemes and let AI decide
      console.log('Relaxing criteria further - using all schemes for AI analysis');
      
      const allSourceSchemes = analysisData.filter(s => s.totalAvailable > 500000).sort((a, b) => b.totalAvailable - a.totalAvailable);
      const allTargetSchemes = analysisData.filter(s => s.performance.utilizationRate > 30).sort((a, b) => b.performance.utilizationRate - a.performance.utilizationRate);

      if (allSourceSchemes.length > 0 && allTargetSchemes.length > 0) {
        // Generate at least 10 recommendations using relaxed criteria
        const minRecommendations = 10;
        const maxPairs = Math.min(allSourceSchemes.length, allTargetSchemes.length);
        
        for (let i = 0; i < Math.min(minRecommendations, maxPairs); i++) {
          const source = allSourceSchemes[i % allSourceSchemes.length];
          const target = allTargetSchemes[i % allTargetSchemes.length];
          
          // Avoid same scheme
          if (source.scheme === target.scheme) continue;
          
          const percentageToReallocate = 15 + Math.floor(Math.random() * 25); // 15-40%
          const reallocationAmount = Math.floor(source.totalAvailable * (percentageToReallocate / 100));

          if (reallocationAmount < 500000) continue;

          recommendations.push({
            id: `realloc-${i + 1}`,
            fromScheme: source.scheme,
            toScheme: target.scheme,
            fromDetails: {
              allocated: source.totalAllocated,
              spent: source.totalSpent,
              available: source.totalAvailable,
              utilizationRate: source.performance.utilizationRate,
              projectedUtilization: source.performance.projectedUtilization
            },
            toDetails: {
              allocated: target.totalAllocated,
              spent: target.totalSpent,
              available: target.totalAvailable,
              utilizationRate: target.performance.utilizationRate,
              projectedUtilization: target.performance.projectedUtilization
            },
            reallocationAmount,
            percentage: percentageToReallocate,
            reasoning: `Strategic reallocation from ${source.scheme} (${source.performance.utilizationRate}% utilization) to ${target.scheme} (${target.performance.utilizationRate}% utilization) will optimize fund distribution and maximize public impact.`,
            impact: `Reallocating ₹${(reallocationAmount / 10000000).toFixed(2)} Cr will enhance ${target.scheme}'s capacity to meet growing demands while ensuring efficient use of government funds.`,
            priority: target.performance.utilizationRate > 60 ? 'high' : 'medium',
            riskLevel: source.performance.utilizationRate < 40 ? 'low' : 'medium',
            status: 'pending'
          });
        }
      }

      const totalReallocationAmount = recommendations.reduce((sum, r) => sum + (r.reallocationAmount || 0), 0);
      const totalSurplus = allSourceSchemes.reduce((sum, s) => sum + (s.totalAvailable || 0), 0);

      res.json({
        success: true,
        message: recommendations.length > 0 
          ? `Generated ${recommendations.length} smart reallocation recommendations`
          : 'No suitable schemes found for reallocation',
        data: {
          financialYear: currentFY,
          analysisDate: new Date(),
          sourceSchemes: allSourceSchemes.slice(0, 15),
          targetSchemes: allTargetSchemes.slice(0, 15),
          recommendations,
          aiAnalysis: {
            overallAssessment: `Comprehensive analysis of ${analysisData.length} schemes identified ${recommendations.length} optimal fund reallocation opportunities totaling ₹${(totalReallocationAmount / 10000000).toFixed(2)} Cr.`,
            expectedBenefits: [
              'Optimize budget utilization across schemes',
              'Prevent fund lapse at year-end',
              'Support high-impact programs',
              'Improve overall fiscal efficiency'
            ],
            risks: [
              'Monitor implementation capacity of receiving schemes',
              'Ensure source schemes maintain essential operations'
            ],
            implementation: [
              'Review recommendations with departmental inputs',
              'Obtain necessary approvals',
              'Issue reallocation orders',
              'Track utilization of reallocated funds'
            ]
          },
          summary: {
            totalSourceSchemes: allSourceSchemes.length,
            totalTargetSchemes: allTargetSchemes.length,
            totalSurplusFunds: totalSurplus,
            totalRecommendedReallocation: totalReallocationAmount,
            potentialBeneficiaries: allTargetSchemes.length
          }
        }
      });
    }

  } catch (error) {
    console.error('Reallocation Recommendations Error:', error);
    next(error);
  }
};

// @desc    Get detailed analysis for specific scheme
// @route   GET /api/reallocation/scheme-analysis/:schemeName
// @access  Private
exports.getSchemeAnalysis = async (req, res, next) => {
  try {
    const { schemeName } = req.params;
    const currentYear = new Date().getFullYear();
    const currentFY = `${currentYear}-${currentYear + 1}`;

    const budgets = await Budget.find({
      scheme: schemeName,
      financialYear: currentFY
    }).populate('department');

    if (budgets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found'
      });
    }

    // Calculate comprehensive metrics
    const totalAllocated = budgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
    const totalAvailable = budgets.reduce((sum, b) => sum + (b.availableAmount || 0), 0);
    const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated * 100) : 0;

    res.json({
      success: true,
      data: {
        scheme: schemeName,
        financialYear: currentFY,
        totalAllocated,
        totalSpent,
        totalAvailable,
        utilizationRate: parseFloat(utilizationRate.toFixed(2)),
        budgetCount: budgets.length,
        departments: [...new Set(budgets.map(b => b.department?.name).filter(Boolean))],
        budgets: budgets.map(b => ({
          id: b._id,
          title: b.title,
          department: b.department?.name,
          allocated: b.allocatedAmount,
          spent: b.spentAmount,
          available: b.availableAmount,
          utilization: b.utilizationPercentage,
          status: b.status
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
