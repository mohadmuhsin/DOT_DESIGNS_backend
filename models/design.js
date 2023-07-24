const mongoose = require("mongoose");
const designSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  materialType: {
    type: String,
    required: true,
  },
 
  finishType: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designer",
    required: true,
  },
  
  images: {
    type: [{ type: String }],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Design", designSchema);
