const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

const sessions = require('express-session');
const cookieParser=require('cookie-parser');

const posts=require('./models/posts.js');
const userModel=require('./models/user.js')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const threeMinutes = 3*60*1000;
const oneHour = 1*60*60*1000;

app.use(sessions({
    secret: "my secret phrase",
    cookie: {maxAge: threeMinutes},
    resave: false,
    saveUninitialized: false
}))

// Index file served first
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "../Client/index.html"));
});

app.get("/app", (request, response)=> {
    response.sendFile(path.join(__dirname, '/views', '/app.html'));
});

app.get("/login", (request, response)=> {
    response.sendFile(path.join(__dirname, '/views', '/login.html'));
});

app.get("/logout", (request, response)=> {
    response.sendFile(path.join(__dirname, '/views', '/logout.html'));
});

app.get("/register", (request, response)=> {
    response.sendFile(path.join(__dirname, '/views', '/register.html'));
});

app.get('/getposts', (request, response) => {
    response.json({posts: posts.getPosts()}) 
}) 

app.post('/newpost', (request, response) => {
    if(request.body.message != ""){
       posts.addPost(request.body.message, request.session.username);
        response.sendFile(path.join(__dirname, '/views', '/app.html'));
        console.log("Message Sent");
    }
});

app.post('/register', (request, response) => {
    userModel.registerUser(request.body.username, request.body.password);
    request.session.username=request.body.username;
    response.sendFile(path.join(__dirname, '/views', '/app.html'));
})

app.post('/login', (request, response)=> {
    if(userModel.checkUser(request.body.username, request.body.password)){
        request.session.username=request.body.username;
        response.sendFile(path.join(__dirname, '/views', '/app.html'));
    }else{
        response.sendFile(path.join(__dirname, '/views', '/login_failed.html'));
    }
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));