const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

const posts=require('./models/posts.js');

app.use(cors());
app.use(express.json());

// Index file served
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/index.html"));
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

app.post('/newpost', (request, response) => {
    posts.addPost(request.body.message, "UserName");
    console.log("Message Sent");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));