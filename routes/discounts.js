const express = require("express");
const router = express.Router();
const PersonalDiscount = require("../models/PersonalDiscounts");

//pobierz wszystkie znizki (z dolaczeniem danych o uzytkowniku!!)
router.get("/", async (req, res) => {
  try {
    const discounts = await PersonalDiscount.find().populate(
      "user",
      "firstName lastName email"
    );
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//dodaj znizke
router.post("/", async (req, res) => {
  const discount = new PersonalDiscount(req.body);
  try {
    const savedDiscount = await discount.save();
    res.status(201).json(savedDiscount);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//usun znizke
router.delete("/:id", async (req, res) => {
  try {
    const deletedDiscount = await PersonalDiscount.findByIdAndDelete(
      req.params.id
    );
    if (!deletedDiscount)
      return res.status(404).json({ message: "Nie znaleziono zniżki" });
    res.json({ message: "Zniżka usunięta" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
