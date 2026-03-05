const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function signup(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      profilePicture: '',
      progress: {}
    });

    const token = signToken(user);

    return res.status(201).json({
      message: 'Signup successful.',
      token,
      user: {
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed.', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
}

function googleCallback(req, res) {
  const user = req.user;
  const token = signToken(user);

  const frontendUrl = process.env.FRONTEND_URL;

  if (frontendUrl && frontendUrl.trim()) {
    try {
      const redirectUrl = new URL(frontendUrl);
      redirectUrl.searchParams.set('token', token);
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      return res.status(500).json({
        message: 'Invalid FRONTEND_URL configuration.',
        error: error.message
      });
    }
  }

  return res.status(200).json({
    message: 'Google login successful. Configure FRONTEND_URL to enable automatic redirect.',
    token,
    user: {
      email: user.email,
      profilePicture: user.profilePicture
    }
  });
}

function googleFailure(req, res) {
  return res.status(401).json({ message: 'Google authentication failed.' });
}

module.exports = {
  signup,
  login,
  googleCallback,
  googleFailure
};
