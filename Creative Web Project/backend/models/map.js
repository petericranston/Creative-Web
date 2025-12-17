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
});

const mapData = model("map", mapSchema);

async function newMap(markers, mapName) {
  try {
    const map = await mapData.create({
      //Creating new map on mongodb
      mapName: mapName,
      markers: markers,
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

async function getMap(id) {
  foundMap = await mapData.findById(id);
  return foundMap;
}

module.exports = {
  newMap,
  getMap,
  saveChanges,
};
