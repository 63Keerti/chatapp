const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({

sender:String,

receiver:String,

message:String,

time:String

});

module.exports = mongoose.model("Message",MessageSchema);