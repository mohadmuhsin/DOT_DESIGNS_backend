const mongoose = require("mongoose");

const designerSchema = mongoose.Schema({
  entity_name: {
    type: String,
    required: true, 
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
  connectionRequest: [
    {
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
        type: String,
        default:"No request"
      },
      createdAt: {
        type: Date,
        default : Date.now()
      }
    }
  ],
  designs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Design",
    }
  ],
  IsPremium: {
    type: Boolean,
    default:false
  },
  PremiumStartDate: {
    type: Number,
    default:null
  },
  active: {
    type: Boolean,
    default:true
  }
});

const Designer = mongoose.model("Designer", designerSchema);
module.exports = Designer
