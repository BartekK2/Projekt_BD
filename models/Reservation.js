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
    // TUTAJ DODAJEMY ZABEZPIECZONĄ ZNIŻKĘ
    appliedDiscount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalDiscounts",
      default: null,
      validate: {
        validator: async function (discountId) {
          // Jeśli rezerwacja jest bez zniżki (null), to jest to poprawne
          if (!discountId) return true; 

          // Pobieramy model zniżki, żeby sprawdzić, do kogo ona przypisana
          const DiscountModel = mongoose.model("PersonalDiscounts");
          const discount = await DiscountModel.findById(discountId);

          // Zwróci false, jeśli ktoś podał ID zniżki, której nie ma w bazie
          if (!discount) return false; 

          // KLUCZOWY MOMENT: Porównujemy ID usera ze zniżki z ID usera z TEJ rezerwacji.
          // Używamy .toString(), ponieważ w Mongoose ObjectId to obiekty i zwykłe "===" by nie zadziałało
          return discount.user.toString() === this.user.toString();
        },
        message: "Odmowa: Próbujesz użyć zniżki, która nie należy do Twojego konta!"
      }
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