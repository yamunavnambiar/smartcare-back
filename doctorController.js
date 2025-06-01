const Doctor = require('../models/Doctor');

// doctorController.js
exports.addDoctor = async (req, res) => {
    try {
      const { name, specialization, availability, photo, description } = req.body;
  
      // Optional: check for duplicates
      const existing = await Doctor.findOne({ name, specialization });
      if (existing) {
        return res.status(400).json({ message: 'Doctor already exists' });
      }
  
      const doctor = new Doctor({
        name,
        specialization,
        availability,
        photo,
        description,
      });
  
      await doctor.save();
      res.status(201).json({ message: 'Doctor added successfully', doctor });
    } catch (error) {
      res.status(500).json({ message: 'Error adding doctor', error: error.message });
    }
  };
  
  
// Get All Doctors
exports.getAllDoctors = async (req, res) => {
    try {
      const doctors = await Doctor.find(); // Fetch all doctors from DB
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
  };

// Update Doctor
exports.updateDoctor = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, specialization, availability, photo, description } = req.body;
  
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        id,
        { name, specialization, availability , photo, description },
        { new: true }
      );
  
      if (!updatedDoctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      res.status(200).json({ message: 'Doctor updated', doctor: updatedDoctor });
    } catch (error) {
      res.status(500).json({ message: 'Error updating doctor', error: error.message });
    }
  };
// Delete Doctor
exports.deleteDoctor = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedDoctor = await Doctor.findByIdAndDelete(id);
  
      if (!deletedDoctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting doctor', error: error.message });
    }
  };
    