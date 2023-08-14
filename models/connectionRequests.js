const mongoose = require('mongoose')

const connectionsSchema = mongoose.Schema({
  
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    designer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Designer",
        required: true,
    },
    request: {
        type: Boolean,
        default:false
    },
    accepted: {
        type: Boolean,
        default:false
    },
    createdAt: {
    type: Date,
    default : Date.now()
    }
  
})

module.exports = mongoose.connect("ConnectionRequests",connectionsSchema)