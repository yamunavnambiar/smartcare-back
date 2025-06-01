const express = require('express');
const router = express.Router();


const { getAllDoctors } = require('../controllers/doctorController');
const { bookAppointment, getUserProfile } = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');

// GET /api/users/doctors - users view doctors added by admin
router.get('/doctors', getAllDoctors);

// POST /api/users/book - users book an appointment
router.post('/book', authenticate, bookAppointment);

// GET /api/users/profile - users view their profile and appointments
router.get('/profile', authenticate, getUserProfile);

module.exports = router;