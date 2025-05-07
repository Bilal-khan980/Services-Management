const express = require('express');
const { uploadFile, deleteFile } = require('../controllers/fileUpload');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/:folder', uploadFile);
router.delete('/:folder/:fileName', deleteFile);

module.exports = router;
