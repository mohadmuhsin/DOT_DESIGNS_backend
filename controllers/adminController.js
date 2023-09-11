const express = require("express");
const jwt = require("jsonwebtoken");
const Category = require("../models/category");
const User = require("../models/user");
const Desiger = require("../models/designer");
const Design = require("../models/design");
const Admin = require("../models/admin");
const category = require("../models/category");
const { find } = require("../models/token");
const Designer = require("../models/designer");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dgusa5uo6',
  api_key: '648336148627449',
  api_secret: 'Hd3muvgt9ibvWpGEGVUq71b8U4E'
});


module.exports = {

      
  login: async (req, res) => {
    try {
      const { username } = req.body;
      const Password = req.body.password;
      console.log(req.body);
     c =  await Admin.find()
      console.log(c,"dkldkfj");
      const admin = await Admin.findOne({ userName: username });
      if (!admin) {
        return res.status(404).send({ message: "No user Exist" });
      }
      const isVaildPassword = Password === admin.password;
      if (!isVaildPassword) {
        return res.status(401).send({ message: "Incorrect Password" });
      }
      const token = jwt.sign({ _id: admin._id }, "admin");
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      const { password, ...data } = await admin.toJSON();

      return res.status(201).send({ token, message: "Login successfully" });
    } catch (error) {
      return res.status(500).send({ message: "Server Error!" });
    }
  },

  load_admin: async (req, res) => {
    try {
      const {token} = req.query
      const claims = jwt.verify(token, "admin");
      if (!claims) {
        return res.status(401).send({
          message: "unauthenticated",
        });
      }
      const admin = await Admin.findOne({ _id: claims._id });
      if (!admin) {
        res.status(401).send({ message: "Un Authorized admin" });
      }
      return res.status(200).send( admin );
    } catch (error) {
      return res.status(500).send({ message: "server error" });
    }
  },

  add_category: async (req, res) => {
    try {
      const { category, image } = req.body;
      const exist = await Category.findOne({ name: category });
      if (exist) {
        return res.status(409).send({ message: "Category already exists" });
      } 
      const newCategory = await new Category({
        name: category,
        image: image,
        verified:true
      }).save();
      if (!newCategory) {
        return res.status(409).send({ message: "internal server error" });
      }
      return res.status(201).send({ message: "Category added succesfully" });
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  getCategories:async(req,res)=>{
    try {
      const category = await Category.find({ verified: true })
      res.status(200).send(category)
    } catch (error) {
      return res.status(500).send({message:"server Error"})
    }
  },

  get_category:async(req,res)=>{
    try {
      const {id} = req.params
      const category = await Category.findOne({_id:id})
      if(!category){
        return res.status(404).send({message:'Not Found'})
      }
      return res.status(201).send(category)
    } catch (error) {
      return res.status(500).send({message:"server Error"})
    }
  },

  edit_category:async (req,res)=>{
    try {
      const {data,categoryId} = req.body
      const updat = await Category.updateOne({_id:categoryId},{$set:{name:data.name,image:data.image}})
      return res.status(200).send({message:"Category upadated Successfully"})

    } catch (error) {
      return res.status(500).send({message:"Server Error"})
    }
  },

  getPendingRequest:async (req,res)=>{
    try {
      const category = await Category.find({verified:false})
      const length = category.length
      return res.send(category)
      
    } catch (error) {
      return res.status(500).send({message:"Server Error"})
    }
  },

  approveCategory:async(req,res)=>{
    const {name,image} = req.body
    const exist = await Category.findOne({name:name,verified:true})
    if(exist){
        return res.status(409).send({ message: "Category already exists" });
    }
   const update =  await Category.updateOne({name:name},{$set:{verified:true}})
    if(!update){
      return res.status(422).send({message:"Category is not approved"})
    } 
    return res.status(200).send({message:"Category approved"})
  },

  dropCategory:async(req,res)=>{
    try {
      const {id} = req.params
     const category = await Category.findOne({_id:id})
      cloudinary.uploader.destroy(category._id, (error, result) => {
        if (error) {
          return res.status(404).send({message:"Not Found"})
        } 
      });
      const result = await Category.deleteOne({ _id: id });
      return res.send({message:"Category Deleted"})
    } catch (error) {
      return res.status(500).send({message:"Sever Error"})
    }
  },

  rejectCategoryApproval:async(req,res)=>{
    try {
    const {id}  = req.params
      const delet = await Category.deleteOne({_id:id})
      if(!delet){
        return res.status(404).send({message:'Deletion failed: Item not found'})
      }
      return res.status(200).send({message:"'Deletion successful:"})
    } catch (error) {
      return res.status(500).send({message:"Sever Error"})
    }
  },

  getCounts: async (req, res) => {
    try {
      const designerCount = await Designer.find({}).count()
      const userCount = await User.find({}).count()
      const categoryCount = await Category.find({}).count()
      const designCount = await Design.find({}).count()
      console.log(designCount, designerCount, userCount, categoryCount, "motham ndallo");
      if (designCount, designerCount, userCount, categoryCount) {
        return res.json({designCount, designerCount, userCount, categoryCount})
      }
      
    } catch (error) {
      console.log(error);
      return res.status(500).send({message:"Sever Error"})
      
    }
  },

  getDesigners: async (req, res) => {
    try {
      const designers = await Desiger.find({})
      if (designers) {
        return res.json(designers)
      }
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
      
    }
  },

  blockDesigner: async (req, res) => {
    try {
      const { id } = req.params
      console.log(await Designer.findOne({_id:id}));
      const block = await Designer.updateOne({ _id: id }, { active: false })
      if (block) {
        return res.status(200).send({message:"Blocked successfully"})
      }
      
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
      
    }
  },
  unblockDesigner: async (req, res) => {
    try {
      const { id } = req.params
      const unblock = await Designer.updateOne({ _id: id }, { active: true })
      console.log(unblock);
      if (unblock) {
        return res.status(200).send({message:"unBlocked successfully"})
      }
      
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await User.find()
      if (users) {
        return res.status(200).send(users)
      }
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
      
    }
  },

  blockUsers: async (req, res) => {
    try {

      const { id } = req.params
      console.log(id,"dklfkl");
      const block = await User.updateOne({ _id: id }, { active: false })
      if (block) {
        return res.status(200).send({message:"Blocked user successfully"})
      }
      
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
      
    }
  },

  unblockUsers: async (req, res) => {
    try {
      const { id } = req.params
      console.log(id,"nullaaaaaaan");
      const unblock = await User.updateOne({ _id: id }, { active: true })
      if (unblock) {
        return res.status(200).send({message:"UNBlocked user successfully"})
      }
      
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
      
    }
  }

  ,
  logout: async (req, res) => {
    try {
      res.cookie("jwt", "", { maxAge: 0 });
      res.send({ message: "logout success" });
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },
};
