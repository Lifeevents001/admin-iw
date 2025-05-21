const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // Country Name
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
