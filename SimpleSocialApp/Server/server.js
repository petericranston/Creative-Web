const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

const sessions = require("express-session");
const cookieParser = require("cookie-parser");

const posts = require("./models/posts.js");
const userModel = require("./models/user.js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const threeMinutes = 3 * 60 * 1000;
const oneHour = 1 * 60 * 60 * 1000;

const dotenv = require("dotenv").config();

const mongoDBUsername = process.env.mongoDBUsername;
const mongoDBPassword = process.env.mongoDBPassword;
const mongoAppName = process.env.mongoAppName;

const connectionString = `mongodb+srv://${mongoDBUsername}:${mongoDBPassword}@cluster0.hxdji7a.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`;

const mongoose = require("mongoose");
mongoose.connect(connectionString);

app.use(
  sessions({
    secret: "my secret phrase",
    cookie: { maxAge: threeMinutes },
    resave: false,
    saveUninitialized: false,
  })
);

function checkLoggedIn(request, response, nextAction) {
  if (request.session) {
    if (request.session.username) {
      nextAction();
    } else {
      request.session.destroy();
      response.sendFile(path.join(__dirname, "/views", "notloggedin.html"));
    }
  } else {
    request.session.destroy();
    response.sendFile(path.join(__dirname, "/views", "notloggedin.html"));
  }
}

// Index file served first
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "../Client/index.html"));
});

app.get("/app", checkLoggedIn, (request, response) => {
  response.sendFile(path.join(__dirname, "/views", "app.html"));
});

app.get("/register", (request, response) => {
  response.sendFile(path.join(__dirname, "/views", "register.html"));
});

app.get("/profile", (request, response) => {
  response.sendFile(path.join(__dirname, "/views", "profile.html"));
});

app.get("/login", (request, response) => {
  // response.sendFile(path.join(__dirname, "/views", "login.html"));
  response.render("pages/login", {});
});

app.get("/logout", (request, response) => {
  response.sendFile(path.join(__dirname, "/views", "logout.html"));
  request.session.destroy();
});

app.get("/getposts", async (request, response) => {
  response.json({ posts: await posts.getLatestNPost(8) });
});

app.post("/newpost", checkLoggedIn, (request, response) => {
  if (request.body.message != "") {
    posts.addPost(request.body.message, request.session.username);
    response.sendFile(path.join(__dirname, "/views", "app.html"));
    console.log("Message Sent");
  }
});

app.post("/register", async (request, response) => {
  await userModel.registerUser(request.body.username, request.body.password);
  request.session.username = request.body.username;
  response.sendFile(path.join(__dirname, "/views", "app.html"));
});

app.post("/login", async (request, response) => {
  if (await userModel.checkUser(request.body.username, request.body.password)) {
    request.session.username = request.body.username;
    response.sendFile(path.join(__dirname, "/views", "app.html"));
  } else {
    response.sendFile(path.join(__dirname, "/views", "login_failed.html"));
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));
