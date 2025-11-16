let postData =[
    {
        message: "Hello its Peter",
        user: "Peter"
    },
    {
        message:"Glad its thursday",
        user: "Jack"
    }
]

function getPosts(){
    return postData.slice();
}

function addPost(message, user){
    let newPost={
        message: message,
        user: user
    }
    postData.push(newPost);
}

module.exports={
    addPost,
    getPosts
}
