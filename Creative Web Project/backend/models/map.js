const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const { ObjectId } = require("mongoose").Types;

const markerSchema = new Schema({
  xCord: Number,
  yCord: Number,
  popUp: String,
});

const mapSchema = new Schema({
  //Making database document layout
  mapID: Number,
  markers: [markerSchema],
});

async function newMap(mapID, markers) {
  //Registering new user
  try {
    await userData.create({
      //Creating new user on mongodb
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
