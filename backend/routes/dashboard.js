const express = require('express');
const mongoose = require('mongoose');
const { getDashboardStats } = require('../controllers/dashboard');
const Ticket = require('../models/Ticket');
const Change = require('../models/Change');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Main dashboard stats route
router.route('/stats').get(protect, getDashboardStats);

// Test route to directly check database counts
router.route('/test-counts').get(protect, async (req, res) => {
  try {
    console.log('Testing direct database counts');

    // Get direct counts from models
    const ticketCount = await Ticket.countDocuments();
    const changeCount = await Change.countDocuments();

    // Check collection names directly from MongoDB
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Check for case sensitivity issues
    const ticketCollectionExists = collectionNames.includes('tickets');
    const ticketsLowerCase = await mongoose.connection.db.collection('tickets').countDocuments();

    // Try different casing to check for case sensitivity issues
    let ticketsUpperCase = 0;
    let ticketsCapitalized = 0;
    try {
      if (collectionNames.includes('Tickets')) {
        ticketsCapitalized = await mongoose.connection.db.collection('Tickets').countDocuments();
      }
      if (collectionNames.includes('TICKETS')) {
        ticketsUpperCase = await mongoose.connection.db.collection('TICKETS').countDocuments();
      }
    } catch (err) {
      console.log('Error checking alternative collection names:', err.message);
    }

    // Get user-specific counts if not admin/staff
    let userTicketCount = ticketCount;
    let userChangeCount = changeCount;

    // Check if user ID is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(req.user.id);
    console.log('User ID:', req.user.id, 'Is valid ObjectId:', isValidObjectId);

    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      // Try both with string ID and ObjectId
      userTicketCount = await Ticket.countDocuments({ user: req.user.id });
      userChangeCount = await Change.countDocuments({ user: req.user.id });

      // Try with explicit ObjectId conversion if valid
      let userTicketCountWithObjectId = 0;
      let userChangeCountWithObjectId = 0;

      if (isValidObjectId) {
        try {
          const userId = new mongoose.Types.ObjectId(req.user.id);
          userTicketCountWithObjectId = await Ticket.countDocuments({ user: userId });
          userChangeCountWithObjectId = await Change.countDocuments({ user: userId });
          console.log('Counts with explicit ObjectId - Tickets:', userTicketCountWithObjectId, 'Changes:', userChangeCountWithObjectId);
        } catch (err) {
          console.error('Error with explicit ObjectId:', err);
        }
      }
    }

    // Get counts with explicit ObjectId if valid
    let userTicketCountWithObjectId = 0;
    let userChangeCountWithObjectId = 0;

    if (isValidObjectId) {
      try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        userTicketCountWithObjectId = await Ticket.countDocuments({ user: userId });
        userChangeCountWithObjectId = await Change.countDocuments({ user: userId });
      } catch (err) {
        console.error('Error with explicit ObjectId in response:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        allTickets: ticketCount,
        allChanges: changeCount,
        userTickets: userTicketCount,
        userChanges: userChangeCount,
        userTicketsWithObjectId: userTicketCountWithObjectId,
        userChangesWithObjectId: userChangeCountWithObjectId,
        userId: req.user.id,
        userRole: req.user.role,
        isValidObjectId,
        collections: collectionNames,
        ticketCollectionExists,
        ticketsLowerCase,
        ticketsCapitalized,
        ticketsUpperCase
      }
    });
  } catch (error) {
    console.error('Error in test-counts route:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
