const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    row: { type: String, required: true }, //A,B,C...
    number: { type: Number, required: true }, //1,2,3...
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const screeningSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    roomName: { type: String, required: true }, //Sala 1,Sala 2...
    startTime: { type: Date, required: true },
    ticketPrice: { type: Number, required: true },
    seats: [seatSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Screening", screeningSchema);
