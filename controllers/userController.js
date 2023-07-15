const User = require("../models/user");
const bcrypt = require("bcryptjs");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmial");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Category = require("../models/category");

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
        console.log(url);
        await sendEmail(username, "verify Email", url);

        return res.status(400).send({token, message: "An Email sent to your account,Please verify it"});
      } else {
        // Send the token in the response
        res.status(200).json({ token, data });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }
  },

  user: async (req, res) => {
    console.log(req.userId, "headers");
    try {
      if (!req.userId) {
        return res.status(401).send({ message: "UnAuthenticated" });
      } else {
        const user = await User.findOne({ _id: req.userId });
        // console.log(token);
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

  logout: async (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    res.send({ message: "logout success" });
  },
};
