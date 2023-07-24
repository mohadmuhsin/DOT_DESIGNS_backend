const mongoose = require('mongoose')
const bookingSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      designId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Design",
        required:true
      },
      designerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Designer",
        required: true,
      },
      propertyType: {
        type: String,
        required: true,
      },
      floorPlanType: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
      mobileNumber: {
        type: String,
        required: true,
      },
      consultationFee:{
        type:String,
        required:true
      },
  date: {
    type: Date,
    default:Date.now()
      } ,
      status:{
        type:String,
        default:'Pending'
  },
  payment: [
    {
      date: {
        type: Date,
        required: true,
        default: null
      },
      amount: {
        type: Number,
        required: true,
        default:0
      }
        }
      ]
         
})

module.exports = mongoose.model("Bookings",bookingSchema)