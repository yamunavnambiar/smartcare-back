const express = require('express');
const router = express.Router();
const {
  addDoctor,
  getAllDoctors,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');

// POST /api/admin/doctors
router.post('/', addDoctor);

// GET /api/admin/doctors
router.get('/', getAllDoctors);

// PUT /api/admin/doctors/:id
router.put('/:id', updateDoctor);

// DELETE /api/admin/doctors/:id
router.delete('/:id', deleteDoctor);

module.exports = router;
