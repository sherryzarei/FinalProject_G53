const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sender ID is required"],
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Recipient ID is required"],
    },
    messageType: {
        type: String,
        enum: ["text", "image"],
        required: [true, "Message type is required"],
    },
    message: String,
    imageUrl: String,
    timeStamp: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
