const User = require("../models/user");
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose')
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmial");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Category = require("../models/category");
const Design = require("../models/design");
const token = require("../models/token");
const Booking = require ('../models/bookings');
const Designer = require("../models/designer");
const stripe = require ('stripe')('sk_test_51NUoowSITa8nEg8xf5Cei42bnVwvBSFziVLtO9n1lhwq8vEQxz7EX4wZfLwmvkOVOIF1fO3DCjdN0RVZkgbb6AfY00oD0vHvcI')

module.exports = {
  // user registration
  signUp: async (req, res) => {
    const { name, email, mobileNumber, password } = req.body;
    try {
      const exists = await User.findOne({ email: email });
      if (exists) {
        return res.status(409).send({ message: "User already exists" });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({
        username: name,
        email: email,
        mobileNumber: mobileNumber,
        password: hashed,
      });
      const result = await user.save();
      console.log(result);

      const { _id } = result.toJSON();
      const token = jwt.sign({ _id: _id }, "secret");
      // res.cookie("jwt", token, {
      //   httpOnly: true,
      //   maxAge: 24 * 60 * 60 * 1000,
      // });

      // creating random token for email
      const tok = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();

      const url = `${process.env.BASE_URL}user/${user._id}/verify/${tok.token}`;
      console.log(url);
      await sendEmail(email, "verify Email", url);

      return res.status(201).send({
        token,
        message: "An Email send to your account,Please verify it!",
      });
    } catch (error) {
      console.log(error);
    }
  },

  // verify email
  verify: async (req, res) => {
    const { token, id } = req.body;
    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        res.status(400).send({ message: "Invalid link" });
      }

      const token = await Token.findOne({
        userId: id
      });
      if (!token) {
        return res.status(400).send({ message: "invalid link" });
      }
    
      await User.updateOne({ _id: user._id},{verified: true});
      await token.deleteOne({ userId: id, token: token });

      res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
      console.log(error);
    }
  },


  //   user login
  login: async (req, res) => {
    try {
      const { username } = req.body;
      let Password = req.body.password;

      let user = await User.findOne({ email: username });
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      const isPasswordValid = await bcrypt.compare(Password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send({ message: "Invalid password" });
      }
        const userid = user._id

      //register
      const token = jwt.sign({ _id: user._id }, "secret");
      const { password, ...data } = await user.toJSON();

      if (!user.verified) {
        let token = await Token.findOne({ userId: user._id });
        console.log(token);
        if (!token) {
          token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();
        }
        const url = `${process.env.BASE_URL}user/${user._id}/verify/${token.token}`;
        await sendEmail(username, "verify Email", url);
        
        return res.status(400).send({token,userid, message: "An Email sent to your account,Please verify it"});
      } else {
        // Send the token in the response
        res.status(200).json({ token, userid });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }
  },

  user: async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).send({ message: "UnAuthenticated" });
      } else {
        const user = await User.findOne({ _id: req.userId });
        const { password, ...data } = await user.toJSON();
        return res.status(200).send({ data });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
      console.log(error);
    }
  },


  retrive_categories:async (req,res)=>{
    try {
      const category = await Category.find({});
      if (category) {
        return res.status(200).send(category);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server error" });
    }
  },


  retrive_DesignbyId: async (req, res) => {
    try {
      
      id = req.params.id
      console.log(id);
      const designs = await Design.find({ category: id });
      if (designs) {
        return res.status(200).send(designs);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server error" });
    }
  },


  getDesignDetails:async(req,res)=>{
    try {
      id= req.params.id
      const design = await Design.findOne({_id:id})
      console.log(design,"desiggggggggggggggggn");
      if(!design){
        return res.status(404).send("Not found");
      }
      return res.status(200).send(design)
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  bookingRequest: async (req, res) => {
    try {
      console.log(req.body);
      // consultation should be based on designer charge
      const { designerId, designId } = req.body
      const {propertyType, floorPlanType, location, mobileNumber} = req.body.formData
      console.log(req.userId,'lfdkfld');
      const user = await User.findOne({ _id: req.userId })
      console.log(user);
      if (!user) {
        return res.status(401).send({message:"Un Authenticated user"})
      }

      const booking = new Booking({
        propertyType: propertyType,
        floorPlanType: floorPlanType,
        location: location,
        mobileNumber: mobileNumber,
        consultationFee: 200,
        designerId: designerId,
        designId: designId,
        userId : user._id
      })

      const result = await booking.save()

      if (!result) {
        return res.status(500).send({message:"Booking faild, try again!"})
      }
      console.log(result);
      return res.status(200).send({result})
      
      
    } catch (error) {
      return res.status(500).send({message:"Server Error"})
    }
  },

  feePayment: async (req, res) => {
    try {

      console.log(req.body);
      const {stripeToken,amount,id} =req.body
      const token =stripeToken;
      // Create a PaymentMethod using the token
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: token.id,
        },
      });
  
      // Create a PaymentIntent and attach the PaymentMethod to it
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'INR',
        description: 'Design which you choose',
        payment_method: paymentMethod.id,
        confirm: true,
      });
  
      console.log(paymentIntent);
      const user = await User.findOne({ _id: req.userId });
      const booking = await Booking.updateOne({ _id: id }, { $set: { status: "waiting for consultation", payment: [{date: Date.now(), amount: amount}]}})
      console.log(booking,"saved dataaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      if(booking){
        return res.status(200).send({ res: "success",status:  paymentIntent.status,booking})
      }
  
    } catch (error) {
      console.error(error);
      res.send({ res: "failure" });
    }
  },


  get_last_booking:async (req,res)=>{
    try {
      const booking = await Booking.find({userId:req.userId}).sort({date:-1}).limit(1)
      if(!booking){
        return res.status(404).send({message:"Not Found"})
      }
      return res.status(200).send(booking)
    } catch (error) {
      res.status(500).send({ message: "Server error" });
      
    }
  },

  getbookings:async (req,res)=>{
    try {
      const  bookings = await Booking.find({userId:req.userId}).populate('designerId').populate('designId').sort({date:-1})
      console.log(bookings[0].designId,"populate");
      return res.status(200).send(bookings)
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  booking_detail:async(req,res)=>{
    try {
     const userId = req.userId
     const bookingId = req.params.id
     console.log(bookingId,'des',userId,"user");
     const details = await Booking.findOne({_id:bookingId,userId:userId}).populate('designerId').populate('designId')
     console.log(details,"kldsfdkl");
     if(!details){
      return res.status(404).send("Booking Not found");
     }
     return res.status(200).send(details)
    } catch (error) {
      res.status(500).send({ message: "Server error" });
      
    }
  }
  ,
  rejectBooking:async(req,res)=>{
    try {
      const userId = req.userId
      const bookingId = req.params.id
      const details = await Booking.updateOne({_id:bookingId},{$set:{status:"Booking Cancelled"}})
      if(!details){
       return res.status(404).send({message:"Booking Not found"});
      }
      return res.status(200).send({message:"Booking Cancelled"})
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  rejectPayment:async(req,res)=>{
    try {
      const userId = req.userId
      const bookingId = req.params.id
      const details = await Booking.updateOne({_id:bookingId},{$set:{status:"Payment Rejected"}})
      if(!details){
       return res.status(404).send({message:"Booking Not found"});
      }
      return res.status(200).send({message:"Payment Rejected"})
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  cancellConsultation:async(req,res)=>{
    try {
      const userId = req.userId
      const bookingId = req.params.id
      const details = await Booking.updateOne({_id:bookingId},{$set:{status:"consultation Rejected"}})
      if(!details){
       return res.status(404).send({message:"Booking Not found"});
      }
      return res.status(200).send({message:"consultation Rejected"})
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  cancellProject:async(req,res)=>{
    try {
      const userId = req.userId
      const bookingId = req.params.id
      const details = await Booking.updateOne({_id:bookingId},{$set:{status:"Project Rejected"}})
      if(!details){
       return res.status(404).send({message:"Booking Not found"});
      }
      return res.status(200).send({message:"Project Rejected"})
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  getDesignersList:async (req, res) => {
    try {
      const designers = await Designer.find({ verified: true })
      if (!designers) {
        return res.status(404).send({message:"Designers not Found"})
      }
      return res.status(200).send(designers)
    } catch (error) {
      return res.status(500).send({message:"Server Error"})
    }
  },

  connectDesigner: async (req, res) => {
      try {
        const designer_id = req.params.id
        const user = req.userId 
        const exist = await Designer.findOne({ _id: designer_id, connectionRequest:{$elemMatch: { userId: user }} })
        console.log(exist);
        if (exist) {
          return res.status(409).send({message:'Request already sent!'})
        }
        const permission = await Designer.updateOne({ _id: designer_id}, { $push:{connectionRequest:{ request: "requested",userId:user,_id: new mongoose.Types.ObjectId(),}}})
       console.log(permission,'ls');
        if (!permission) {
        return res.status(404).send({message:'No matching found'})
        }
        return res.status(200).send({message:"Request send Successfully"})
    } catch (error) {
      console.log(error);
      return res.status(500).send({message:"Server Error"})
    }
  },

  getDesignerData: async (req, res) => {
    try {
      const id = req.params.id
      const designer = await Designer.findOne({ _id: id })
      const designs = await Design.find({designer : id})
      if (!designer&&!designs) {
        return res.status(404).send({message:"Designer not found"})
      }
      const data = {
        designer,designs
      }
      return res.status(200).send(data)
    } catch (error) {
      return res.status(500).send({message:"Server Error"})
    }
  },
  getDesignerDesign: async (req, res) => {
    try {
      const {catId,designerId} = req.query
      console.log(catId, designerId);
      
      const data = await Design.find({ category: catId, designer: designerId })
      console.log(data,"dklk");
      if (!data) {
        return res.status(404).send({message:"No Matched Designs"})
      }
      return res.status(200).send(data)
    } catch (error) {
      console.log(error);
    }
  }
,
  logout: async (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    res.send({ message: "logout success" });
  },
};
