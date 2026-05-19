//node seed.js zeby odpalic
require("dotenv").config();
const mongoose = require("mongoose");

//importy modeli
const User = require("./models/User");
const Movie = require("./models/Movie");
const Screening = require("./models/Screening");
const PersonalDiscount = require("./models/PersonalDiscounts");
const Reservation = require("./models/Reservation");

function generateSeats() {
  const seats = [];
  const rows = ["A", "B", "C"];
  for (let row of rows) {
    for (let num = 1; num <= 5; num++) {
      seats.push({ row, number: num, isAvailable: true });
    }
  }
  return seats;
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Łączenie z bazą i czyszczenie starych danych...");

    //CZYSZCZENIE
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Screening.deleteMany({});
    await PersonalDiscount.deleteMany({});
    await Reservation.deleteMany({});
    console.log("Baza wyczyszczona.");

    //uzytkownicy
    const users = await User.insertMany([
      {
        firstName: "Jan",
        lastName: "Kowalski",
        email: "jan.kowalski@example.com",
      },
      { firstName: "Anna", lastName: "Nowak", email: "anna.nowak@example.com" },
    ]);
    console.log("Użytkownicy dodani.");

    //znizki
    const discounts = await PersonalDiscount.insertMany([
      {
        user: users[0]._id,
        title: "Kupon Powitalny 20%",
        percentDiscount: 20,
      },
      {
        user: users[1]._id,
        title: "VIP 50%",
        percentDiscount: 50,
      },
    ]);
    console.log("Zniżki personalne wygenerowane.");

    //filmy
    const movies = await Movie.insertMany([
      {
        title: "Diuna: Część Druga",
        director: "Denis Villeneuve",
        durationMinutes: 166,
        genre: "Sci-Fi",
        description: "Epicka kontynuacja.",
      },
      {
        title: "Oppenheimer",
        director: "Christopher Nolan",
        durationMinutes: 180,
        genre: "Biograficzny",
        description: "Historia twórcy bomby.",
      },
    ]);
    console.log("Filmy dodane.");

    //seanse
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const screenings = await Screening.insertMany([
      {
        movie: movies[0]._id,
        roomName: "Sala IMAX",
        startTime: yesterday,
        ticketPrice: 40,
        seats: generateSeats(),
      },
      {
        movie: movies[1]._id,
        roomName: "Sala 2",
        startTime: tomorrow,
        ticketPrice: 30,
        seats: generateSeats(),
      },
    ]);
    console.log("Seanse wygenerowane.");

    //SYMULACJA REZERWACJI
    // Jan kupuje dwa bilety na wczorajszy seans Diuny i używa swojej zniżki 20%

    //aktualizacja statusu miejsc na zajete
    screenings[0].seats.find(
      (s) => s.row === "A" && s.number === 1
    ).isAvailable = false;
    screenings[0].seats.find(
      (s) => s.row === "A" && s.number === 2
    ).isAvailable = false;
    await screenings[0].save();

    //tworzenie rezerwacji
    const reservation = new Reservation({
      user: users[0]._id,
      screening: screenings[0]._id,
      appliedDiscount: discounts[0]._id,
      bookedSeats: [
        { row: "A", number: 1 },
        { row: "A", number: 2 },
      ],
      totalPrice: 64,
      status: "CONFIRMED",
    });

    reservation.createdAt = yesterday;
    await reservation.save();
    console.log("Przykładowa rezerwacja ze zniżką utworzona.");

    console.log("Baza gotowa do działania i testowania");
  } catch (error) {
    console.error("Błąd podczas zasilania bazy:", error);
  } finally {
    //rozlaczenie z baza
    mongoose.connection.close();
  }
}

seedDatabase();
