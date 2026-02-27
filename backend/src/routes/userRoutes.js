const express = require('express');
const verifyToken = require('../middleware/auth');
const { getProfile, saveProgress } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.post('/progress', verifyToken, saveProgress);

module.exports = router;
