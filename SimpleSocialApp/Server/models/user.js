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
const { ObjectId } = require("mongoose").Types;

const userSchema = new Schema({
  username: String,
  password: String,
  firstname: String,
  lastname: String,
  admin: Boolean,
});

const userData = model("users", userSchema);

function getUser() {
  let foundData = [];
  foundData = userData.find({});
  return foundData;
}

function findUserById(id) {
  const foundUser = userData.findById(id);
  return foundUser;
}
async function registerUser(username, password, firstname, lastname) {
  try {
    const existing = await userData.findOne({ username: username });
    if (existing) {
      return false;
    }

    await userData.create({
      username: username,
      password: password,
      firstname: firstname,
      lastname: lastname,
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

async function deleteUser(id) {
  console.log(id);
  await userData.findByIdAndDelete(new ObjectId(id));
}

async function updateDetails(
  username,
  password,
  firstname,
  lastname,
  currentUsername
) {
  try {
    const updating = await userData.updateOne(
      { username: currentUsername },
      {
        $set: {
          username: username,
          password: password,
          firstname: firstname,
          lastname: lastname,
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
  deleteUser,
  getUser,
  findUserById,
};
