const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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

    const hashedPassword = await bcrypt.hash(password, 12);

    await userData.create({
      username: username,
      password: hashedPassword,
      admin: false,
    });

    return true;
  } catch (err) {
    console.log("Error:", err);
    return false;
  }
}

async function checkUser(username, password) {
  const user = await userData.findOne({ username: username });
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  return match ? user : null;
}

module.exports = {
  registerUser,
  checkUser,
};
