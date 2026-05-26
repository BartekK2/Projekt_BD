const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const { bookTickets } = require("../addreservation");

//pobierz historie rezerwacji (z dolaczeniem danych o uzytkowniku, seansie, filmie i znizce)
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "firstName lastName email")
      .populate({
        path: "screening",
        populate: { path: "movie", select: "title" },
      }) //rezerwacja -> seans -> film (tytul)
      .populate("appliedDiscount", "percentDiscount");

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//pobierz jedna rezerwacje po id (z dolaczeniem danych o uzytkowniku, seansie, filmie i znizce)
router.get("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation)
      return res.status(404).json({ message: "Nie znaleziono rezerwacji" });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//usun rezerwacje/anuluj rezerwacje
router.delete("/:id", async (req, res) => {
  try {
    const deletedReservation = await Reservation.findByIdAndDelete(
      req.params.id
    );
    if (!deletedReservation)
      return res.status(404).json({ message: "Nie znaleziono rezerwacji" });
    res.json({ message: "Rezerwacja usunięta" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//glowna operacja transakcyjna - rezerwacja biletow
router.post("/book", async (req, res) => {
  try {
    const { userId, screeningId, requestedSeats, discountId } = req.body;

    const reservation = await bookTickets(
      userId,
      screeningId,
      requestedSeats,
      discountId
    );

    res.status(201).json({
      message: "Rezerwacja zakończona sukcesem!",
      reservation,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
