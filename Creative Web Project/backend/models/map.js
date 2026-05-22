const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const markerSchema = new Schema({ coords: Array, popUp: String, type: String });

const polylineSchema = new Schema({
  points: Array,
  color: { type: String, default: "#8b0000" },
  label: { type: String, default: "" },
});

const mapSchema = new Schema({
  mapName: String,
  description: { type: String, default: "" },
  markers: [markerSchema],
  polylines: { type: [polylineSchema], default: [] },
  imageUrl: { type: String, default: "" },
  owner: String,
  isPublished: Boolean,
});

const mapData = model("map", mapSchema);

async function newMap(markers, mapName, username) {
  try {
    const map = await mapData.create({
      mapName,
      markers,
      owner: username,
      isPublished: false,
    });
    return map;
  } catch (err) {
    console.log("Error:", err);
    return false;
  }
}

async function saveChanges(id, username, markers, polylines) {
  const result = await mapData.updateOne(
    { _id: id, owner: username },
    { $set: { markers, polylines } },
  );
  return result.matchedCount === 1;
}

async function publishMap(id, username) {
  const result = await mapData.updateOne(
    { _id: id, owner: username },
    { $set: { isPublished: true } },
  );
  return result.matchedCount === 1;
}

async function unpublishMap(id, username) {
  const result = await mapData.updateOne(
    { _id: id, owner: username },
    { $set: { isPublished: false } },
  );
  return result.matchedCount === 1;
}

async function updateDescription(id, username, description) {
  const result = await mapData.updateOne(
    { _id: id, owner: username },
    { $set: { description } },
  );
  return result.matchedCount === 1;
}

async function updateImageUrl(id, username, imageUrl) {
  const result = await mapData.updateOne(
    { _id: id, owner: username },
    { $set: { imageUrl } },
  );
  return result.matchedCount === 1;
}

async function sendUsersMaps(username) {
  return mapData.find({ owner: username }).select("_id mapName isPublished description").lean();
}

async function sendAllMaps() {
  return mapData.find().select("_id mapName owner isPublished description").lean();
}

async function sendMarkers(id) {
  const map = await mapData.findById(id).select("markers polylines imageUrl").lean();
  return {
    markers: map.markers,
    polylines: map.polylines ?? [],
    imageUrl: map.imageUrl ?? "",
  };
}

async function deleteMap(id, username) {
  const result = await mapData.deleteOne({ _id: id, owner: username });
  return result.deletedCount === 1;
}

async function renameMap(id, username, newName) {
  const result = await mapData.updateOne(
    { _id: id, owner: username },
    { $set: { mapName: newName } },
  );
  return result.modifiedCount === 1;
}

module.exports = {
  newMap,
  saveChanges,
  sendUsersMaps,
  sendMarkers,
  sendAllMaps,
  publishMap,
  unpublishMap,
  deleteMap,
  renameMap,
  updateDescription,
  updateImageUrl,
};
