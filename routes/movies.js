const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");

//pobierz wszystkie filmy
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//pobierz jeden film po id
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie)
      return res.status(404).json({ message: "Nie znaleziono filmu" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//stworz nowy film
router.post("/", async (req, res) => {
  const movie = new Movie({
    title: req.body.title,
    director: req.body.director,
    durationMinutes: req.body.durationMinutes,
    genre: req.body.genre,
    description: req.body.description,
  });

  try {
    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//zaaktualizuj film
router.put("/:id", async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMovie)
      return res.status(404).json({ message: "Nie znaleziono filmu" });
    res.json(updatedMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//usun film
router.delete("/:id", async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie)
      return res.status(404).json({ message: "Nie znaleziono filmu" });
    res.json({ message: "Film został pomyślnie usunięty" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
