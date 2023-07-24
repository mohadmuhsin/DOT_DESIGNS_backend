const Designer = require("../models/designer");
const sendEmial = require("../utils/sendEmial");
const Token = require("../models/token");
const Design = require("../models/design");
const Category = require("../models/category");
const Booking = require('../models/bookings')

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { emit } = require("process");
const { log } = require("console");
const design = require("../models/design");

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dgusa5uo6',
  api_key: '648336148627449',
  api_secret: 'Hd3muvgt9ibvWpGEGVUq71b8U4E'
});



module.exports = {
  signup: async (req, res) => {
    try {
      const { name, email, mobileNumber, password } = req.body;
      const exists = await Designer.findOne({ email: email });
      if (exists) {
        return res.status(409).send({ message: "Designer already exist" });
      }

      const hash = await bcrypt.hash(password, 10);
      const designer = new Designer({
        entity_name: name,
        email: email,
        mobileNumber: mobileNumber,
        password: hash,
      });

      const result = await designer.save();

      console.log(result);
      // jwt
      const { _id } = result.toJSON();
      const token = jwt.sign({ _id: _id }, "designer");
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      const tok = await new Token({
        userId: designer._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();

      const url = `${process.env.BASE_URL}designer/${designer._id}/verify/${tok.token}`;
      await sendEmial(email, "verify emial", url);
      return res.status(201).send({
        token,
        message: "An Email send to your account,Please verify it!",
      });
    } catch (error) {
      return res.status(401).send({
        message: "unauthenticated" || error,
      });
    }
  },

  verify: async (req, res) => {
    try {
      const { id, token } = req.body;
      console.log(id, token);
      const designer = await Designer.findOne({ _id: id });
      if (!designer) {
        return res.status(400).send({ message: "Invalid link" });
      }
      const tok = await Token.findOne({ userId: id });
      if (!tok) {
        return res.status(400).send({ message: "Invalid link" });
      }
      await Designer.updateOne({ _id: id }, { verified: true });
      await Token.deleteOne({ userId: id });
      return res.status(200).send({ message: "Email verified" });
    } catch (error) {
      return res.status(401).send({ message: "UnAuthenticated" || error });
    }
  },

  login: async (req, res) => {
    try {
      const { username } = req.body;
      const Password = req.body.password;

      const designer = await Designer.findOne({ email: username });
      if (!designer) {
        return res.status(404).send({ message: "Designer not found" });
      }
      const validPassword = await bcrypt.compare(Password, designer.password);
      if (!validPassword) {
        return res.status(401).send({ message: "Invalid password" });
      }

      //register
      const token = jwt.sign({ _id: designer._id }, "designer");
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      console.log(token, "token");
      const { password, ...data } = await designer.toJSON();

      if (!designer.verified) {
        const token = await Token.findOne({ userId: designer._id });

        if (!tok) {
          tok = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();

          const url = `${process.env.BASE_URL}designer/${designer._id}/verify/${tok.token}`;
          await sendEmial(username, "verify email", url);

          return res.status(400).send({
            token,
            data,
            message: "An Email sent to your account,Please verify it",
          });
        }
      }
      return res.status(200).json({ token, data });
    } catch (error) {}
  },

  designer: async (req, res) => {
    try {
      const cookie = req.cookies["jwt"];
      const claims = jwt.verify(cookie, "designer");
      if (!claims) {
        return res.status(401).send({
          message: "unauthenticated",
        });
      }
      // if(!req.designerId){
      //   return res.status(401).send({message:"UnAuthenticated"})
      // }else{
      //   const designer = await Designer.findOne({_id: req.designerId})
      const designer = await Designer.findOne({ _id: claims._id });
      const { password, ...data } = await designer.toJSON();
      res.status(200).send({ data });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getProfileData: async (req, res) => {
    try {
      console.log("dklfklkdlkfjlfjdfsl");
      const {token} = req.query 
      const claims = jwt.verify(token, "designer")
      console.log(claims);
      const designer = await Designer.findOne({ _id: claims._id })
      if (!designer) {
        return res.status(404).send({ message: "Designer not found" })
      }
      return res.status(200).send(designer)
    } catch (error) {
      return res.status(500).send({message:"Server Error"})
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { token } = req.body
      const claims = jwt.verify(token, "designer")
      console.log(req.body);
      const {entity_name,address,district,state,mobileNumber,website,bio,image} = req.body.data
      const update = await Designer.updateOne({_id:claims._id},{$set:{entity_name:entity_name,mobileNumber:mobileNumber,profile:{address:address,district:district,website:website,bio:bio,profilePhoto:image,status:true,state:state}}})
      if (!update) {
        return res.status(300).send({message:"Updation Failed"})
      }
      return res.status(200).send({message:"Updation Successfull"})
    } catch (error) {
      return res.status(500).send({message:"Server Error"})
    }
  }
  ,

  retrive_categories: async (req, res) => {
    try {
      const cookie = req.cookies["jwt"];
      const claims = jwt.verify(cookie, "designer");
      if (!claims) {
        return res.status(401).send({
          message: "unauthenticated",
        });
      }

      const Categories = await Designer.find({ _id: claims._id }, "categories");
      if (!Categories) {
        return res.status(404).send("Not found");
      }
      const categories = Categories[0].categories.map((category) =>
        category.toJSON()
      );

      res.status(200).send(categories);
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  add_design: async (req, res) => {
    try {
      const {token} = req.body
      // const cookie = req.cookies["jwt"];
      const claims = jwt.verify(token, "designer");
      if (!claims) {
        return res.status(401).send({
          message: "unauthenticated",
        });
      }
      const designer = await Designer.findOne({ _id: claims._id });
      console.log(req.body.data);
      const {
        designName,
        materialType,
        finishType,
        category,
        images,
        description,
      } = req.body.data;
      const exist = await Design.findOne({ name: designName,designer:claims._id });
      if (exist) {
        return res.status(409).send({ message: "Design already exist" });
      }
      const design = new Design({
        name: designName,
        materialType: materialType,
        finishType: finishType,
        category: category,
        designer: designer._id,
        images: images,
        description: description,
      }).save();

      if (design) {
        res.status(201).send({ message: "Design uploaded" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server error" });
    }
  },

  updateDesign: async (req, res) => {
    try {
      console.log(req.body);
      const { token,designId } = req.body
      const claims = jwt.verify(token, "designer");

      if (!claims) {
        return res.status(401).send({
          message: "unauthenticated",
        });
      }
      const designer = await Designer.findOne({ _id: claims._id });

       const {
        designName,
        materialType,
        finishType,
        images,
        description,
      } = req.body.data;

      const update = await Design.updateOne({ _id:designId},{$set:{
        name: designName,
        materialType: materialType,
        finishType: finishType,
        images: images,
        description: description,
      }
      })
      if (!update) {
        return res.status(401).send({message:'Updation Failed'})
      }
      return res.status(200).send({message:"Updation Successful"})
    } catch (error) {
      return res.status(500).send({message:"Sever Error"})
    }
  },

  deleteDesignImage: async (req, res) => {
    try {
      console.log('kldfjdkl');
      const { link, designId } = req.query;
      console.log(req.query);
      const result = await cloudinary.uploader.destroy(link);
    
      const dele = await Design.updateOne({ _id: designId },{ $pull: { images: link } });

      if (!result && dele) {
        return res.status(404).send({message:"Deletion Error"})
      }
      return res.status(200).send({message:"Image Deleted succfully"})
  } catch (error) {
    return res.status(500).send({message:"Server Error"})
  }
},

  deleteDesign: async (req, res) => {
    try {
      const { id } = req.params
      dele = await Design.deleteOne({ _id: id })
      if (!dele) {
        return res.status(404).send({message:'Not Found'})
      }
      return res.status(200).send({message:"Deleted Successfully"})
    } catch (error) {
      return res.status(500).send({message:"Server Error"})
    }
  }
  ,


  retrive_Designs: async (req, res) => {
    try {
      id = req.params.id
    const  token = req.params.token
      const claims = jwt.verify(token, "designer");
      const designs = await Design.find({ designer: claims._id, category: id });
      if (designs) {
        return res.status(200).send(designs);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server error" });
    }
  },
  // for store
  get_Designs: async (req, res) => {
    try {
      const designs = await Design.find({});
      if (designs) {
        return res.status(200).send(designs);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server error" });
    }
  },

  get_design_data: async (req, res) => {
    try {
      const { id } = req.params;
      const design = await Design.findOne({ _id: id }).populate('category')
      // const desiger = await Category.findOne({ _id: design.category });
      if (!design) {
        return res.status(404).send({ message: "Not found" });
      }
      return res.status(200).send(design);
    } catch (error) {
      res.status(500).send({ message: "server error" });
    }
  },

  sendRequest: async (req, res) => {
    try {
      const data = ({ Data } = req.body);
      const category = data.data.category;
      const image = data.data.image;
      const exist = await Category.findOne({ name: category });
      if (exist) {
        return res.status(409).send({ message: "Category already exists" });
      }
      const claims = jwt.verify(data.token, "designer");
      if (!claims) {
        return res.status(401).send({
          message: "unauthenticated",
        });
      }
      const desiger = await Designer.findOne({ _id: claims._id });
      const NewCategory = new Category({
        name:category,
        image:image,
        requester:desiger._id,
        verified:false
      }).save()
      if(!NewCategory){
        return res.status(409).send({message:'Internal server error'})
      }
      return res.status(200).send({message:"Request send for approval"})

    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  getRequests:async (req,res)=>{
    try {
      const {token} = req.params
      const claims =   jwt.verify(token, "designer");
      const designs = await Booking.find({designerId:claims._id }).populate('designerId').populate('designId').sort({date:-1})
      if(!designs){
        return res.status(404).send({message:"There is no pending requests"})
      }
      return res.status(200).send(designs)
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
      
    }
  },

  acceptRequest:async (req,res)=>{
    try {
      const id  = req.body.id
      console.log(req.body.id,"booking id");
      const requests = await Booking.updateOne({_id:id},{$set:{status:"Waiting for Payment"}})
      if(!requests){
       return res.send({message:'confirmation failed'})
      }
      console.log(requests,"dklkd");
      return res.status(200).send({message:"confirmation successfull"})
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },
  
  rejectRequest:async (req,res)=>{
    try {
      const id  = req.body.id
      console.log(req.body.id,"booking id");
      const requests = await Booking.updateOne({_id:id},{$set:{status:"Consultation Rejected"}})
      if(!requests){
       return res.send({message:'Rejection failed'})
      }
      console.log(requests,"dklkd");
      return res.status(200).send({message:"Rejection successfull"})
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },
  consultationDone:async (req,res)=>{
    try {
      const id  = req.body.id
      console.log(req.body.id,"booking id");
      const requests = await Booking.updateOne({_id:id},{$set:{status:"Consultation Done"}})
      if(!requests){
       return res.send({message:'Rejection failed'})
      }
      console.log(requests,"dklkd");
      return res.status(200).send({message:"Rejection successfull"})
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },
  StartProject:async (req,res)=>{
    try {
      const id  = req.body.id
      console.log(req.body.id,"booking id");
      const requests = await Booking.updateOne({_id:id},{$set:{status:"Work in Progress"}})
      if(!requests){
       return res.send({message:'failed to find matched projects'})
      }
      console.log(requests,"dklkd");
      return res.status(200).send({message:"Project started successfull"})
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },

  projectCompleted:async (req,res)=>{
    try {
      console.log("dlksfklfj");
      const id  = req.body.id
      console.log(req.body.id,"booking id");
      const requests = await Booking.updateOne({_id:id},{$set:{status:"Completed"}})
      if(!requests){
       return res.send({message:'submission failed'})
      }
      console.log(requests,"dklkd");
      return res.status(200).send({message:"Completed successfully"})
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },


  logout: async (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    res.send({ message: "logout success" });
  },
};
