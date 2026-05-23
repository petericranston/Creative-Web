const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const dotenv = require("dotenv").config();

const userModel = require("./models/users");
const mapModel = require("./models/map");

const app = express();

app.use(express.json());

const multerStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage: multerStorage, limits: { fileSize: 5 * 1024 * 1024 } });

const sessions = require("express-session");

const mongoDBUsername = process.env.mongoDBUsername;
const mongoDBPassword = process.env.mongoDBPassword;
const mongoAppName = process.env.mongoAppName;

const connectionString = `mongodb+srv://${mongoDBUsername}:${mongoDBPassword}@cluster0.hxdji7a.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`;
mongoose.connect(connectionString);

const oneHour = 1 * 60 * 60 * 1000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
  sessions({
    secret: process.env.sessionSecret,
    cookie: { maxAge: oneHour },
    resave: false,
    saveUninitialized: false,
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((request, response, next) => {
  response.locals.username = request.session.username || null;
  response.locals.admin = request.session.admin || null;
  next();
});

app.post("/api/register", async (request, response) => {
  const success = await userModel.registerUser(request.body.username, request.body.password);
  if (!success) {
    return response.status(409).json({ success: false, message: "Username already taken" });
  }
  request.session.username = request.body.username;
  response.json({ success: true });
});

app.post("/api/login", async (request, response) => {
  const user = await userModel.checkUser(request.body.username, request.body.password);
  if (user) {
    request.session.username = user.username;
    request.session.admin = user.admin;
    response.json({ success: true });
  } else {
    console.log("Login Failed");
    response.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.post("/api/logout", async (request, response) => {
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
    return response.json({ loggedIn: false });
  }
  response.json({ loggedIn: true, username: request.session.username });
});

app.post("/api/newMap", async (request, response) => {
  const mapName = request.body.mapName;
  const createdMap = await mapModel.newMap([], mapName, request.session.username);
  response.json({ mapID: createdMap._id, mapName: createdMap.mapName });
});

app.post("/api/saveChanges", async (request, response) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false, message: "Not logged in" });
  }
  const { mapID, markers, polylines = [], imageUrl, customMarkerTypes = [], bgColor } = request.body;
  const cleanedMarkers = markers.map(({ coords, popUp, type, size }) => ({ coords, popUp, type, size: size ?? 1 }));
  const cleanedPolylines = polylines.map(({ points, color, label }) => ({ points, color: color || "#8b0000", label: label || "" }));
  const cleanedCustomTypes = customMarkerTypes.map(({ id, name, imageUrl: url }) => ({ id, name, imageUrl: url }));
  const success = await mapModel.saveChanges(mapID, request.session.username, cleanedMarkers, cleanedPolylines, imageUrl, cleanedCustomTypes, bgColor);
  success
    ? response.json({ success: true })
    : response.status(403).json({ success: false, message: "Not authorised" });
});

app.post("/api/uploadMarkerIcon", (request, response, next) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false });
  }
  next();
}, upload.single("image"), async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ success: false, message: "No file uploaded" });
  }
  const imageUrl = `/uploads/${request.file.filename}`;
  response.json({ success: true, imageUrl });
});

app.delete("/api/deleteMarkerIcon", async (request, response) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false });
  }
  const { imageUrl } = request.body;
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
    return response.status(400).json({ success: false, message: "Invalid image URL" });
  }
  const filename = path.basename(imageUrl);
  const filePath = path.join(__dirname, "uploads", filename);
  try {
    fs.unlinkSync(filePath);
  } catch {
    // File already gone — treat as success
  }
  response.json({ success: true });
});

app.post("/api/uploadImage", (request, response, next) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false });
  }
  next();
}, upload.single("image"), async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ success: false, message: "No file uploaded" });
  }
  const imageUrl = `/uploads/${request.file.filename}`;
  const success = await mapModel.updateImageUrl(request.body.mapID, request.session.username, imageUrl);
  success
    ? response.json({ success: true, imageUrl })
    : response.status(403).json({ success: false });
});

app.post("/api/publishMap", async (request, response) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false, message: "Not logged in" });
  }
  const success = await mapModel.publishMap(request.body.mapID, request.session.username);
  success
    ? response.json({ success: true })
    : response.status(403).json({ success: false, message: "Not authorised" });
});

app.post("/api/unpublishMap", async (request, response) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false, message: "Not logged in" });
  }
  const success = await mapModel.unpublishMap(request.body.mapID, request.session.username);
  success
    ? response.json({ success: true })
    : response.status(403).json({ success: false, message: "Not authorised" });
});

app.patch("/api/updateDescription/:id", async (request, response) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false });
  }
  const success = await mapModel.updateDescription(
    request.params.id,
    request.session.username,
    request.body.description,
  );
  success ? response.json({ success: true }) : response.status(403).json({ success: false });
});

app.delete("/api/deleteMap/:id", async (request, response) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false });
  }
  const success = await mapModel.deleteMap(request.params.id, request.session.username);
  success
    ? response.json({ success: true })
    : response.status(404).json({ success: false, message: "Map not found" });
});

app.patch("/api/renameMap/:id", async (request, response) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false });
  }
  const success = await mapModel.renameMap(
    request.params.id,
    request.session.username,
    request.body.mapName,
  );
  success
    ? response.json({ success: true })
    : response.status(404).json({ success: false, message: "Map not found" });
});

app.get("/api/getUserMaps", async (request, response) => {
  try {
    const maps = await mapModel.sendUsersMaps(request.session.username);
    response.json(maps);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/getAllMaps", async (request, response) => {
  try {
    const maps = await mapModel.sendAllMaps();
    response.json(maps);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/getMarkers/:id", async (request, response) => {
  try {
    const result = await mapModel.sendMarkers(request.params.id);
    response.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log("Server running on port http://localhost:3000/");
});
