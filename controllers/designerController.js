const Designer = require("../models/designer");
const sendEmial = require("../utils/sendEmial");
const Token = require("../models/token");
const Design = require("../models/design");
const Category = require("../models/category");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { emit } = require("process");
const { log } = require("console");

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
      console.log("herer");
      const cookie = req.cookies["jwt"];
      const claims = jwt.verify(cookie, "designer");
      if (!claims) {
        return res.status(401).send({
          message: "unauthenticated",
        });
      }
      const designer = await Designer.findOne({ _id: claims._id });
      console.log(req.body);
      const {
        designName,
        materialType,
        finishType,
        category,
        image,
        description,
      } = req.body;
      const exist = await Design.findOne({ name: designName });
      if (exist) {
        return res.status(409).send({ message: "Design already exist" });
      }
      const design = new Design({
        name: designName,
        materilaType: materialType,
        finishType: finishType,
        category: category,
        designer: designer._id,
        images: image,
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

  retrive_Designs: async (req, res) => {
    try {
      id = req.params.id;
      const designs = await Design.find({ category: id });
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
      console.log(id, "idd");
      const design = await Design.findOne({ _id: id });
      console.log(design, "it here");
      const desiger = await Category.findOne({ _id: design.category });
      console.log(desiger, "nd tata");
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
      console.log(data.token, "dkljkfddlfkdfk");
      const category = data.data.category;
      const image = data.data.image;
      console.log(image,"dflkdflkfj");
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
        requester:desiger._id
      }).save()
      if(!NewCategory){
        return res.status(409).send({message:'Internal server error'})
      }
      return res.status(200).send({message:"Request send for approval"})

    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  logout: async (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    res.send({ message: "logout success" });
  },
};
