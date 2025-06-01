// models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  availability: { type: String, required: true },
  description: { type: String, default: "", },
  photo: { type: String, default: "", },
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
