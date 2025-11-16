const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

const posts=require('./models/posts.js');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
       posts.addPost(request.body.message, "Users Name");
        response.sendFile(path.join(__dirname, '/views', '/app.html'));
        console.log("Message Sent");
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));