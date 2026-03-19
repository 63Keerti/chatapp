const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");
require("dotenv").config();

const User = require("./models/user");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// ✅ MongoDB Atlas connection (FIXED)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// middleware
app.use(express.json());
app.use(express.static("public"));

// ROOT ROUTE
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

let onlineUsers = {};

io.on("connection", (socket) => {

    socket.on("join", (username) => {
        onlineUsers[socket.id] = username;
        io.emit("onlineUsers", onlineUsers);
    });

    socket.on("chatMessage", async (data) => {
        try {
            let msg = new Message({
                sender: data.sender,
                receiver: data.receiver,
                message: data.message,
                time: new Date().toLocaleTimeString()
            });

            await msg.save();

            if (data.receiver === "all") {
                io.emit("message", msg);
            } else {
                socket.to(data.receiver).emit("message", msg);
                socket.emit("message", msg);
            }
        } catch (err) {
            console.log("Message Error:", err);
        }
    });

    socket.on("typing", (user) => {
        socket.broadcast.emit("typing", user);
    });

    socket.on("disconnect", () => {
        delete onlineUsers[socket.id];
        io.emit("onlineUsers", onlineUsers);
    });

});

// ✅ Dynamic PORT
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});