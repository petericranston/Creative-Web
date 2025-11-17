const { model } = require("mongoose");

let userData = [
    {
        username: "user1",
        password: "password"
    },
    {
        username: "user2",
        password: "password"
    }
]

function registerUser(username, password){
    let found=userData.find(user => user.username === username);
    if(found){
        return false;
    }else{
        let newUser={
            username: username,
            password: password
        }
        userData.push(newUser);
        console.log('User registered')
        console.log(userData)
    }
}

function checkUser(username, password){
    let found = userData(user=>user.username === username)
    if(found){
        return found.password==password
    }else{
        return false;
    }
}

module.exports ={
    registerUser,
    checkUser
}