// controllers/journalController.js
const JournalEntry = require("../models/JournalEntry");

// CREATE a new journal entry
exports.createEntry = async (req, res) => {
  try {
    const { title, content, mood, tags, images, audio } = req.body;
    const userId = req.user.id; // Extracted from token middleware

    const newEntry = new JournalEntry({
      userId,
      title,
      content,
      mood,
      tags,
      images,
      audio
    });

    await newEntry.save();
    res.status(201).json({ message: "Journal entry created", entry: newEntry });
  } catch (err) {
    res.status(500).json({ error: "Failed to create entry" });
  }
};

// GET all journal entries for the logged-in user
exports.getEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const entries = await JournalEntry.find({ userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
};

// GET a single entry by ID
exports.getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user.id });
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch entry" });
  }
};

// UPDATE a journal entry
exports.updateEntry = async (req, res) => {
  try {
    const updatedEntry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedEntry) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Entry updated", entry: updatedEntry });
  } catch (err) {
    res.status(500).json({ error: "Failed to update entry" });
  }
};

// DELETE an entry
exports.deleteEntry = async (req, res) => {
  try {
    const deleted = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!deleted) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
};
