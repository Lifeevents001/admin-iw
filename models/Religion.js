const mongoose = require('mongoose');

const ReligionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  castes: [
    {
      name: {
        type: String,
        required: true
      }
    }
  ]
});

const Religion = mongoose.model('Religion', ReligionSchema);

module.exports = Religion;