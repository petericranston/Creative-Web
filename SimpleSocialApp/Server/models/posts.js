const { model, get } = require("mongoose");

let nextPostID = 2;
let postData = [
  {
    postID: 0,
    message: "Hello its Peter",
    user: "Peter",
  },
  {
    postID: 1,
    message: "Glad its thursday",
    user: "Jack",
  },
];

function getPosts() {
  return postData.slice();
}

function getLatestNPost(n = 2) {
  return postData.slice(-n).reverse();
}

function addPost(message, user) {
  let newPost = {
    postID: nextPostID++,
    message: message,
    user: user,
  };
  postData.push(newPost);
}

module.exports = {
  addPost,
  getPosts,
  getLatestNPost,
};
