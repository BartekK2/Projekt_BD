//node server.js zeby odpalic
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

const moviesRouter = require("./routes/movies");
const usersRouter = require("./routes/users");
const screeningsRouter = require("./routes/screenings");
const discountsRouter = require("./routes/discounts");
const reservationsRouter = require("./routes/reservations");
const raportsRouter = require("./routes/reports");


app.use("/api/movies", moviesRouter);
app.use("/api/users", usersRouter);
app.use("/api/screenings", screeningsRouter);
app.use("/api/discounts", discountsRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/reports", raportsRouter);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("polaczono z baza MongoDB"))
  .catch((err) => console.error("blad polaczenia z baza:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`serwer dziala na porcie ${PORT}`);
});
