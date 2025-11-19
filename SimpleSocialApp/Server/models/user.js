// let userData = [
//   {
//     username: "user1",
//     password: "password",
//   },
//   {
//     username: "user2",
//     password: "password",
//   },
// ];

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
});

const userData = model("users", userSchema);

async function registerUser(username, password) {
  try {
    const existing = await userData.findOne({ username: username });
    if (existing) {
      return false;
    }

    await userData.create({
      username: username,
      password: password,
    });

    return true;
  } catch (err) {
    console.log("Error:", err);
    return false;
  }
}

async function checkUser(username, password) {
  const existing = await userData.findOne({ username: username });
  if (!existing) {
    return false;
  }
  return existing.password === password;
}

module.exports = {
  registerUser,
  checkUser,
};
