const mongoose = require("mongoose");
const adminSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  
});

module.exports = mongoose.model("Admin", adminSchema);
