const mongoose = require("mongoose");
const Reservation = require("./models/Reservation");
const Screening = require("./models/Screening");
const PersonalDiscounts = require("./models/PersonalDiscounts");

async function bookTickets(
  userId,
  screeningId,
  requestedSeats,
  discountId = null
) {
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const screening = await Screening.findById(screeningId).session(session);
      if (!screening) throw new Error("Nie znaleziono takiego seansu.");

      let basePrice = 0;

      for (const reqSeat of requestedSeats) {
        const seatIndex = screening.seats.findIndex(
          (s) => s.row === reqSeat.row && s.number === reqSeat.number
        );

        if (seatIndex === -1)
          throw new Error(
            `Miejsce Rząd ${reqSeat.row}, Numer ${reqSeat.number} nie istnieje.`
          );

        const seat = screening.seats[seatIndex];
        if (!seat.isAvailable)
          throw new Error(
            `Miejsce Rząd ${reqSeat.row}, Numer ${reqSeat.number} jest już zajęte!`
          );

        screening.seats[seatIndex].isAvailable = false;
        basePrice += screening.ticketPrice;
      }

      await screening.save({ session });

      let finalPrice = basePrice;

      if (discountId) {
        const discount = await PersonalDiscounts.findById(discountId).session(
          session
        );

        if (!discount) {
          throw new Error("Podana zniżka nie istnieje.");
        }

        if (discount.user.toString() !== userId.toString()) {
          throw new Error("Ta zniżka nie jest przypisana do Twojego konta.");
        }

        if (discount.expirationDate < new Date()) {
          throw new Error("Ta zniżka już wygasła.");
        }

        if (discount.isUsed) {
          throw new Error("Ta zniżka została już wykorzystana.");
        }

        const discountAmount = basePrice * (discount.percentDiscount / 100);
        finalPrice = basePrice - discountAmount;

        discount.isUsed = true;
        await discount.save({ session });
      }

      const newReservation = await Reservation.create(
        [
          {
            user: userId,
            screening: screeningId,
            appliedDiscount: discountId,
            bookedSeats: requestedSeats,
            totalPrice: finalPrice,
            status: "CONFIRMED",
          },
        ],
        { session }
      );

      return newReservation[0];
    });

    return result;
  } catch (error) {
    console.error("Błąd rezerwacji:", error.message);
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = { bookTickets };
