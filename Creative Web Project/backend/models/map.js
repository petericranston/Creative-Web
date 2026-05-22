const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const { ObjectId } = require("mongoose").Types;

//Schemas to organise the data sent to the database
const markerSchema = new Schema({
  coords: Array,
  popUp: String,
  type: String,
});

const mapSchema = new Schema({
  //Making database document layout
  mapName: String,
  markers: [markerSchema],
  owner: String,
  isPublished: Boolean,
});

const mapData = model("map", mapSchema);

async function newMap(markers, mapName, username) {
  //New map function
  try {
    const map = await mapData.create({
      //Creating new map on mongodb
      mapName: mapName,
      markers: markers,
      owner: username,
      isPublished: false,
    });
    return map;
  } catch (err) {
    console.log("Error:", err);
    return false;
  }
}

async function saveChanges(id, markers) {
  //Save changes function
  const result = await mapData.updateOne(
    //Updates the map the new array of markers
    { _id: id },
    { $set: { markers: markers } },
  );
  console.log(result);
}

async function publishMap(id) {
  //Changes the map ispublished variable to true
  const result = await mapData.updateOne(
    { _id: id },
    { $set: { isPublished: true } },
  );
}

async function sendUsersMaps(username) {
  const map = await mapData
    .find({ owner: username })
    .select("_id mapName ")
    .lean(); //Sending all maps of the username in the parameters
  return map;
}

async function sendAllMaps() {
  const map = await mapData
    .find()
    .select("_id mapName owner isPublished")
    .lean(); //Sending all users maps
  return map;
}

async function sendMarkers(id) {
  //Sends markers of the mapid
  const map = await mapData.findById({ _id: id }).select("markers").lean();
  return map.markers;
}

module.exports = {
  newMap,
  saveChanges,
  sendUsersMaps,
  sendMarkers,
  sendAllMaps,
  publishMap,
};
