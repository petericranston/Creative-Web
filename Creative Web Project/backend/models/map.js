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
  mapID: Number,
  markers: [markerSchema],
});

const mapData = model("map", mapSchema);

async function newMap(mapID, markers, mapName) {
  try {
    await mapData.create({
      //Creating new map on mongodb
      mapName: mapName,
      mapID: mapID,
      markers: markers,
    });

    return true;
  } catch (err) {
    console.log("Error:", err);
    return false;
  }
}

module.exports = {
  newMap,
};
