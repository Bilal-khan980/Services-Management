const asyncHandler = require('../middleware/async');
const Ticket = require('../models/Ticket');
const Change = require('../models/Change');
const Knowledge = require('../models/Knowledge');
const Solution = require('../models/Solution');

// @desc      Get dashboard statistics
// @route     GET /api/dashboard/stats
// @access    Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get ticket statistics
  const ticketStats = {
    total: await Ticket.countDocuments(),
    new: await Ticket.countDocuments({ status: 'new' }),
    inProgress: await Ticket.countDocuments({ status: 'in-progress' }),
    resolved: await Ticket.countDocuments({ status: 'resolved' })
  };

  // Get change statistics
  const changeStats = {
    total: await Change.countDocuments(),
    pending: await Change.countDocuments({ 
      status: { $in: ['draft', 'submitted', 'under-review'] } 
    }),
    approved: await Change.countDocuments({ status: 'approved' }),
    implemented: await Change.countDocuments({ status: 'implemented' })
  };

  // Get knowledge statistics
  const knowledgeStats = {
    total: await Knowledge.countDocuments()
  };

  // Get solution statistics
  const solutionStats = {
    total: await Solution.countDocuments()
  };

  // If user is not admin or staff, only show their tickets and changes
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    ticketStats.total = await Ticket.countDocuments({ user: req.user.id });
    ticketStats.new = await Ticket.countDocuments({ 
      user: req.user.id,
      status: 'new'
    });
    ticketStats.inProgress = await Ticket.countDocuments({ 
      user: req.user.id,
      status: 'in-progress'
    });
    ticketStats.resolved = await Ticket.countDocuments({ 
      user: req.user.id,
      status: 'resolved'
    });

    changeStats.total = await Change.countDocuments({ user: req.user.id });
    changeStats.pending = await Change.countDocuments({ 
      user: req.user.id,
      status: { $in: ['draft', 'submitted', 'under-review'] } 
    });
    changeStats.approved = await Change.countDocuments({ 
      user: req.user.id,
      status: 'approved'
    });
    changeStats.implemented = await Change.countDocuments({ 
      user: req.user.id,
      status: 'implemented'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      tickets: ticketStats,
      changes: changeStats,
      knowledge: knowledgeStats,
      solutions: solutionStats
    }
  });
});
