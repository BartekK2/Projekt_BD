const express = require("express");
const router = express.Router();
const Screening = require("../models/Screening");

//pobierz wszystkie seanse (z dolaczeniem danych o filmie!!)
router.get("/", async (req, res) => {
  try {
    const screenings = await Screening.find().populate("movie");
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//pobierz jeden seans po id (z dolaczeniem danych o filmie!!)
router.get("/:id", async (req, res) => {
  try {
    const screening = await Screening.findById(req.params.id).populate("movie");
    if (!screening)
      return res.status(404).json({ message: "Nie znaleziono seansu" });
    res.json(screening);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//stworz nowy seans
router.post("/", async (req, res) => {
  const screening = new Screening(req.body);
  try {
    const savedScreening = await screening.save();
    res.status(201).json(savedScreening);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//zaaktualizuj seans
router.put("/:id", async (req, res) => {
  try {
    const updatedScreening = await Screening.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedScreening)
      return res.status(404).json({ message: "Nie znaleziono seansu" });
    res.json(updatedScreening);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//usun seans
router.delete("/:id", async (req, res) => {
  try {
    const deletedScreening = await Screening.findByIdAndDelete(req.params.id);
    if (!deletedScreening)
      return res.status(404).json({ message: "Nie znaleziono seansu" });
    res.json({ message: "Seans usunięty" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
