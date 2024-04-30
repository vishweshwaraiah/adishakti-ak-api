const mongoose = require('mongoose');
const Roles = require('@api/_helpers/roles');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: false,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  userMobile: {
    type: String,
    required: true,
  },
  userPassword: {
    type: String,
    required: true,
  },
  userGender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  userDob: {
    type: Date,
    required: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  profileImage: {
    type: String,
    required: false,
  },
  userRole: {
    type: [String, Array],
    required: true,
    default: Roles.User,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
