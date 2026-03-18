const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");

const User = require("./models/user");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/chatapp");

// middleware
app.use(express.json());
app.use(express.static("public"));

// ROOT ROUTE (IMPORTANT)
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

let onlineUsers = {};

io.on("connection",(socket)=>{

socket.on("join",(username)=>{

onlineUsers[socket.id]=username;

io.emit("onlineUsers",onlineUsers);

});

socket.on("chatMessage",async(data)=>{

let msg = new Message({

sender:data.sender,
receiver:data.receiver,
message:data.message,
time:new Date().toLocaleTimeString()

});

await msg.save();

if(data.receiver==="all"){
io.emit("message",msg);
}
else{
socket.to(data.receiver).emit("message",msg);
socket.emit("message",msg);
}

});

socket.on("typing",(user)=>{
socket.broadcast.emit("typing",user);
});

socket.on("disconnect",()=>{
delete onlineUsers[socket.id];
io.emit("onlineUsers",onlineUsers);
});

});

server.listen(3000,()=>{
console.log("Server running on http://localhost:3000");
});