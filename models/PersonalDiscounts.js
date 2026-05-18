const mongoose = require("mongoose");

const personalDiscount = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    percentDiscount: { type: Number, required: true },
    expirationDate: { 
      type: Date,
      default: () => Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 dni od przypisania
      required:false,
      validate: {
        validator: function(value) {
          return value > new Date(); 
        },
        message: 'Data wygaśnięcia zniżki musi być w przyszłości!'
      }
    }
  },
  { timestamps: true }
); //automatyczne createdAt, updatedAt

module.exports = mongoose.model("PersonalDiscounts", personalDiscount);
