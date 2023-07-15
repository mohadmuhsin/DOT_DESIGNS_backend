const express = require("express");
const jwt = require("jsonwebtoken");
const Category = require("../models/category");
const User = require("../models/user");
const Desiger = require("../models/designer");
const Design = require("../models/design");
const Admin = require("../models/admin");
const category = require("../models/category");

module.exports = {
  login: async (req, res) => {
    try {
      const { username } = req.body;
      const Password = req.body.password;

      const admin = await Admin.findOne({ email: username });
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
      const cookie = req.cookies["jwt"];
      console.log(cookie);
      const claims = jwt.verify(cookie, "admin");
      if (!claims) {
        return res.status(401).send({
          message: "unauthenticated",
        });
      }
      const admin = await Admin.findOne({ _id: claims._id });
      if (!admin) {
        res.status(401).send({ message: "Un Authorized admin" });
      }
      return res.status(200).send({ admin });
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
      console.log("here it is");
      const category = await Category.find({verified:true})
      console.log(category);
      res.status(200).send(category)
    } catch (error) {
      return res.status(500).send({message:"server Error"})
    }
  }
  ,
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
      const {name,image} = req.body
      console.log(req.body,"klsfjsdlfkjfldsk");


    } catch (error) {
      return res.status(500).send({message:"Server Error"})
    }
  },
  getPendingRequest:async (req,res)=>{
    try {
      const category = await Category.find({verified:false})
      return res.send(category)
      
    } catch (error) {
      return res.status(500).send({message:"Server Error"})
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
