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
app.use(express.static(path.join(__dirname, "public")));

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

app.use((request, response, next) => {
  response.locals.username = request.session.username || null;
  response.locals.admin = request.session.admin || null;
  next();
});

function checkLoggedIn(request, response, nextAction) {
  if (request.session) {
    if (request.session.username) {
      nextAction();
    } else {
      request.session.destroy();
      response.render("pages/notloggedin", {
        isLoggedIn: getLoggedInState(request),
      });
    }
  }
}

function getLoggedInState(request) {
  return request.session && request.session.username;
}

// Index file served first
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "/public", "index.html"));
});

app.get("/home", (request, response) => {
  response.sendFile(path.join(__dirname, "/public", "index.html"));
});

app.get("/app", checkLoggedIn, async (request, response) => {
  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  response.render("pages/app", {
    isLoggedIn: getLoggedInState(request),
    posts: await posts.getLatestNPost(8),
  });
});

app.get("/register", (request, response) => {
  response.render("pages/register", {
    isLoggedIn: getLoggedInState(request),
  });
});

app.get("/profile", (request, response) => {
  response.render("pages/profile", {
    isLoggedIn: getLoggedInState(request),
  });
});

app.get("/login", (request, response) => {
  // response.sendFile(path.join(__dirname, "/views", "login.html"));
  response.render("pages/login", {
    isLoggedIn: getLoggedInState(request),
  });
});

app.get("/logout", (request, response) => {
  request.session.destroy();
  response.render("pages/logout", {
    isLoggedIn: getLoggedInState(request),
  });
});

app.get("/getposts", async (request, response) => {
  response.json({ posts: await posts.getLatestNPost(8) });
});

app.post("/newpost", checkLoggedIn, async (request, response) => {
  await posts.addPost(request.body.message, request.session.username);
  const latestPosts = await posts.getLatestNPost(8);

  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  response.redirect("/app");
  console.log("Message Sent");
});

app.post("/register", async (request, response) => {
  await userModel.registerUser(request.body.username, request.body.password);
  request.session.username = request.body.username;
  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  response.redirect("/app");
});

app.post("/updateDetails", async (request, response) => {
  await userModel.updateDetails(
    request.body.username,
    request.body.password,
    request.session.username
  );
  request.session.username = request.body.username;
  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  response.redirect("/profile");
});

app.post("/login", async (request, response) => {
  if (await userModel.checkUser(request.body.username, request.body.password)) {
    request.session.username = request.body.username;
    // response.sendFile(path.join(__dirname, "/views", "app.html"));
    response.redirect("/app");
  } else {
    response.render("pages/login_failed", {
      isLoggedIn: getLoggedInState(request),
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));
