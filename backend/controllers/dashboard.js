const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const Ticket = require('../models/Ticket');
const Change = require('../models/Change');
const Knowledge = require('../models/Knowledge');
const Solution = require('../models/Solution');
const User = require('../models/User');

// @desc      Get dashboard statistics
// @route     GET /api/dashboard/stats
// @access    Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  console.log('Getting dashboard stats for user:', req.user.id, 'with role:', req.user.role);

  // Get ticket statistics
  const ticketStats = {
    total: await Ticket.countDocuments(),
    new: await Ticket.countDocuments({ status: 'new' }),
    inProgress: await Ticket.countDocuments({ status: 'in-progress' }),
    resolved: await Ticket.countDocuments({ status: 'resolved' })
  };
  console.log('All tickets stats:', ticketStats);

  // Get change statistics
  const changeStats = {
    total: await Change.countDocuments(),
    pending: await Change.countDocuments({
      status: { $in: ['draft', 'submitted', 'under-review'] }
    }),
    approved: await Change.countDocuments({ status: 'approved' }),
    implemented: await Change.countDocuments({ status: 'implemented' })
  };
  console.log('All changes stats:', changeStats);

  // Get knowledge statistics
  const knowledgeStats = {
    total: await Knowledge.countDocuments()
  };

  // Get solution statistics
  const solutionStats = {
    total: await Solution.countDocuments()
  };

  // If user is not admin, staff, or editor, only show their tickets and changes
  if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.role !== 'editor' && req.user.role !== 'enterprise_admin') {
    console.log('User is a regular user, filtering stats for user:', req.user.id);

    // Always use mongoose.Types.ObjectId for consistency
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.user.id);
    } catch (err) {
      console.error('Error converting user ID to ObjectId:', err);
      // If conversion fails, use the string ID as fallback
      userId = req.user.id;
    }

    // Create a proper query filter
    const userFilter = { user: userId };

    // Get user-specific ticket stats
    ticketStats.total = await Ticket.countDocuments(userFilter);
    ticketStats.new = await Ticket.countDocuments({
      ...userFilter,
      status: 'new'
    });
    ticketStats.inProgress = await Ticket.countDocuments({
      ...userFilter,
      status: 'in-progress'
    });
    ticketStats.resolved = await Ticket.countDocuments({
      ...userFilter,
      status: 'resolved'
    });
    console.log('User-specific ticket stats:', ticketStats);

    // Get user-specific change stats
    changeStats.total = await Change.countDocuments(userFilter);
    changeStats.pending = await Change.countDocuments({
      ...userFilter,
      status: { $in: ['draft', 'submitted', 'under-review'] }
    });
    changeStats.approved = await Change.countDocuments({
      ...userFilter,
      status: 'approved'
    });
    changeStats.implemented = await Change.countDocuments({
      ...userFilter,
      status: 'implemented'
    });
    console.log('User-specific change stats:', changeStats);
  } else {
    console.log('User is admin/staff, showing all stats');
  }

  // Get recent activity (last 10 items)
  console.log('Fetching recent activity...');

  // Get recent tickets
  const recentTickets = await Ticket.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title status priority createdAt')
    .populate({
      path: 'user',
      select: 'name'
    });

  // Get recent changes
  const recentChanges = await Change.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title status priority createdAt')
    .populate({
      path: 'user',
      select: 'name'
    });

  // Get recent knowledge articles
  const recentKnowledge = await Knowledge.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title status createdAt')
    .populate({
      path: 'author',
      select: 'name'
    });

  // Combine and sort all recent activity
  const recentActivity = [
    ...recentTickets.map(item => ({
      id: item._id,
      type: 'ticket',
      title: item.title,
      status: item.status,
      priority: item.priority,
      createdAt: item.createdAt,
      user: item.user?.name || 'Unknown User'
    })),
    ...recentChanges.map(item => ({
      id: item._id,
      type: 'change',
      title: item.title,
      status: item.status,
      priority: item.priority,
      createdAt: item.createdAt,
      user: item.user?.name || 'Unknown User'
    })),
    ...recentKnowledge.map(item => ({
      id: item._id,
      type: 'knowledge',
      title: item.title,
      status: item.status,
      createdAt: item.createdAt,
      user: item.author?.name || 'Unknown User'
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

  console.log(`Found ${recentActivity.length} recent activity items`);

  const responseData = {
    success: true,
    data: {
      tickets: ticketStats,
      changes: changeStats,
      knowledge: knowledgeStats,
      solutions: solutionStats,
      recentActivity
    }
  };

  console.log('Sending dashboard stats response:', responseData);
  res.status(200).json(responseData);
});
