const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const { ObjectId } = require("mongoose").Types;

const markerSchema = new Schema({
  coords: Array,
  popUp: String,
});

const mapSchema = new Schema({
  //Making database document layout
  mapName: String,
  markers: [markerSchema],
  owner: String,
});

const mapData = model("map", mapSchema);

async function newMap(markers, mapName, username) {
  try {
    const map = await mapData.create({
      //Creating new map on mongodb
      mapName: mapName,
      markers: markers,
      owner: username,
    });
    return map;
  } catch (err) {
    console.log("Error:", err);
    return false;
  }
}

async function saveChanges(id, markers) {
  const result = await mapData.updateOne(
    { _id: id },
    { $set: { markers: markers } }
  );
  console.log(result);
}

async function sendUsersMaps(username) {
  return await mapData.find({ owner: username }).select("_id mapName").lean(); //Sending all maps of the username in the parameters
}
async function sendMarkers(id) {
  return await mapData.find({ _id: id }).select("markers").lean();
}

module.exports = {
  newMap,
  saveChanges,
  sendUsersMaps,
  sendMarkers,
};
