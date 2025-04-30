const express = require('express');
const {
  getChanges,
  getChange,
  createChange,
  updateChange,
  deleteChange,
  changeAttachmentUpload
} = require('../controllers/changes');

const Change = require('../models/Change');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router.route('/:id/attachment').put(protect, changeAttachmentUpload);

router
  .route('/')
  .get(
    protect,
    advancedResults(Change, [
      { path: 'user', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'reviewers.user', select: 'name email' }
    ]),
    getChanges
  )
  .post(protect, createChange);

router
  .route('/:id')
  .get(protect, getChange)
  .put(protect, updateChange)
  .delete(protect, authorize('admin'), deleteChange);

module.exports = router;
