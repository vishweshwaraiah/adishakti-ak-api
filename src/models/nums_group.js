const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  group_name: {
    type: String,
    required: true,
    unique: true,
  },
  nums_group: {
    type: Array,
    required: true,
  },
});

const NumsGroup = mongoose.model('NumsGroup', groupSchema);

module.exports = NumsGroup;
