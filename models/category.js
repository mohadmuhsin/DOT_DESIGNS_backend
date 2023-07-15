const mongoose = require("mongoose");
const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designer",
  },
});

module.exports = mongoose.model("Category", categorySchema);
