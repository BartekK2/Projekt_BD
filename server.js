require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("polaczono z baza MongoDB"))
  .catch((err) => console.error("blad polaczenia z baza:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`serwer dziala na porcie ${PORT}`);
});
