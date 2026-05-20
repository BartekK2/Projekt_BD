const express = require("express");
const router = express.Router();
const User = require("../models/User");

//pobierz wszystkich
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//pobierz jednego po id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//stworz uzytkownika
router.post("/", async (req, res) => {
  const user = new User(req.body);
  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//zaaktualizuj uzytkownika
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//usun uzytkownika
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    res.json({ message: "Użytkownik usunięty" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
