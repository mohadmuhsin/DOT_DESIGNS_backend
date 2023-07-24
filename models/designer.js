const mongoose = require("mongoose");

const designerSchema = mongoose.Schema({
  entity_name: {
    type: String,
    required: true, // Corrected typo "requied" to "required"
  },
  email: {
    type: String,
    required: true,
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
  verified: {
    type: Boolean,
    default: false,
  },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bookings' }],
  profile: {
   
    
    address: {
      type: String,
      required:true
    },
    district: {
      type: String,
      required:true
    },
    state: {
      type: String,
      required:true
    },
    website:{
      type: String,
      required:true
    },
    bio: {
      type: String,
      required:true
    },
    
    profilePhoto: {
      type: String,
      required:true
    },
    status: {
      type: Boolean,
      default:false
    },
  },
  connectionRequest: [{
       _id:{
        type: mongoose.Types.ObjectId, 
        default: new mongoose.Types.ObjectId, 
      },
       userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      request: {
        type: Boolean,
        default:false
      },
      createdAt: {
        type: Date,
        default : Date.now()
      }
   }
  ],
 designs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Design",
  }],

  
});

module.exports = mongoose.model("Designer", designerSchema);
