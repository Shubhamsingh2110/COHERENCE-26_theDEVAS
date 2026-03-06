const Anomaly = require('../models/Anomaly');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { detectAnomalies } = require('../services/anomalyDetector');

// @desc    Get all anomalies
// @route   GET /api/anomalies
// @access  Private
exports.getAnomalies = async (req, res, next) => {
  try {
    const { status, riskLevel, type, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (type) filter.type = type;
    
    if (startDate || endDate) {
      filter.detectedDate = {};
      if (startDate) filter.detectedDate.$gte = new Date(startDate);
      if (endDate) filter.detectedDate.$lte = new Date(endDate);
    }

    const anomalies = await Anomaly.find(filter)
      .populate('transaction', 'transactionId amount description')
      .populate('budget', 'title scheme')
      .populate('investigatedBy', 'name email')
      .sort({ detectedDate: -1 });

    res.json({
      success: true,
      count: anomalies.length,
      data: anomalies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get anomaly by ID
// @route   GET /api/anomalies/:id
// @access  Private
exports.getAnomalyById = async (req, res, next) => {
  try {
    const anomaly = await Anomaly.findById(req.params.id)
      .populate('transaction')
      .populate('budget')
      .populate('investigatedBy', 'name email')
      .populate('relatedAnomalies');

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json({
      success: true,
      data: anomaly
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run anomaly detection
// @route   GET /api/anomalies/detect
// @access  Private
exports.runAnomalyDetection = async (req, res, next) => {
  try {
    const { budgetId, days = 30 } = req.query;

    // Get transactions for analysis
    const filter = {
      transactionDate: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };

    if (budgetId) filter.budget = budgetId;

    const transactions = await Transaction.find(filter).populate('budget');

    // Run anomaly detection
    const detectedAnomalies = await detectAnomalies(transactions);

    // Save new anomalies
    const savedAnomalies = await Promise.all(
      detectedAnomalies.map(anomaly => Anomaly.create(anomaly))
    );

    res.json({
      success: true,
      message: `Detected ${savedAnomalies.length} anomalies`,
      data: savedAnomalies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get high-risk anomalies
// @route   GET /api/anomalies/high-risk
// @access  Private
exports.getHighRiskAnomalies = async (req, res, next) => {
  try {
    const anomalies = await Anomaly.find({
      status: 'open',
      riskLevel: { $in: ['high', 'critical'] }
    })
      .populate('transaction', 'transactionId amount description')
      .populate('budget', 'title scheme')
      .sort({ confidence: -1, amount: -1 })
      .limit(20);

    res.json({
      success: true,
      count: anomalies.length,
      data: anomalies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update anomaly status
// @route   PUT /api/anomalies/:id
// @access  Private
exports.updateAnomaly = async (req, res, next) => {
  try {
    const { status, investigationNotes, resolution } = req.body;

    const updateData = { status };
    if (investigationNotes) updateData.investigationNotes = investigationNotes;
    if (resolution) updateData.resolution = resolution;
    if (status === 'resolved') updateData.resolvedDate = new Date();
    
    updateData.investigatedBy = req.user.userId;

    const anomaly = await Anomaly.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json({
      success: true,
      message: 'Anomaly updated successfully',
      data: anomaly
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark anomaly as resolved
// @route   PUT /api/anomalies/:id/resolve
// @access  Private
exports.resolveAnomaly = async (req, res, next) => {
  try {
    const { resolution } = req.body;

    const anomaly = await Anomaly.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolution,
        resolvedDate: new Date(),
        investigatedBy: req.user.userId
      },
      { new: true }
    );

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json({
      success: true,
      message: 'Anomaly resolved successfully',
      data: anomaly
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get anomaly statistics
// @route   GET /api/anomalies/stats
// @access  Private
exports.getAnomalyStats = async (req, res, next) => {
  try {
    // Count by status
    const statusCounts = await Anomaly.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count by risk level
    const riskCounts = await Anomaly.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count by type
    const typeCounts = await Anomaly.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Average resolution time for resolved anomalies
    const avgResolutionTime = await Anomaly.aggregate([
      {
        $match: { status: 'resolved', resolvedDate: { $exists: true } }
      },
      {
        $project: {
          resolutionDays: {
            $divide: [
              { $subtract: ['$resolvedDate', '$detectedDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$resolutionDays' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: statusCounts,
        byRiskLevel: riskCounts,
        byType: typeCounts,
        avgResolutionDays: avgResolutionTime[0]?.avgDays?.toFixed(2) || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
