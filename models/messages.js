const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema({
    connectionid:{
       type: mongoose.Schema.Types.ObjectId,
        ref:"Connection",
        required:true
    },
    sender:
    {
        type: mongoose.Schema.Types.ObjectId,
    },
    reciever:
    {
        type: mongoose.Schema.Types.ObjectId,
    },
    message:
    {
        type: String,
        required: true
    },
    createdAt:
    {
        type: Date,
        default: Date.now()
    },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message