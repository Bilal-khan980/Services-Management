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
  authorize('editor', 'enterprise_admin'),
  solutionAttachmentUpload
);

router
  .route('/')
  .get(
    protect,
    authorize('editor', 'enterprise_admin'),
    advancedResults(Solution, { path: 'author', select: 'name email' }),
    getSolutions
  )
  .post(protect, authorize('editor', 'enterprise_admin'), createSolution);

router
  .route('/:id')
  .get(protect, authorize('editor', 'enterprise_admin'), getSolution)
  .put(protect, authorize('editor', 'enterprise_admin'), updateSolution)
  .delete(protect, authorize('enterprise_admin'), deleteSolution);

module.exports = router;
