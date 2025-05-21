const mongoose = require('mongoose');

const occupationSchema = new mongoose.Schema({
  name: { type: String, required: true } // Occupation Name
});

const sectorSchema = new mongoose.Schema({
  sector: { type: String, required: true, unique: true }, // Job Sector Name
  occupations: [occupationSchema] // Array of occupations under the sector
});

const JobSector = mongoose.model('JobSector', sectorSchema);

module.exports = JobSector;
