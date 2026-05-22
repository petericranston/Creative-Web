const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config(); //Configuring my .env for secret keys (mongodb)

//Requiring models
const userModel = require("./models/users");
const mapModel = require("./models/map");

const app = express();

app.use(express.json());

const sessions = require("express-session");

const mongoDBUsername = process.env.mongoDBUsername; //Getting data from env file
const mongoDBPassword = process.env.mongoDBPassword;
const mongoAppName = process.env.mongoAppName;

const connectionString = `mongodb+srv://${mongoDBUsername}:${mongoDBPassword}@cluster0.hxdji7a.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`;
//Building connection string for mongodb
mongoose.connect(connectionString);

const threeMinutes = 3 * 60 * 1000; //Variables to decide how long the user will be singed in for
const oneHour = 1 * 60 * 60 * 1000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
  //Starting a session to keep user signed in and store user data to use throughout the app
  sessions({
    secret: "No Secret Yet",
    cookie: { maxAge: oneHour },
    resave: false,
    saveUninitialized: false,
  }),
);

app.use((request, response, next) => {
  //storing the user data to use throughout the app
  response.locals.username = request.session.username || null;
  response.locals.admin = request.session.admin || null;
  next();
});

app.post("/api/register", async (request, response) => {
  //Registering user with data gotten from the forms\
  await userModel.registerUser(request.body.username, request.body.password);
  //Setting session data to use throughout the app
  request.session.username = request.body.username;
  // response.sendFile(path.join(__dirname, "/views", "app.html"));
  response.json({ success: true });
});

app.post("/api/login", async (request, response) => {
  //Login functionality
  const user = await userModel.checkUser(
    request.body.username,
    request.body.password,
  );

  if (user) {
    //Setting session data to use throughout the app
    request.session.username = user.username;
    request.session.admin = user.admin;
    response.json({ success: true });
  } else {
    console.log("Login Failed");
    response.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.post("/api/logout", async (request, response) => {
  //Logs user out and destroys session
  if (!request.session.username) {
    return response.json({ loggedIn: false });
  } else {
    request.session.destroy();
    response.clearCookie("connect.sid");
    response.json({ success: true });
  }
});

app.get("/api/user", (request, response) => {
  if (!request.session.username) {
    //Checking if user is logged in
    return response.json({ loggedIn: false });
  }
  response.json({
    //Sending data if the user is logged in
    loggedIn: true,
    username: request.session.username,
  });
});

app.post("/api/newMap", async (request, response) => {
  //New map functionality
  const markers = [];
  const mapName = request.body.mapName; //Sets the name the user wrote in a text field to a variable

  const createdMap = await mapModel.newMap(
    //Uses map model to run a function that creates a new map
    markers,
    mapName,
    request.session.username,
  );
  response.json({
    //sends back the mapid and mapname
    mapID: createdMap._id,
    mapName: createdMap.mapName,
  });
});

app.post("/api/saveChanges", async (request, response) => {
  //Takes the mapid and markers array sent through saves them to the database
  const mapID = request.body.mapID;
  const markers = request.body.markers;

  const cleanedMarkers = markers.map(({ coords, popUp, type }) => ({
    //This is to remove the id that each marker had, otherwise there is database issues
    coords,
    popUp,
    type,
  }));

  console.log(mapID);
  console.log(markers);
  await mapModel.saveChanges(mapID, cleanedMarkers); //Saves the markers to the map with that id
  response.json({ success: true });
});

app.post("/api/publishMap", async (request, response) => {
  //Sends the mapid to the model that runs the function to publish the map
  const mapID = request.body.mapID;
  mapModel.publishMap(mapID);
  response.json({ success: true });
});

app.get("/api/getUserMaps", async (request, response) => {
  try {
    const maps = await mapModel.sendUsersMaps(request.session.username); //Getting map data from database
    response.json(maps); //Sending map data back
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/getAllMaps", async (request, response) => {
  try {
    const maps = await mapModel.sendAllMaps(); //Getting all maps data from database
    response.json(maps); //Sending map data back
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/getMarkers/:id", async (request, response) => {
  //Uses the mapid to run the sendmarkers function
  try {
    const markers = await mapModel.sendMarkers(request.params.id);
    response.json({ markers });
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log("Server running on port http://localhost:3000/");
});
