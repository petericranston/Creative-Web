const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
require("dotenv").config();

const userModel = require("./models/users");
const mapModel = require("./models/map");

const app = express();

app.use(express.json());

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]);

fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });

const multerStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const sessions = require("express-session");

const mongoDBUsername = process.env.mongoDBUsername;
const mongoDBPassword = process.env.mongoDBPassword;
const mongoAppName = process.env.mongoAppName;

const mongoDBCluster = process.env.mongoDBCluster;
const connectionString = `mongodb+srv://${mongoDBUsername}:${mongoDBPassword}@${mongoDBCluster}/${mongoAppName}?retryWrites=true&w=majority`;
mongoose.connect(connectionString).catch((err) => {
  console.error("MongoDB connection failed:", err.message);
  process.exit(1);
});

const oneHour = 1 * 60 * 60 * 1000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
  sessions({
    secret: process.env.sessionSecret,
    cookie: {
      maxAge: oneHour,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    resave: false,
    saveUninitialized: false,
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/api/register", async (request, response) => {
  const username = request.body.username?.trim();
  const { password } = request.body;
  if (!username || username.length > 32) {
    return response.status(400).json({ success: false, message: "Username must be between 1 and 32 characters" });
  }
  if (!password || password.length < 8) {
    return response.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }
  const success = await userModel.registerUser(username, password);
  if (!success) {
    return response.status(409).json({ success: false, message: "Username already taken" });
  }
  request.session.username = username;
  response.json({ success: true, username });
});

app.post("/api/login", async (request, response) => {
  const user = await userModel.checkUser(request.body.username, request.body.password);
  if (user) {
    request.session.username = user.username;
    response.json({ success: true });
  } else {
    console.log("Login Failed");
    response.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.post("/api/logout", (request, response) => {
  if (!request.session.username) {
    return response.json({ loggedIn: false });
  }
  request.session.destroy(() => {
    response.clearCookie("connect.sid");
    response.json({ success: true });
  });
});

app.get("/api/user", (request, response) => {
  if (!request.session.username) {
    return response.json({ loggedIn: false });
  }
  response.json({ loggedIn: true, username: request.session.username });
});

app.post("/api/newMap", async (request, response) => {
  if (!request.session.username) {
    return response.status(401).json({ success: false, message: "Not logged in" });
  }
  const mapName = request.body.mapName?.trim();
  if (!mapName) {
    return response.status(400).json({ success: false, message: "Map name cannot be empty" });
  }
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
  await fs.promises.unlink(filePath).catch(() => {});
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
  const oldImageUrl = await mapModel.updateImageUrl(request.body.mapID, request.session.username, imageUrl);
  if (oldImageUrl === null) {
    await fs.promises.unlink(request.file.path).catch(() => {});
    return response.status(403).json({ success: false });
  }
  if (oldImageUrl?.startsWith("/uploads/")) {
    const oldPath = path.join(__dirname, oldImageUrl);
    await fs.promises.unlink(oldPath).catch(() => {});
  }
  response.json({ success: true, imageUrl });
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
  if (!request.session.username) {
    return response.status(401).json({ success: false, message: "Not logged in" });
  }
  try {
    const maps = await mapModel.sendUsersMaps(request.session.username);
    response.json(maps);
  } catch (error) {
    console.error(error);
    response.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/getAllMaps", async (request, response) => {
  try {
    const maps = await mapModel.sendAllMaps();
    response.json(maps);
  } catch (error) {
    console.error(error);
    response.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/getMarkers/:id", async (request, response) => {
  try {
    const result = await mapModel.sendMarkers(request.params.id, request.session.username);
    if (!result) return response.status(403).json({ success: false, message: "Not authorised" });
    response.json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json({ success: false, message: "Server error" });
  }
});

app.use((err, req, res, next) => {
  if (err?.message === "Only image files are allowed" || err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

app.listen(3000, () => {
  console.log("Server running on port http://localhost:3000/");
});
