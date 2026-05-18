const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    director: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    genre: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
); //automatyczne createdAt, updatedAt

module.exports = mongoose.model("Movie", movieSchema);
