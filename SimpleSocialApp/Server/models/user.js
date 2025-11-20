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

//Requirements to connect to mongodb
const { resolveInclude } = require("ejs");
const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const { ObjectId } = require("mongoose").Types;

const userSchema = new Schema({
  //Making database document layout

  username: String,
  password: String,
  firstname: String,
  lastname: String,
  admin: Boolean,
});

const userData = model("users", userSchema); //Creating scheme for uploading data

function getUser() {
  //Getting all users
  let foundData = [];
  foundData = userData.find({});
  return foundData;
}

function findUserById(id) {
  //Finding user using id
  const foundUser = userData.findById(id);
  return foundUser;
}
async function registerUser(username, password, firstname, lastname) {
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
  //Finding user
  const user = await userData.findOne({ username: username });
  return user;
}

async function deleteUser(id) {
  //Deleting user
  console.log(id);
  await userData.findByIdAndDelete(new ObjectId(id));
}

async function updateDetails( //Changing user details
  username,
  password,
  firstname,
  lastname,
  currentUsername
) {
  try {
    const updating = await userData.updateOne(
      //Changing user details
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
//Exporting functions for use throughout the program
