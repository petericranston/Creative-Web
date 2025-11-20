// let nextPostID = 2;
// let postData = [
//   {
//     postID: 0,
//     message: "Hello its Peter",
//     user: "Peter",
//   },
//   {
//     postID: 1,
//     message: "Glad its thursday",
//     user: "Jack",
//   },
// ];

const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const { Schema, model } = mongoose;

const postSchema = new Schema({
  user: String,
  message: String,
  likes: Number,
  time: Date,
});

const postData = model("posts", postSchema);

function getPosts() {
  let foundData = [];
  foundData = postData.find({});
  return foundData;
}

async function getLatestNPost(n = 2) {
  let foundData = [];
  foundData = await postData.find({}).sort({ time: -1 }).limit(n).exec();
  return foundData;
}

function addPost(message, user) {
  let newPost = {
    user: user,
    message: message,
    likes: 0,
    time: Date.now(),
  };

  postData.create(newPost).catch((err) => {
    console.log("Error", err);
  });
}

async function deletePost(id) {
  console.log(id);
  await postData.findByIdAndDelete(new ObjectId(id));
}

async function deletePostsWithAccount(username) {
  console.log(username);
  const result = await postData.deleteMany({ user: username });
}

module.exports = {
  addPost,
  getPosts,
  getLatestNPost,
  deletePost,
  deletePostsWithAccount,
};
