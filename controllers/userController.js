const User = require("../models/user");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmial");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Category = require("../models/category");
const Design = require("../models/design");
const token = require("../models/token");
const Booking = require("../models/bookings");
const Designer = require("../models/designer");
const nodemailer = require("nodemailer");
require("dotenv").config();

const stripe = require("stripe")(
  "sk_test_51NUoowSITa8nEg8xf5Cei42bnVwvBSFziVLtO9n1lhwq8vEQxz7EX4wZfLwmvkOVOIF1fO3DCjdN0RVZkgbb6AfY00oD0vHvcI"
);

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

      const url = `${process.env.BASE_URL}/user/${user._id}/verify/${tok.token}`;
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
        userId: id,
      });
      if (!token) {
        return res.status(400).send({ message: "invalid link" });
      }

      await User.updateOne({ _id: user._id }, { verified: true });
      await token.deleteOne({ userId: id, token: token });

      res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
      console.log(error);
    }
  },

  login: async (req, res) => {
    try {
      const { Data, method } = req.body;
      console.log(Data, method, "dkfdsflj");
      const { email } = req.body.Data;
      let user = await User.findOne({ email: email });
        console.log(user);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      const blocked = await User.findOne({ email: Data.email });
      if (!blocked.active) {
        return res.status(500).send({ message: "You are blocked" });
      }
      if (method === "google") {
        const { email } = req.body.Data;
       
        const token = jwt.sign({ _id: user._id }, "secret");
        const userid = user._id;
        return res.status(200).json({ token, userid });
      }
      else if (method === "normal") {
        const { email } = req.body.Data;
        console.log(req.body.Data, "dkfk");
        let Password = req.body.Data.password;
        const isPasswordValid = await bcrypt.compare(Password, user.password);
        if (!isPasswordValid) {
          return res.status(401).send({ message: "Invalid password" });
        }
        const userid = user._id;
        console.log(userid);

        //register
        const token = jwt.sign({ _id: user._id }, "secret");
        console.log(token);
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
          const url = `${process.env.BASE_URL}/user/${user._id}/verify/${token.token}`;
          await sendEmail(email, "verify Email", url);

          return res
            .status(400)
            .send({
              token,
              userid,
              message: "An Email sent to your account,Please verify it",
            });
        } else {
          // Send the token in the response
          res.status(200).json({ token, userid });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }
  },

  loginWithGoogle: async (req, res) => {
    
    try {
      const { name, email } = req.body.userData;
      console.log(req.body);
      const user = new User({
        username: name,
        email: email,
        verified: true,
      });
      const result = await user.save();
      if (!result) {
        return res.status(400).send({ message: "Forbidden" });
      }
      return res.status(200).send(result);
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  verifyEmailforForget: async (req, res) => {
    try {
      const { mail } = req.params;
      const getuser = await User.findOne({ email: mail });
      if (!getuser) {
        return res.status(404).send({ message: "Mail is not registered" });
      }

       const tok = await new Token({
        userId: getuser._id,
        token: crypto.randomBytes(32).toString("hex"),
       }).save();
      
      const url = `${process.env.BASE_URL}/user/${getuser._id}/forgotPassword/${tok.token}`;
      console.log(url);
      await sendEmail(mail, "verify Email", url);
      
      return res.status(200).send(getuser);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { email, password } = req.body.data;
     
      const hashed = await bcrypt.hash(password, 10);
      const update = await User.updateOne(
        { email: email },
        { password: hashed }
      );
      return res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
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

  getUser: async (req, res) => {
    try {
    
      const { id } = req.params
     
      const user = await User.findOne({ _id: id })
      if (user) {
        return res.status(200).send(user)
      }
    
  } catch (error) {
      res.status(500).json({ error: "Internal server error" });
  }
}
  ,

  retrive_categories: async (req, res) => {
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
      id = req.params.id;
      console.log(id,"df");
      const designs = await Design.find({ category: id });
      console.log(designs);
      if (designs) {
        return res.status(200).send(designs);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server error" });
    }
  },

  getDesignDetails: async (req, res) => {
    try {
      id = req.params.id;
      const design = await Design.findOne({ _id: id });
      console.log(design, "desiggggggggggggggggn");
      if (!design) {
        return res.status(404).send("Not found");
      }
      return res.status(200).send(design);
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  addTowhishlist: async (req, res) => {
    try {
      const { id } = req.body;
      const user = req.userId;
      const exist = await User.findOne({ _id: user, wishlist: id });
      if (exist) {
        return res
          .status(409)
          .send({ message: "Design already in whilshlist" });
      }
      const addtowishlist = await User.updateOne(
        { _id: user },
        { $push: { wishlist: new mongoose.Types.ObjectId(id) } }
      );
      if (addtowishlist) {
        return res.status(200).send({ message: "Design added to wishlist" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server error" });
    }
  },

  getWishlistDesigns: async (req, res) => {
    try {
      const userId = req.userId;
      const designs = await User.find(
        { _id: userId },
        { _id: 1, wishlist: 1 }
      ).populate("wishlist");
      console.log(designs);
      if (!designs) {
        return res.status(404).send({ message: "wishlish is empty" });
      }
      return res.status(200).send(designs);
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },
  removeFromWishlist: async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.body;
      const remove = await User.updateOne(
        { _id: userId },
        { $pull: { wishlist: id } }
      );
      console.log(remove);

      if (!remove) {
        return res.status(409).send({ message: "something went wrong" });
      }
      return res.status(200).send({ message: "Removed successfully" });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  bookingRequest: async (req, res) => {
    try {
      // consultation should be based on designer charge
      const { designerId, designId } = req.body;
      const { propertyType, floorPlanType, location, mobileNumber } =
        req.body.formData;
      const user = await User.findOne({ _id: req.userId });
      console.log(user);
      if (!user) {
        return res.status(401).send({ message: "Un Authenticated user" });
      }

      const booking = new Booking({
        propertyType: propertyType,
        floorPlanType: floorPlanType,
        location: location,
        mobileNumber: mobileNumber,
        consultationFee: 200,
        designerId: designerId,
        designId: designId,
        userId: user._id,
      });

      const result = await booking.save();

      if (!result) {
        return res.status(500).send({ message: "Booking faild, try again!" });
      }
      return res.status(200).send({ result });
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  feePayment: async (req, res) => {
    try {
      const { stripeToken, amount, id } = req.body;
      const token = stripeToken;
      
      // Create a PaymentMethod using the token
      const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
          token: token.id,
        },
      });

      // Create a PaymentIntent and attach the PaymentMethod to it
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: "INR",
        description: "Design which you choose",
        payment_method: paymentMethod.id,
        confirm: true,
      });

      const user = await User.findOne({ _id: req.userId });
      const booking = await Booking.updateOne(
        { _id: id },
        {
          $set: {
            status: "waiting for consultation",
            payment: [{ date: Date.now(), amount: amount }],
          },
        }
      );
      if (booking) {
        return res
          .status(200)
          .send({ res: "success", status: paymentIntent.status, booking });
      }
    } catch (error) {
      console.error(error);
      res.send({ res: "failure" });
    }
  },

  get_last_booking: async (req, res) => {
    try {
      const booking = await Booking.find({ userId: req.userId })
        .sort({ date: -1 })
        .limit(1);
      if (!booking) {
        return res.status(404).send({ message: "Not Found" });
      }
      return res.status(200).send(booking);
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  getbookings: async (req, res) => {
    try {
      const bookings = await Booking.find({ userId: req.userId })
        .populate("designerId")
        .populate("designId")
        .sort({ date: -1 });
      console.log(bookings[0].designId, "populate");
      return res.status(200).send(bookings);
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  booking_detail: async (req, res) => {
    try {
      const userId = req.userId;
      const bookingId = req.params.id;
      //  console.log(bookingId,'des',userId,"user");
      const details = await Booking.findOne({ _id: bookingId, userId: userId })
        .populate("designerId")
        .populate("designId");
      //  console.log(details,"kldsfdkl");
      if (!details) {
        return res.status(404).send("Booking Not found");
      }
      return res.status(200).send(details);
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },
  rejectBooking: async (req, res) => {
    try {
      const userId = req.userId;
      const bookingId = req.params.id;
      const details = await Booking.updateOne(
        { _id: bookingId },
        { $set: { status: "Booking Cancelled" } }
      );
      if (!details) {
        return res.status(404).send({ message: "Booking Not found" });
      }
      return res.status(200).send({ message: "Booking Cancelled" });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  rejectPayment: async (req, res) => {
    try {
      const userId = req.userId;
      const bookingId = req.params.id;
      const details = await Booking.updateOne(
        { _id: bookingId },
        { $set: { status: "Payment Rejected" } }
      );
      if (!details) {
        return res.status(404).send({ message: "Booking Not found" });
      }
      return res.status(200).send({ message: "Payment Rejected" });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  cancellConsultation: async (req, res) => {
    try {
      const userId = req.userId;
      const bookingId = req.params.id;
      const details = await Booking.updateOne(
        { _id: bookingId },
        { $set: { status: "consultation Rejected" } }
      );
      if (!details) {
        return res.status(404).send({ message: "Booking Not found" });
      }
      return res.status(200).send({ message: "consultation Rejected" });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  cancellProject: async (req, res) => {
    try {
      const userId = req.userId;
      const bookingId = req.params.id;
      const details = await Booking.updateOne(
        { _id: bookingId },
        { $set: { status: "Project Rejected" } }
      );
      if (!details) {
        return res.status(404).send({ message: "Booking Not found" });
      }
      return res.status(200).send({ message: "Project Rejected" });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  },

  getDesignerData: async (req, res) => {
    try {
      const id = req.params.id;
      const designer = await Designer.findOne({ _id: id });
      const designs = await Design.find({ designer: id });
      const count = await Design.find({ designer: id }).count();
      if (!designer && !designs) {
        return res.status(404).send({ message: "Designer not found" });
      }
      const data = {
        designer,
        designs,
        count,
      };
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  getDesignerDesign: async (req, res) => {
    try {
      const { catId, designerId } = req.query;
      console.log(catId, designerId);

      const data = await Design.find({ category: catId, designer: designerId });

      if (!data) {
        return res.status(404).send({ message: "No Matched Designs" });
      }
      return res.status(200).send(data);
    } catch (error) {
      console.log(error);
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { email, subject, message } = req.body;

      const transporter = nodemailer.createTransport({
        // Configure email service
        service: "gmail",
        auth: {
          user: process.env.EMAIL_SENDER,
          pass: process.env.PASS,
        },
      });

      const mailOptions = {
        from: email,
        to: process.env.EMAIL_SENDER,
        subject,
        text: message,
      };
      console.log(mailOptions, "mail ayakknd ta");

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({ message: "Error sending feedback" });
        } else {
          console.log("Feedback sent: " + info.response);
          res.status(200).json({ message: "Feedback sent successfully" });
        }
      });
    } catch (error) {
      console.log(error);
      return res.send({ message: "Something went wrong" });
    }
  },

  logout: async (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    res.send({ message: "logout success" });
  },
};
