const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  menuStyle: {
    type: String,
    required: true,
  },
  appTheme: {
    type: String,
    required: true,
  },
});

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

module.exports = AppSettings;
