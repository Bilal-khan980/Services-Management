const express = require('express');
const {
  getKnowledgeArticles,
  getKnowledgeArticle,
  createKnowledgeArticle,
  updateKnowledgeArticle,
  deleteKnowledgeArticle,
  knowledgeAttachmentUpload,
  voteKnowledgeArticle,
  getSuggestedArticles
} = require('../controllers/knowledge');

const Knowledge = require('../models/Knowledge');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router.route('/suggest').get(protect, getSuggestedArticles);

router.route('/:id/attachment').put(
  protect,
  authorize('editor', 'enterprise_admin', 'user'), // Admin users are not allowed to upload attachments
  knowledgeAttachmentUpload
);

router.route('/:id/vote').put(protect, voteKnowledgeArticle);

router
  .route('/')
  .get(
    protect,
    advancedResults(Knowledge, { path: 'author', select: 'name email' }),
    getKnowledgeArticles
  )
  .post(protect, authorize('editor', 'enterprise_admin'), createKnowledgeArticle);

router
  .route('/:id')
  .get(protect, getKnowledgeArticle)
  .put(protect, authorize('editor', 'enterprise_admin'), updateKnowledgeArticle)
  .delete(protect, authorize('enterprise_admin'), deleteKnowledgeArticle);

module.exports = router;
