const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config(); //Configuring my .env for secret keys (mongodb)

const app = express();

app.use(cors());
app.use(express.json());

const sessions = require("express-session");
const cookieParser = require("cookie-parser");

const mongoDBUsername = process.env.mongoDBUsername; //Getting data from env file
const mongoDBPassword = process.env.mongoDBPassword;
const mongoAppName = process.env.mongoAppName;

const connectionString = `mongodb+srv://${mongoDBUsername}:${mongoDBPassword}@cluster0.hxdji7a.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`;
//Building connection string for mongodb
mongoose.connect(connectionString);

const threeMinutes = 3 * 60 * 1000; //Variables to decide how long the user will be singed in for
const oneHour = 1 * 60 * 60 * 1000;

app.use(
  //Starting a session to keep user signed in and store user data to use throughout the app
  sessions({
    secret: "No Secret Yet",
    cookie: { maxAge: oneHour },
    resave: false,
    saveUninitialized: false,
  })
);

app.use((request, response, next) => {
  //storing the user data to use throughout the app
  response.locals.username = request.session.username || null;
  response.locals.admin = request.session.admin || null;
  next();
});

app.get("/api", (req, res) => {
  res.json({ users: ["one", "two", "three"] });
});

app.listen(3000, () => {
  console.log("Server running on port http://localhost:3000/");
});
