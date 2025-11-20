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

const { resolveInclude } = require("ejs");
const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
  admin: Boolean,
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
  return user;
}

async function updateDetails(username, password, currentUsername) {
  try {
    const updating = await userData.updateOne(
      { username: currentUsername },
      {
        $set: {
          username: username,
          password: password,
        },
      }
    );
  } catch (err) {
    console.log("Error:", err);
    return false;
  }
}

module.exports = {
  registerUser,
  checkUser,
  updateDetails,
};
