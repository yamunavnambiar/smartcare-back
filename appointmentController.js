const Appointment = require('../models/AppointmentModel');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Helper to get next available date and time slot
const getNextAvailableSlot = async (doctorId) => {
  const startHour = 10;
  const endHour = 17;

  // Start from the next day
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour}:00`;
      const dateStr = currentDate.toISOString().split('T')[0]; // yyyy-mm-dd

      const isBooked = await Appointment.findOne({
        doctorId,
        date: dateStr,
        time: timeSlot,
        status: { $in: ['approved', 'rescheduled'] }
      });

      if (!isBooked) {
        return { date: dateStr, time: timeSlot };
      }
    }
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'fullName email')
      .populate('doctorId', 'name specialization');

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

// Auto-assign time and approve
exports.approveAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending appointments can be approved' });
    }

    // Generate next available slot (same logic as before)
    const doctorId = appointment.doctorId;
    const workingHours = Array.from({ length: 7 }, (_, i) => 10 + i); // 10 AM to 5 PM

    let date = new Date();
    date.setDate(date.getDate() + 1); // Start from tomorrow
    let assigned = false;

    while (!assigned) {
      for (let hour of workingHours) {
        const timeStr = `${hour}:00`;

        const isTaken = await Appointment.findOne({
          doctorId,
          date: date.toISOString().split('T')[0],
          time: timeStr,
          status: { $in: ['approved', 'rescheduled'] }
        });

        if (!isTaken) {
          appointment.date = date.toISOString().split('T')[0];
          appointment.time = timeStr;
          appointment.status = 'approved';
          await appointment.save();
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        date.setDate(date.getDate() + 1);
      }
    }

    res.json({ message: 'Appointment approved and slot assigned successfully' });
  } catch (err) {
    console.error('Error approving appointment:', err);
    res.status(500).json({ error: 'Server error during approval' });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Appointment not found' });

    res.status(200).json({ message: 'Appointment cancelled', appointment: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: 'New date and time required' });
    }

    const existing = await Appointment.findOne({
      doctorId: (await Appointment.findById(id)).doctorId,
      date,
      time,
      status: { $in: ['approved', 'rescheduled'] }
    });

    if (existing) {
      return res.status(400).json({ message: 'Selected slot already booked' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      {
        status: 'rescheduled',
        rescheduleInfo: { date, time },
        date,
        time,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Appointment not found' });

    res.status(200).json({ message: 'Appointment rescheduled', appointment: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error rescheduling appointment', error: error.message });
  }
};

exports.getTodaysAppointments = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

    const appointments = await Appointment.find({ date: today })
      .populate('userId', 'fullName email')
      .populate('doctorId', 'name specialization');

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ message: "Failed to fetch today's appointments" });
  }
};

exports.getAppointmentStats = async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const approved = await Appointment.countDocuments({ status: 'approved' });
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const cancelled = await Appointment.countDocuments({ status: 'cancelled' });

    res.json({ total, approved, pending, cancelled });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch appointment stats" });
  }
};

// ✅ Get Unique Patients List
exports.getUniquePatients = async (req, res) => {
  try {
    const appointments = await Appointment.find({}, 'patientName email age contactNumber');

    // Use a Map to deduplicate by email
    const uniqueMap = new Map();

    appointments.forEach(appt => {
      if (!uniqueMap.has(appt.email)) {
        uniqueMap.set(appt.email, {
          name: appt.patientName,
          email: appt.email,
          age: appt.age,
          contactNumber: appt.contactNumber,
        });
      }
    });

    const uniquePatients = Array.from(uniqueMap.values());

    res.status(200).json(uniquePatients);
  } catch (err) {
    console.error('Error fetching unique patients:', err);
    res.status(500).json({ message: 'Failed to fetch unique patients' });
  }
};

exports.getPatientDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    console.log("📩 Requested patient email:", email);

    const appointments = await Appointment.find({ email })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });

    console.log("📝 Appointments found:", appointments.length);

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this patient' });
    }

    const first = appointments[0];
    const patientInfo = {
      name: first.patientName,
      age: first.age,
      contactNumber: first.contactNumber,
      email: first.email,
    };

    const doctors = [...new Map(
      appointments
        .filter(a => a.doctorId) // ✅ skip appointments with null doctorId
        .map(a => [a.doctorId._id.toString(), {
          id: a.doctorId._id,
          name: a.doctorId.name,
          specialization: a.doctorId.specialization
        }])
    ).values()];
    // Flatten and sort prescriptions
    const prescriptions = appointments
    .flatMap(a =>
      a.prescriptions.map(p => ({
        date: p.date,
        medication: p.medication,
        instructions: p.instructions,
        appointmentId: a._id
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Flatten and sort lab records
    const labRecords = appointments
    .flatMap(a =>
      a.labRecords.map(r => ({
        date: r.date,
        testName: r.testName,
        result: r.result,
        remarks: r.remarks,
        appointmentId: a._id
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Flatten and sort doctor notes
    const doctorNotes = appointments
    .flatMap(a =>
      a.doctorNotes.map(n => ({
        date: n.date,
        note: n.note,
        appointmentId: a._id
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
    patientInfo,
    appointments,
    consultingDoctors: doctors,
    prescriptions,
    labRecords,
    doctorNotes
    });

    } catch (err) {
    console.error("❌ Error in getPatientDetailsByEmail:", err);
    return res.status(500).json({ message: "Failed to fetch patient details" });
    }
    };   

    

// Add Prescription
exports.addPrescription = async (req, res) => {
  console.log("🔥 POST /appointments/:id/add-prescription HIT");
  try {
    const { appointmentId } = req.params;
    const { date, medication, instructions } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    appointment.prescriptions.push({ date, medication, instructions });
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding prescription' });
  }
};

// Add Lab Record
exports.addLabRecord = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, testName, result, remarks } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    appointment.labRecords.push({ date, testName, result, remarks });
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Error adding lab record' });
  }
};

// Add Doctor Note
exports.addDoctorNote = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, note } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    appointment.doctorNotes.push({ date, note });
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Error adding doctor note' });
  }
};
