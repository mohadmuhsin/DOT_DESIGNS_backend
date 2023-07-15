const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  username: {
    type: String,
    requied: true,
  },
  email: {
    type: String,
    requied: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  verified:{
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model("User", userSchema);
