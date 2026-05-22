const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  //Making database document layout

  username: String,
  password: String,
  admin: Boolean,
});

const userData = model("users", userSchema); //Creating scheme for uploading data

async function registerUser(username, password) {
  //Registering new user
  try {
    const existing = await userData.findOne({ username: username });
    if (existing) {
      return false;
    }

    await userData.create({
      //Creating new user on mongodb
      username: username,
      password: password,
      admin: false,
    });

    return true;
  } catch (err) {
    console.log("Error:", err);
    return false;
  }
}

async function checkUser(username, password) {
  //Checking if user exists
  //Finding user
  const user = await userData.findOne({
    username: username,
    password: password,
  });
  return user;
}

module.exports = {
  registerUser,
  checkUser,
};
