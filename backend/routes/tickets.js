const express = require('express');
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  ticketAttachmentUpload
} = require('../controllers/tickets');

const Ticket = require('../models/Ticket');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router.route('/:id/attachment').put(protect, ticketAttachmentUpload);

router
  .route('/')
  .get(
    protect,
    advancedResults(Ticket, [
      { path: 'user', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]),
    getTickets
  )
  .post(protect, createTicket);

router
  .route('/:id')
  .get(protect, getTicket)
  .put(protect, updateTicket)
  .delete(protect, authorize('admin'), deleteTicket);

module.exports = router;
