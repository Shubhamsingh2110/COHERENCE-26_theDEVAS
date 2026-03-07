import { useState, useEffect } from 'react';
import { ArrowRightLeft, TrendingDown, TrendingUp, Zap, AlertCircle, CheckCircle, DollarSign, Target, Lightbulb, Shield, RefreshCw } from 'lucide-react';
import { reallocationAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SmartReallocation = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await reallocationAPI.getRecommendations();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching reallocation recommendations:', error);
      alert('Failed to load reallocation recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Analyzing budgets and generating smart reallocation recommendations..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <ArrowRightLeft className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No reallocation data available</p>
        </div>
      </div>
    );
  }

  const { sourceSchemes, targetSchemes, recommendations, aiAnalysis, summary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-primary" />
            Smart Fund Reallocation
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered analysis for optimal budget distribution - FY {data.financialYear}
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Analysis
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Surplus Sources</h3>
          </div>
          <p className="text-4xl font-bold">{summary.totalSourceSchemes || 0}</p>
          <p className="text-sm text-orange-100 mt-1">
            Schemes with available funds
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Target Schemes</h3>
          </div>
          <p className="text-4xl font-bold">{summary.totalTargetSchemes || 0}</p>
          <p className="text-sm text-green-100 mt-1">
            Schemes that can benefit
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Available Surplus</h3>
          </div>
          <p className="text-4xl font-bold">
            ₹{((summary.totalSurplusFunds || 0) / 10000000).toFixed(2)}
          </p>
          <p className="text-sm text-blue-100 mt-1">Crores</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Recommended</h3>
          </div>
          <p className="text-4xl font-bold">
            ₹{((summary.totalRecommendedReallocation || 0) / 10000000).toFixed(2)}
          </p>
          <p className="text-sm text-purple-100 mt-1">Crores to reallocate</p>
        </div>
      </div>

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Strategic Analysis</h2>
              <p className="text-sm text-gray-600">Powered by GPT-3.5-turbo</p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-white rounded-lg border border-indigo-100">
            <h3 className="font-semibold text-gray-900 mb-2">Overall Assessment</h3>
            <p className="text-gray-700">{aiAnalysis.overallAssessment}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expected Benefits */}
            {aiAnalysis.expectedBenefits && aiAnalysis.expectedBenefits.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Expected Benefits
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                  {aiAnalysis.expectedBenefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {aiAnalysis.risks && aiAnalysis.risks.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-red-100">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Risks to Consider
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {aiAnalysis.risks.map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Implementation Steps */}
            {aiAnalysis.implementation && aiAnalysis.implementation.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-blue-100 md:col-span-2">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Implementation Steps
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                  {aiAnalysis.implementation.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reallocation Recommendations */}
      {recommendations && recommendations.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            AI-Recommended Fund Reallocations
          </h2>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-gradient-to-r from-gray-50 to-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(rec.priority)}`}>
                        {rec.priority?.toUpperCase()} PRIORITY
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Shield className={`w-4 h-4 ${getRiskColor(rec.riskLevel)}`} />
                        <span className={`text-sm font-medium ${getRiskColor(rec.riskLevel)}`}>
                          {rec.riskLevel?.toUpperCase()} RISK
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ₹{(rec.reallocationAmount / 10000000).toFixed(2)} Cr
                    </p>
                    <p className="text-sm text-gray-600">{rec.percentage}% of available</p>
                  </div>
                </div>

                {/* From/To Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Source Scheme */}
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold text-orange-900">From (Source)</h4>
                    </div>
                    <p className="font-medium text-gray-900 mb-2">{rec.fromScheme}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Allocated:</span>
                        <span className="font-semibold">₹{(rec.fromDetails.allocated / 10000000).toFixed(2)} Cr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spent:</span>
                        <span className="font-semibold">₹{(rec.fromDetails.spent / 10000000).toFixed(2)} Cr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-orange-600">₹{(rec.fromDetails.available / 10000000).toFixed(2)} Cr</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                        <span className="text-gray-600">Utilization:</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                          {rec.fromDetails.utilizationRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowRightLeft className="w-8 h-8 text-primary" />
                      <p className="text-sm font-semibold text-primary">
                        ₹{(rec.reallocationAmount / 10000000).toFixed(2)} Cr
                      </p>
                    </div>
                  </div>

                  {/* Target Scheme */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">To (Target)</h4>
                    </div>
                    <p className="font-medium text-gray-900 mb-2">{rec.toScheme}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Allocated:</span>
                        <span className="font-semibold">₹{(rec.toDetails.allocated / 10000000).toFixed(2)} Cr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spent:</span>
                        <span className="font-semibold">₹{(rec.toDetails.spent / 10000000).toFixed(2)} Cr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-red-600">₹{(rec.toDetails.available / 10000000).toFixed(2)} Cr</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-green-200">
                        <span className="text-gray-600">Utilization:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          {rec.toDetails.utilizationRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasoning and Impact */}
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-1 text-sm">Reasoning:</h5>
                    <p className="text-sm text-blue-800">{rec.reasoning}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h5 className="font-semibold text-purple-900 mb-1 text-sm">Expected Impact:</h5>
                    <p className="text-sm text-purple-800">{rec.impact}</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedRecommendation(rec)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    Approve Reallocation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Reallocation Needed
          </h3>
          <p className="text-gray-600">
            {sourceSchemes.length === 0 
              ? 'All schemes are performing well with optimal fund utilization.'
              : 'No high-performing schemes found that require additional funding.'}
          </p>
        </div>
      )}

      {/* Source Schemes Table */}
      {sourceSchemes.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            Underutilized Schemes (Potential Sources)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Scheme</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Allocated</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Spent</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Available</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Utilization</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Projected</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sourceSchemes.map((scheme, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{scheme.scheme}</td>
                    <td className="px-4 py-3 text-right text-sm">₹{(scheme.totalAllocated / 10000000).toFixed(2)} Cr</td>
                    <td className="px-4 py-3 text-right text-sm">₹{(scheme.totalSpent / 10000000).toFixed(2)} Cr</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-orange-600">
                      ₹{(scheme.totalAvailable / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                        {scheme.performance.utilizationRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {scheme.performance.projectedUtilization}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Target Schemes Table */}
      {targetSchemes.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            High-Performing Schemes (Need Additional Funds)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Scheme</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Allocated</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Spent</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Available</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Utilization</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Projected</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {targetSchemes.map((scheme, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{scheme.scheme}</td>
                    <td className="px-4 py-3 text-right text-sm">₹{(scheme.totalAllocated / 10000000).toFixed(2)} Cr</td>
                    <td className="px-4 py-3 text-right text-sm">₹{(scheme.totalSpent / 10000000).toFixed(2)} Cr</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                      ₹{(scheme.totalAvailable / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                        {scheme.performance.utilizationRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                        {scheme.performance.projectedUtilization}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartReallocation;
