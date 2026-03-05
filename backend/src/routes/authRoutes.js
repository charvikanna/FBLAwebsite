const express = require('express');
const passport = require('passport');
const { signup, login, googleCallback, googleFailure } = require('../controllers/authController');

const router = express.Router();
const GOOGLE_AUTH_OPTIONS = {
  scope: ['profile', 'email'],
  session: false
};

router.post('/signup', signup);
router.post('/login', login);

// Initiate Google OAuth (canonical and alias route)
router.get('/google', passport.authenticate('google', GOOGLE_AUTH_OPTIONS));
router.get('/google/start', passport.authenticate('google', GOOGLE_AUTH_OPTIONS));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false
  }),
  googleCallback
);

router.get('/google/failure', googleFailure);

module.exports = router;
