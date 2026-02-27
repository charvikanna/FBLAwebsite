const User = require('../models/User');

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('email profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      email: user.email,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile.', error: error.message });
  }
}

async function saveProgress(req, res) {
  try {
    const { progress } = req.body;

    if (typeof progress === 'undefined') {
      return res.status(400).json({ message: 'Progress is required.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { progress },
      { new: true, runValidators: true }
    ).select('progress');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'Progress saved successfully.',
      progress: updatedUser.progress
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save progress.', error: error.message });
  }
}

module.exports = {
  getProfile,
  saveProgress
};
