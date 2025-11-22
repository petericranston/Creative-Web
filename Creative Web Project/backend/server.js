const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ users: ["one", "two", "three"] });
});

app.listen(3000, () => {
  console.log("Server running on port http://localhost:3000/");
});
