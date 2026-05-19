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
    appliedDiscount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalDiscounts",
      default: null,
      validate: {
        validator: async function (discountId) {
          if (!discountId) return true;

          const DiscountModel = mongoose.model("PersonalDiscounts");
          const discount = await DiscountModel.findById(discountId);

          if (!discount) return false;

          return discount.user.toString() === this.user.toString();
        },
        message:
          "Odmowa: Próbujesz użyć zniżki, która nie należy do Twojego konta",
      },
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
