const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  approveAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getTodaysAppointments,
  getAppointmentStats,
  getUniquePatients,
  getPatientDetailsByEmail,
  addPrescription,
  addLabRecord,
  addDoctorNote
 
} = require('../controllers/appointmentController');

router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/approve', approveAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);
router.put('/appointments/:id/reschedule', rescheduleAppointment);
router.get('/appointments/today', getTodaysAppointments);
router.get('/appointments/stats', getAppointmentStats);

router.get('/unique-patients', getUniquePatients);
router.get('/patient/:email', getPatientDetailsByEmail);

// adminRoutes.js or wherever your routes are defined

router.post('/appointments/:appointmentId/add-prescription', (req, res, next) => {
  console.log("✅ Prescription route hit with ID:", req.params.id);
  next(); // to continue to controller
}, addPrescription);



router.post('/appointments/:appointmentId/add-lab-record', addLabRecord);
router.post('/appointments/:appointmentId/add-doctor-note', addDoctorNote);


module.exports = router;
