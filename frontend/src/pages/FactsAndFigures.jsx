import { useState, useEffect } from 'react';
import { FileText, PieChart, TrendingUp, DollarSign, Clock, CheckCircle, AlertTriangle, Download, Eye, Package, ArrowRight } from 'lucide-react';
import { factsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FactsAndFigures = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [factSheetData, setFactSheetData] = useState(null);
  const [loadingFactSheet, setLoadingFactSheet] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'factsheet'

  useEffect(() => {
    fetchSchemeStatistics();
  }, []);

  const fetchSchemeStatistics = async () => {
    try {
      setLoading(true);
      const response = await factsAPI.getSchemeStatistics();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching scheme statistics:', error);
      alert('Failed to load scheme statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchFactSheet = async (schemeName) => {
    try {
      setLoadingFactSheet(true);
      const response = await factsAPI.getSchemeFactSheet(schemeName);
      setFactSheetData(response.data);
      setSelectedScheme(schemeName);
      setActiveTab('factsheet');
    } catch (error) {
      console.error('Error fetching fact sheet:', error);
      alert('Failed to load scheme fact sheet');
    } finally {
      setLoadingFactSheet(false);
    }
  };

  const exportToPDF = () => {
    alert('PDF Export functionality - To be implemented with jsPDF library');
  };

  const exportToPPT = () => {
    alert('PPT Export functionality - To be implemented with PptxGenJS library');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading facts and figures..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const { overallStats, schemes, financialYear } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <PieChart className="w-8 h-8 text-primary" />
            Facts & Figures
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive scheme-wise budget statistics for FY {financialYear}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={exportToPPT}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PPT
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview & Statistics
        </button>
        <button
          onClick={() => setActiveTab('factsheet')}
          disabled={!selectedScheme}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'factsheet' && selectedScheme
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          } ${!selectedScheme ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {selectedScheme ? `Fact Sheet: ${selectedScheme}` : 'Select a scheme to view fact sheet'}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Overall Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8" />
                <h3 className="text-lg font-semibold">Total Schemes</h3>
              </div>
              <p className="text-4xl font-bold">{overallStats.totalSchemes}</p>
              <p className="text-sm text-blue-100 mt-1">
                Across {overallStats.totalBudgets} budgets
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8" />
                <h3 className="text-lg font-semibold">Total Allocated</h3>
              </div>
              <p className="text-4xl font-bold">
                ₹{(overallStats.grandTotalAllocated / 10000000).toFixed(2)}
              </p>
              <p className="text-sm text-green-100 mt-1">Crores</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8" />
                <h3 className="text-lg font-semibold">Total Spent</h3>
              </div>
              <p className="text-4xl font-bold">
                ₹{(overallStats.grandTotalSpent / 10000000).toFixed(2)}
              </p>
              <p className="text-sm text-purple-100 mt-1">
                {overallStats.overallUtilization}% Utilization
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-8 h-8" />
                <h3 className="text-lg font-semibold">Total Pending</h3>
              </div>
              <p className="text-4xl font-bold">
                ₹{(overallStats.grandTotalPending / 10000000).toFixed(2)}
              </p>
              <p className="text-sm text-orange-100 mt-1">Crores</p>
            </div>
          </div>

          {/* Scheme-wise Statistics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Scheme-wise Budget Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Scheme Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Departments
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Budgets
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Allocated
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Spent
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Pending
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Utilization
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schemes.map((scheme, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {scheme.scheme}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {scheme.departments.join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {scheme.budgetCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{(scheme.totalAllocated / 10000000).toFixed(2)} Cr
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-semibold text-green-600">
                          ₹{(scheme.totalSpent / 10000000).toFixed(2)} Cr
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-semibold text-orange-600">
                          ₹{(scheme.totalPending / 10000000).toFixed(2)} Cr
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-full max-w-[100px]">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  scheme.utilizationRate >= 80
                                    ? 'bg-green-500'
                                    : scheme.utilizationRate >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(scheme.utilizationRate, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {scheme.utilizationRate}%
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs">
                            <CheckCircle className="w-3 h-3 inline text-green-600" />{' '}
                            {scheme.status.active} Active
                          </span>
                          <span className="text-xs">
                            <Clock className="w-3 h-3 inline text-yellow-600" />{' '}
                            {scheme.status.completed} Done
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => fetchFactSheet(scheme.scheme)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm mx-auto"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Fact Sheet Tab */}
      {activeTab === 'factsheet' && selectedScheme && (
        <>
          {loadingFactSheet ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner text="Loading fact sheet..." />
            </div>
          ) : factSheetData ? (
            <>
              {/* Fact Sheet Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Fact Sheet: {factSheetData.scheme}
                    </h2>
                    <p className="text-indigo-100">
                      Financial Year: {factSheetData.financialYear}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Back to Overview
                  </button>
                </div>
              </div>

              {/* Key Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">Total Budgets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {factSheetData.statistics.totalBudgets}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-4">
                  <p className="text-sm text-green-600">Total Allocated</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{(factSheetData.statistics.totalAllocated / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg shadow p-4">
                  <p className="text-sm text-blue-600">Total Spent</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₹{(factSheetData.statistics.totalSpent / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg shadow p-4">
                  <p className="text-sm text-orange-600">Total Pending</p>
                  <p className="text-2xl font-bold text-orange-700">
                    ₹{(factSheetData.statistics.totalPending / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg shadow p-4">
                  <p className="text-sm text-purple-600">Utilization Rate</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {factSheetData.statistics.utilizationRate}%
                  </p>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Status Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Active Budgets</span>
                      <span className="font-semibold text-green-600">
                        {factSheetData.statistics.statusBreakdown.active}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Completed</span>
                      <span className="font-semibold text-blue-600">
                        {factSheetData.statistics.statusBreakdown.completed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">On Hold</span>
                      <span className="font-semibold text-yellow-600">
                        {factSheetData.statistics.statusBreakdown.onHold}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Under Review</span>
                      <span className="font-semibold text-orange-600">
                        {factSheetData.statistics.statusBreakdown.underReview}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">High Utilization (&gt;80%)</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        {factSheetData.statistics.riskAnalysis.highUtilization}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="text-gray-700">Low Utilization (&lt;30%)</span>
                      </div>
                      <span className="font-semibold text-red-600">
                        {factSheetData.statistics.riskAnalysis.lowUtilization}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <span className="text-gray-700">Near Expiry (&lt;30 days)</span>
                      </div>
                      <span className="font-semibold text-orange-600">
                        {factSheetData.statistics.riskAnalysis.nearExpiry}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">Total Transactions</span>
                      </div>
                      <span className="font-semibold text-blue-600">
                        {factSheetData.statistics.transactionCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Details Table */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Budget Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Budget Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Department
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Allocated
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Spent
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Pending
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                          Utilization
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                          Days Left
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {factSheetData.budgets.map((budget) => (
                        <tr key={budget.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {budget.title}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {budget.department}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            ₹{(budget.allocated / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                            ₹{(budget.spent / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-orange-600">
                            ₹{(budget.pending / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              budget.utilization >= 80 ? 'bg-green-100 text-green-800' :
                              budget.utilization >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {budget.utilization}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              budget.status === 'active' ? 'bg-green-100 text-green-800' :
                              budget.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              budget.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {budget.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {budget.daysRemaining || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Transactions */}
              {factSheetData.recentTransactions && factSheetData.recentTransactions.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Recent Transactions (Last 50)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Transaction ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Beneficiary
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {factSheetData.recentTransactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {txn.transactionId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {txn.description}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              ₹{txn.amount?.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {txn.beneficiary || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(txn.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                                txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {txn.status?.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No fact sheet data available</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FactsAndFigures;
