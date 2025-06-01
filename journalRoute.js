const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalController");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming you have this to verify token

// All routes require authentication
router.use(authMiddleware);

// Create new journal entry
router.post("/", journalController.createEntry);

// Get all entries for user
router.get("/", journalController.getEntries);

// Get single entry by id
router.get("/:id", journalController.getEntryById);

// Update entry by id
router.put("/:id", journalController.updateEntry);

// Delete entry by id
router.delete("/:id", journalController.deleteEntry);

module.exports = router;
