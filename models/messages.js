const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema({
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    designer:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Designer"
    },
    text:
    {
        type: String,
        required: true
    },
    createdAt:
    {
        type: Date,
        default: Date.now
    },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message