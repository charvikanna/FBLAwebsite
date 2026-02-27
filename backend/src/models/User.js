const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: null
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null
    },
    profilePicture: {
      type: String,
      default: ''
    },
    progress: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
