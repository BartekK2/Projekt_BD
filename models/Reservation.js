const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    screening: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
      required: true,
    },
    bookedSeats: [
      {
        row: { type: String, required: true },
        number: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
