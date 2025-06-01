const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },

  // Patient-provided info (from modal)
  patientName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  symptoms: {
    type: String,
  },

  // Doctor-provided scheduling
  date: {
    type: String, // will be assigned later by doctor
  },
  time: {
    type: String,
  },

  // Appointment status
  status: {
    type: String,
    enum: ['pending', 'approved', 'cancelled', 'rescheduled'],
    default: 'pending',
  },
  

  prescriptions: [
    {
      date: { type: String, required: true },
      medication: { type: String, required: true },
      instructions: { type: String, required: true },
    }
  ],
  
  labRecords: [
    {
      date: { type: String, required: true },
      testName: { type: String, required: true },
      result: { type: String, required: true },
      remarks: { type: String },
    }
  ],
  
  doctorNotes: [
    {
      date: { type: String, required: true },
      note: { type: String, required: true },
    }
  ],
  
  

  // Optional rescheduling info
  rescheduleInfo: {
    date: String,
    time: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
