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
  feedback: [{
    text: {
      type: String,
    },
    image: {
      type:String
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookingId: {
      type:mongoose.Schema.Types.ObjectId,
      ref: 'Bookings'
    },
    date: {
      type: Date,
      default: Date.now()
    }
  }
  ]
});

module.exports = mongoose.model("Design", designSchema);
