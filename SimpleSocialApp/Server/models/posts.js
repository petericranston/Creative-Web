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

//Requirements to access mongodb database
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const { Schema, model } = mongoose;

const postSchema = new Schema({
  //Making database document layout
  user: String,
  message: String,
  likes: Number,
  time: Date,
});

const postData = model("posts", postSchema); //Creating scheme for uploading data

function getPosts() {
  //Getting all posts
  let foundData = [];
  foundData = postData.find({});
  return foundData;
}

async function getLatestNPost(n = 2) {
  //Getting latests posts (most recent (set to 8 in server file))
  let foundData = [];
  foundData = await postData.find({}).sort({ time: -1 }).limit(n).exec();
  return foundData;
}

function addPost(message, user) {
  //Adding new post to mongodb
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
  //Deleting posts functionality using id
  console.log(id);
  await postData.findByIdAndDelete(new ObjectId(id));
}

async function deletePostsWithAccount(username) {
  //Deleting all the users posts when they are deleted
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
//Exporting all functions to use on other files
