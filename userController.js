const Appointment = require('../models/AppointmentModel');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientName, age, contactNumber, email, symptoms } = req.body;

    if (!doctorId || !patientName || !age || !contactNumber || !email) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const appointment = new Appointment({
      userId: req.user.id,
      doctorId,
      patientName,
      age,
      contactNumber,
      email,
      symptoms,
      status: 'pending' // initial status
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully" });

  } catch (error) {
    console.error("Appointment booking error:", error);
    res.status(500).json({ message: "Error booking appointment", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get personal info
    const user = await User.findById(userId).select('-password'); // exclude password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all appointments booked by this user
    const appointments = await Appointment.find({ userId })
      .sort({ createdAt: -1 }) // optional: latest first
      .populate('doctorId', 'name specialization'); // adjust fields if needed

    res.status(200).json({
      user,
      appointments,
    });

  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: 'Server error fetching profile data' });
  }
};

module.exports = {
  bookAppointment,
  getUserProfile,
};