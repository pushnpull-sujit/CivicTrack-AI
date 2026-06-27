const db = require('../config/db');

const analyticsController = {
  async getSummary(req, res) {
    try {
      const complaints = await db.complaints.find({});

      const total = complaints.length;
      let pending = 0;
      let completed = 0;
      let inProgress = 0;
      let verified = 0;
      let pendingCount = 0; // Raw pending (non-completed)

      let totalRepairTimeMs = 0;
      let completedWithTimeCount = 0;
      let totalCost = 0;

      // Group counts
      const categoryCounts = {};
      const priorityCounts = {};
      const monthlySubmitted = {};
      const categoryCosts = {};

      complaints.forEach(c => {
        // Status counts
        if (c.status === 'Completed') {
          completed++;
          if (c.completionDate && c.createdAt) {
            const duration = new Date(c.completionDate) - new Date(c.createdAt);
            totalRepairTimeMs += duration;
            completedWithTimeCount++;
          }
          if (c.repairCost) {
            totalCost += c.repairCost;
            categoryCosts[c.category] = (categoryCosts[c.category] || 0) + c.repairCost;
          }
        } else {
          pendingCount++;
          if (c.status === 'Pending') pending++;
          if (c.status === 'In Progress') inProgress++;
          if (c.status === 'Verified') verified++;
        }

        // Category counts
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;

        // Priority counts
        priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;

        // Monthly trends (group by Year-Month)
        const dateObj = new Date(c.createdAt);
        const yearMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        monthlySubmitted[yearMonth] = (monthlySubmitted[yearMonth] || 0) + 1;
      });

      // Calculate averages (in hours)
      const avgRepairTimeHours = completedWithTimeCount > 0 
        ? Math.round((totalRepairTimeMs / (1000 * 60 * 60)) / completedWithTimeCount * 10) / 10 
        : 0;

      // Format monthly trends for charts
      const monthlyData = Object.keys(monthlySubmitted).map(month => ({
        month,
        count: monthlySubmitted[month]
      })).sort((a, b) => a.month.localeCompare(b.month));

      // Format category performance
      const categoryData = Object.keys(categoryCounts).map(cat => {
        const catComplaints = complaints.filter(c => c.category === cat);
        const catCompleted = catComplaints.filter(c => c.status === 'Completed').length;
        const catPending = catComplaints.length - catCompleted;
        return {
          category: cat,
          total: catComplaints.length,
          completed: catCompleted,
          pending: catPending,
          cost: categoryCosts[cat] || 0
        };
      });

      res.json({
        summary: {
          total,
          pending: pendingCount, // total outstanding items
          pendingRaw: pending,   // items in 'Pending' state
          verified,
          inProgress,
          completed,
          averageRepairTimeHours,
          totalCost
        },
        categoryData,
        priorityCounts,
        monthlyData
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
      res.status(500).json({ message: 'Server error fetching analytics' });
    }
  }
};

module.exports = analyticsController;
