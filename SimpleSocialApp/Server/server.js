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

//All the organisational requirements and requirements above

const threeMinutes = 3 * 60 * 1000; //Variables to decide how long the user will be singed in for
const oneHour = 1 * 60 * 60 * 1000;

const dotenv = require("dotenv").config(); //Configuring my .env for secret keys (mongodb)

const mongoDBUsername = process.env.mongoDBUsername; //Getting data from env file
const mongoDBPassword = process.env.mongoDBPassword;
const mongoAppName = process.env.mongoAppName;

const connectionString = `mongodb+srv://${mongoDBUsername}:${mongoDBPassword}@cluster0.hxdji7a.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`;
//Building connection string for mongodb
const mongoose = require("mongoose"); //requiring and connecting to mongodb
mongoose.connect(connectionString);

app.use(
  //Starting a session to keep user signed in and store user data to use throughout the app
  sessions({
    secret: "my secret phrase",
    cookie: { maxAge: oneHour },
    resave: false,
    saveUninitialized: false,
  })
);

app.use((request, response, next) => {
  //storing the user data to use throughout the app
  response.locals.username = request.session.username || null;
  response.locals.firstname = request.session.firstname || null;
  response.locals.lastname = request.session.lastname || null;
  response.locals.admin = request.session.admin || null;
  next();
});

function checkLoggedIn(request, response, nextAction) {
  //Checking if user is logged in
  if (request.session) {
    //Checking if session has started and username has been given
    if (request.session.username) {
      nextAction();
    } else {
      request.session.destroy(); //Stopping session of there isn't a session or username
      response.render("pages/notloggedin", {
        isLoggedIn: getLoggedInState(request),
      });
    }
  }
}

function getLoggedInState(request) {
  //Checking if user is logged in
  return request.session && request.session.username;
}
function getAdminState(request) {
  //Checking if user is an admin
  return request.session.admin;
}

// Index file served first
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "/public", "index.html"));
});

app.get("/home", (request, response) => {
  //Serving home file when required
  response.sendFile(path.join(__dirname, "/public", "index.html"));
});

app.get("/app", checkLoggedIn, async (request, response) => {
  //Serving app page with variables attached
  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  response.render("pages/app", {
    isLoggedIn: getLoggedInState(request),
    posts: await posts.getLatestNPost(8),
    admin: getAdminState(request),
  });
});

app.get("/register", (request, response) => {
  //Serving register page
  response.render("pages/register", {
    isLoggedIn: getLoggedInState(request),
  });
});

app.get("/profile", (request, response) => {
  //Serving profile page with variables attached
  response.render("pages/profile", {
    isLoggedIn: getLoggedInState(request),
    firstname: response.locals.firstname,
    lastname: response.locals.lastname,
  });
});

app.get("/admin", async (request, response) => {
  //Serving admin page
  response.render("pages/admin", {
    isLoggedIn: getLoggedInState(request),
    users: await userModel.getUser(),
  });
});

app.get("/login", (request, response) => {
  //Serving login page
  // response.sendFile(path.join(__dirname, "/views", "login.html"));
  response.render("pages/login", {
    isLoggedIn: getLoggedInState(request),
  });
});

app.get("/logout", (request, response) => {
  //Serving logout page
  request.session.destroy();
  response.render("pages/logout", {
    isLoggedIn: getLoggedInState(request),
  });
});

app.get("/getposts", async (request, response) => {
  //Getting the 8 most recent posts from mongodb
  response.json({ posts: await posts.getLatestNPost(8) });
});

app.post("/newpost", checkLoggedIn, async (request, response) => {
  //Adding a new post
  await posts.addPost(request.body.message, request.session.username);
  const latestPosts = await posts.getLatestNPost(8);

  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  response.redirect("/app");
  console.log("Message Sent");
});

app.post("/register", async (request, response) => {
  //Registering user with data gotten from the forms
  await userModel.registerUser(
    request.body.username,
    request.body.password,
    request.body.firstname,
    request.body.lastname
  );
  //Setting session data to use throughout the app
  request.session.username = request.body.username;
  request.session.firstname = request.body.firstname;
  request.session.lastname = request.body.lastname;
  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  response.redirect("/app");
});

app.post("/updateDetails", async (request, response) => {
  //Updating user details
  await userModel.updateDetails(
    request.body.username,
    request.body.password,
    request.body.firstname,
    request.body.lastname,
    request.session.username
  );
  //Setting session data to use throughout the app
  request.session.username = request.body.username;
  request.session.firstname = request.body.firstname;
  request.session.lastname = request.body.lastname;
  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  response.redirect("/profile");
});

app.post("/deletePost/:id", async (request, response) => {
  //Allowing admin to delete posts
  await posts.deletePost(request.params.id);
  response.redirect("/app");
});

app.post("/deleteUser/:id", async (request, response) => {
  //Allowing admin to delete users (and all their posts)
  const user = await userModel.findUserById(request.params.id);

  await userModel.deleteUser(request.params.id);
  await posts.deletePostsWithAccount(user.username); // remove users posts

  response.redirect("/admin");
});

app.post("/login", async (request, response) => {
  //Login functionality
  const user = await userModel.checkUser(
    request.body.username,
    request.body.password
  );

  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  if (user) {
    //Setting session data to use throughout the app
    request.session.username = user.username;
    request.session.admin = user.admin;
    request.session.firstname = user.firstname;
    request.session.lastname = user.lastname;
    response.redirect("/app");
  } else {
    response.render("pages/login_failed", {
      isLoggedIn: getLoggedInState(request),
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`)); //Starting website
