const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Knowledge = require('../models/Knowledge');

// @desc      Get all knowledge articles
// @route     GET /api/knowledge
// @access    Private
exports.getKnowledgeArticles = asyncHandler(async (req, res, next) => {
  // Filter articles based on user role and status parameter
  if (req.user.role !== 'admin' && req.user.role !== 'enterprise_admin' && req.user.role !== 'editor') {
    // Regular users can only see published articles
    if (!req.query.status) {
      req.query.status = 'published';
    }
  }

  // Log the query for debugging
  console.log('Knowledge query:', req.query);
  console.log('User role:', req.user.role);

  res.status(200).json(res.advancedResults);
});

// @desc      Get single knowledge article
// @route     GET /api/knowledge/:id
// @access    Private
exports.getKnowledgeArticle = asyncHandler(async (req, res, next) => {
  // Validate ID format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(
      new ErrorResponse(`Invalid article ID format: ${req.params.id}`, 400)
    );
  }

  try {
    const article = await Knowledge.findById(req.params.id).populate({
      path: 'author',
      select: 'name email'
    });

    if (!article) {
      return next(
        new ErrorResponse(`Article not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if article is private and user is not author or admin/editor
    if (
      article.visibility === 'private' &&
      article.author._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'enterprise_admin' &&
      req.user.role !== 'editor'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this article`,
          403
        )
      );
    }

    // Check if article is internal and user is not admin/editor
    if (
      article.visibility === 'internal' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'enterprise_admin' &&
      req.user.role !== 'editor'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this article`,
          403
        )
      );
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (err) {
    console.error(`Error retrieving article: ${err.message}`);
    return next(
      new ErrorResponse(`Error retrieving article: ${err.message}`, 500)
    );
  }
});

// @desc      Create new knowledge article
// @route     POST /api/knowledge
// @access    Private/Staff/Admin
exports.createKnowledgeArticle = asyncHandler(async (req, res, next) => {
  // Add author to req.body
  req.body.author = req.user.id;

  let article = await Knowledge.create(req.body);

  // Populate the author field before sending the response
  article = await Knowledge.findById(article._id).populate({
    path: 'author',
    select: 'name email'
  });

  res.status(201).json({
    success: true,
    data: article
  });
});

// @desc      Update knowledge article
// @route     PUT /api/knowledge/:id
// @access    Private/Staff/Admin
exports.updateKnowledgeArticle = asyncHandler(async (req, res, next) => {
  let article = await Knowledge.findById(req.params.id);

  if (!article) {
    return next(
      new ErrorResponse(`Article not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is article author or admin
  if (
    article.author.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this article`,
        401
      )
    );
  }

  article = await Knowledge.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate({
    path: 'author',
    select: 'name email'
  });

  res.status(200).json({
    success: true,
    data: article
  });
});

// @desc      Delete knowledge article
// @route     DELETE /api/knowledge/:id
// @access    Private/Staff/Admin
exports.deleteKnowledgeArticle = asyncHandler(async (req, res, next) => {
  const article = await Knowledge.findById(req.params.id);

  if (!article) {
    return next(
      new ErrorResponse(`Article not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is article author or admin
  if (
    article.author.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this article`,
        401
      )
    );
  }

  await article.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Upload attachment to knowledge article
// @route     PUT /api/knowledge/:id/attachment
// @access    Private/Staff/Admin
exports.knowledgeAttachmentUpload = asyncHandler(async (req, res, next) => {
  const article = await Knowledge.findById(req.params.id);

  if (!article) {
    return next(
      new ErrorResponse(`Article not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is article author or admin
  if (
    article.author.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this article`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the file is not too large
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a file less than ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `knowledge_${article._id}_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/knowledge/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Add file to article attachments
    article.attachments.push({
      name: file.name,
      path: `/uploads/knowledge/${file.name}`,
      contentType: file.mimetype,
      size: file.size
    });

    await article.save();

    // Populate the author field before sending the response
    const populatedArticle = await Knowledge.findById(article._id).populate({
      path: 'author',
      select: 'name email'
    });

    res.status(200).json({
      success: true,
      data: populatedArticle
    });
  });
});

// @desc      Vote on knowledge article
// @route     PUT /api/knowledge/:id/vote
// @access    Private
exports.voteKnowledgeArticle = asyncHandler(async (req, res, next) => {
  const { vote } = req.body;

  if (!vote || (vote !== 'up' && vote !== 'down')) {
    return next(new ErrorResponse(`Please provide a valid vote (up/down)`, 400));
  }

  const article = await Knowledge.findById(req.params.id);

  if (!article) {
    return next(
      new ErrorResponse(`Article not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has already voted
  const existingVote = article.votes.voters.find(
    voter => voter.user.toString() === req.user.id
  );

  if (existingVote) {
    // Update existing vote
    if (existingVote.vote === vote) {
      return next(new ErrorResponse(`You have already voted ${vote}`, 400));
    }

    // Change vote
    if (existingVote.vote === 'up') {
      article.votes.upvotes -= 1;
    } else {
      article.votes.downvotes -= 1;
    }

    existingVote.vote = vote;
    existingVote.votedAt = Date.now();
  } else {
    // Add new vote
    article.votes.voters.push({
      user: req.user.id,
      vote,
      votedAt: Date.now()
    });
  }

  // Update vote count
  if (vote === 'up') {
    article.votes.upvotes += 1;
  } else {
    article.votes.downvotes += 1;
  }

  await article.save();

  // Populate the author field before sending the response
  const populatedArticle = await Knowledge.findById(article._id).populate({
    path: 'author',
    select: 'name email'
  });

  res.status(200).json({
    success: true,
    data: populatedArticle
  });
});

// @desc      Get suggested articles based on keywords
// @route     GET /api/knowledge/suggest
// @access    Private
exports.getSuggestedArticles = asyncHandler(async (req, res, next) => {
  const { keywords } = req.query;

  if (!keywords) {
    return next(new ErrorResponse(`Please provide keywords`, 400));
  }

  // Create text search query
  const articles = await Knowledge.find(
    {
      $text: { $search: keywords },
      status: 'published',
      $or: [
        { visibility: 'public' },
        ...(req.user.role === 'admin' || req.user.role === 'enterprise_admin' || req.user.role === 'editor'
          ? [{ visibility: 'internal' }]
          : []),
        { visibility: 'private', author: req.user.id }
      ]
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5)
    .populate({
      path: 'author',
      select: 'name'
    });

  res.status(200).json({
    success: true,
    count: articles.length,
    data: articles
  });
});
