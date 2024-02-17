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

  },
  mobileNumber: {
    type: Number,
  },
  verified: {
    type: Boolean,
    default: false
  },
  google: {
    type: Boolean,
    default: false
  },
  chat: [],
  connectedDesigners: [{

    type: mongoose.Schema.Types.ObjectId,
    ref: "Designer",
  }
  ],
  wishlist: [{

    type: mongoose.Schema.Types.ObjectId,
    ref: "Design",

  }],
  active: {
    type: Boolean,
    default: true
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User
