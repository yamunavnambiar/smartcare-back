// models/JournalEntry.js
const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    mood: {
      type: String, // e.g., Happy, Sad, Stressed
      default: "Neutral"
    },
    tags: [String], // Optional topics like "work", "family"
    images: [String], // Store image file paths or URLs
    audio: [String],  // Store audio file paths or URLs
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
