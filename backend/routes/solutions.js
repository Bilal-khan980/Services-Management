const express = require('express');
const {
  getSolutions,
  getSolution,
  createSolution,
  updateSolution,
  deleteSolution,
  solutionAttachmentUpload
} = require('../controllers/solutions');

const Solution = require('../models/Solution');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router.route('/:id/attachment').put(
  protect,
  authorize('staff', 'admin'),
  solutionAttachmentUpload
);

router
  .route('/')
  .get(
    protect,
    authorize('staff', 'admin'),
    advancedResults(Solution, { path: 'author', select: 'name email' }),
    getSolutions
  )
  .post(protect, authorize('staff', 'admin'), createSolution);

router
  .route('/:id')
  .get(protect, authorize('staff', 'admin'), getSolution)
  .put(protect, authorize('staff', 'admin'), updateSolution)
  .delete(protect, authorize('admin'), deleteSolution);

module.exports = router;
