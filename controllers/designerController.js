const Designer = require("../models/designer");
const sendEmial = require("../utils/sendEmial");
const Token = require("../models/token");
const Design = require("../models/design");
const Category = require("../models/category");
const Booking = require("../models/bookings");
const User = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { emit } = require("process");
const { log } = require("console");
const design = require("../models/design");
const { url } = require("inspector");
const stripe = require("stripe")(
  "sk_test_51NUoowSITa8nEg8xf5Cei42bnVwvBSFziVLtO9n1lhwq8vEQxz7EX4wZfLwmvkOVOIF1fO3DCjdN0RVZkgbb6AfY00oD0vHvcI"
);

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dgusa5uo6",
  api_key: "648336148627449",
  api_secret: "Hd3muvgt9ibvWpGEGVUq71b8U4E",
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
      const designer = await Designer.findOne({ _id: id });
      console.log("aaalnd ", designer);
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
      const { method, Data } = req.body;
      const blocked = await Designer.findOne({ email: Data.email });
      console.log(blocked, "blao");
      if (!blocked.active) {
        return res.status(500).send({ message: "You are blocked" });
      }

      if (method === "google") {
        const { email } = Data;
        const designer = await Designer.findOne({ email: email });
        if (!designer) {
          return res.status(404).send({ message: "Designer not found" });
        }

        const token = jwt.sign({ _id: designer._id }, "designer");
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        const { password, ...data } = await designer.toJSON();
        if (!designer.verified) {
          console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
          tok = await Token.findOne({ userId: designer._id });

          if (!tok) {
            tok = await new Token({
              userId: designer._id,
              token: crypto.randomBytes(32).toString("hex"),
            }).save();
          }
            const url = `${process.env.BASE_URL}designer/${designer._id}/verify/${tok.token}`;
            await sendEmial(email, "verify email", url);
            console.log("sendddddddddddddddddddda");
            return res.status(400).send({
              token,
              data,
              message: "An Email sent to your account,Please verify it",
            });
          
        }
        return res.status(200).json({ token, data });
      } else if (method === "normal") {
        const { email } = Data;
        const Password = req.body.Data.password;

        const designer = await Designer.findOne({ email: email });
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
        const { password, ...data } = await designer.toJSON();

        if (!designer.verified) {
          tok = await Token.findOne({ userId: designer._id });

          if (!tok) {
            tok = await new Token({
              userId: designer._id,
              token: crypto.randomBytes(32).toString("hex"),
            }).save();
          }
            const url = `${process.env.BASE_URL}designer/${designer._id}/verify/${tok.token}`;
            await sendEmial(email, "verify email", url);
            return res.status(400).send({
              token,
              data,
              message: "An Email sent,Please verify it",
            });
          
        }
        return res.status(200).json({ token, data });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  verifyDesignerEmailforForget: async (req, res) => {
    try {
      const { email } = req.params;
      const verify = await Designer.findOne({ email: email });
      if (!verify) {
        return res
          .status(404)
          .send({ message: "Please enter a registred email" });
      }
      return res.status(200).send(verify);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  changeDesignerPassword: async (req, res) => {
    try {
      const { password, email } = req.body;
      const hashed = await bcrypt.hash(password, 10);
      const update = await Designer.updateOne(
        { email: email },
        { password: hashed }
      );
      return res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  isLogin: async (req, res) => {
    try {
      const { token } = req.params;
      const claims = jwt.verify(token, "designer");
      const designer = await Designer.findOne({ _id: claims._id });
      if (designer) {
        return res.send(designer);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  designer: async (req, res) => {
    try {
      const { designerId } = req.params;
      const designer = await Designer.findOne({ _id: designerId });
      const { password, ...data } = await designer.toJSON();
      res.status(200).send({ data });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getProfileData: async (req, res) => {
    try {
      const { token } = req.query;
      const claims = jwt.verify(token, "designer");
      console.log(claims);
      const designer = await Designer.findOne({ _id: claims._id });
      if (!designer) {
        return res.status(404).send({ message: "Designer not found" });
      }
      return res.status(200).send(designer);
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { token } = req.body;
      const claims = jwt.verify(token, "designer");
      console.log(req.body);
      const {
        entity_name,
        address,
        district,
        state,
        mobileNumber,
        website,
        bio,
        image,
      } = req.body.data;
      const update = await Designer.updateOne(
        { _id: claims._id },
        {
          $set: {
            entity_name: entity_name,
            mobileNumber: mobileNumber,
            profile: {
              address: address,
              district: district,
              website: website,
              bio: bio,
              profilePhoto: image,
              status: true,
              state: state,
            },
          },
        }
      );
      if (!update) {
        return res.status(300).send({ message: "Updation Failed" });
      }
      return res.status(200).send({ message: "Updation Successfull" });
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
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
      const { token } = req.body;
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
      const exist = await Design.findOne({
        name: designName,
        designer: claims._id,
      });
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
      const { token, designId } = req.body;
      const claims = jwt.verify(token, "designer");

      if (!claims) {
        return res.status(401).send({
          message: "unauthenticated",
        });
      }
      const designer = await Designer.findOne({ _id: claims._id });

      const { designName, materialType, finishType, images, description } =
        req.body.data;

      const update = await Design.updateOne(
        { _id: designId },
        {
          $set: {
            name: designName,
            materialType: materialType,
            finishType: finishType,
            images: images,
            description: description,
          },
        }
      );
      if (!update) {
        return res.status(401).send({ message: "Updation Failed" });
      }
      return res.status(200).send({ message: "Updation Successful" });
    } catch (error) {
      return res.status(500).send({ message: "Sever Error" });
    }
  },

  deleteDesignImage: async (req, res) => {
    try {
      console.log("kldfjdkl");
      const { link, designId } = req.query;
      console.log(req.query);
      const result = await cloudinary.uploader.destroy(link);

      const dele = await Design.updateOne(
        { _id: designId },
        { $pull: { images: link } }
      );

      if (!result && dele) {
        return res.status(404).send({ message: "Deletion Error" });
      }
      return res.status(200).send({ message: "Image Deleted succfully" });
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  deleteDesign: async (req, res) => {
    try {
      const { id } = req.params;
      dele = await Design.deleteOne({ _id: id });
      if (!dele) {
        return res.status(404).send({ message: "Not Found" });
      }
      return res.status(200).send({ message: "Deleted Successfully" });
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  doPayment: async (req, res) => {
    try {
      console.log(req.body);
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

      console.log(paymentIntent);
      console.log("paid");
      const paid = await Designer.updateOne(
        { _id: id },
        { $set: { IsPremium: true, PremiumStartDate: Date.now() } }
      );
      console.log("error");
      console.log(paid, "saved dataaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      if (paid) {
        return res
          .status(200)
          .send({ res: "success", status: paymentIntent.status, paid });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },
  retrive_Designs: async (req, res) => {
    try {
      id = req.params.id;
      const token = req.params.token;
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
      const design = await Design.findOne({ _id: id }).populate("category");
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
        name: category,
        image: image,
        requester: desiger._id,
        verified: false,
      }).save();
      if (!NewCategory) {
        return res.status(409).send({ message: "Internal server error" });
      }
      return res.status(200).send({ message: "Request send for approval" });
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },

  getConsultationCount: async (req, res) => {
    try {
      const { token } = req.query;
      const claims = jwt.verify(token, "designer");
      const count = await Booking.findOne({
        designerId: claims._id,
        status: "Pending",
      }).count();
      console.log(count);
      if (count) {
        return res.send({ count });
      }
    } catch (error) {
      return res.status(500).send({ message: "something Went Wrong" });
    }
  },

  getRequests: async (req, res) => {
    try {
      const { token } = req.params;
      const claims = jwt.verify(token, "designer");
      const designs = await Booking.find({ designerId: claims._id })
        .populate("userId")
        .populate("designId")
        .sort({ date: -1 });
      if (!designs) {
        return res
          .status(404)
          .send({ message: "There is no pending requests" });
      }
      return res.status(200).send(designs);
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },
  getConsultationDeatails: async (req, res) => {
    try {
      const { bookingId, designerId } = req.query;
      console.log(req.query, "from params");
      const bookings = await Booking.findOne({ _id: bookingId })
        .populate("designId")
        .populate("userId");
      if (!bookings) {
        return res.status(404).send({ message: "Bookings not found" });
      }
      return res.status(200).send(bookings);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },

  acceptRequest: async (req, res) => {
    try {
      const id = req.body.id;
      console.log(req.body.id, "booking id");
      const requests = await Booking.updateOne(
        { _id: id },
        { $set: { status: "Waiting for Payment" } }
      );
      if (!requests) {
        return res.send({ message: "confirmation failed" });
      }
      console.log(requests, "dklkd");
      return res.status(200).send({ message: "confirmation successfull" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },

  rejectRequest: async (req, res) => {
    try {
      const id = req.body.id;
      console.log(req.body.id, "booking id");
      const requests = await Booking.updateOne(
        { _id: id },
        { $set: { status: "Consultation Rejected" } }
      );
      if (!requests) {
        return res.send({ message: "Rejection failed" });
      }
      console.log(requests, "dklkd");
      return res.status(200).send({ message: "Rejection successfull" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },
  CancelConsultation: async (req, res) => {
    try {
      const id = req.body.id;
      console.log(req.body.id, "booking id");
      const requests = await Booking.updateOne(
        { _id: id },
        { $set: { status: "Consultation Cancelled" } }
      );
      if (!requests) {
        return res.send({ message: "Rejection failed" });
      }
      return res.status(200).send({ message: "Rejection successfull" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  }

,

  consultationDone: async (req, res) => {
    try {
      const id = req.body.id;
      console.log(req.body.id, "booking id");
      const requests = await Booking.updateOne(
        { _id: id },
        { $set: { status: "Consultation Done" } }
      );
      if (!requests) {
        return res.send({ message: "Rejection failed" });
      }
      console.log(requests, "dklkd");
      return res.status(200).send({ message: "Rejection successfull" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },

  StartProject: async (req, res) => {
    try {
      const id = req.body.id;
      console.log(req.body.id, "booking id");
      const requests = await Booking.updateOne(
        { _id: id },
        { $set: { status: "Work in Progress" } }
      );
      if (!requests) {
        return res.send({ message: "failed to find matched projects" });
      }
      console.log(requests, "dklkd");
      return res.status(200).send({ message: "Project started successfull" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },


  RejectProject: async (req, res) => {
    try {
      const id = req.body.id;
      console.log(req.body.id, "booking id");
      const requests = await Booking.updateOne(
        { _id: id },
        { $set: { status: "Project Rejected" } }
      );
      if (!requests) {
        return res.send({ message: "failed to find matched projects" });
      }
      console.log(requests, "dklkd");
      return res.status(200).send({ message: "Project started successfull" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },

  projectCompleted: async (req, res) => {
    try {
      const id = req.body.id;
      const requests = await Booking.updateOne(
        { _id: id },
        { $set: { status: "Completed" } }
      );
      if (!requests) {
        return res.send({ message: "submission failed" });
      }
      return res.status(200).send({ message: "Completed successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },

  getCategorywiseQoute: async (req, res) => {
    try {
      const { id } = req.params;

      const categoryWiseCount = await Booking.aggregate([
        {
          $match: {
            designerId: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "designs",
            localField: "designId",
            foreignField: "_id",
            as: "design",
          },
        },
        {
          $unwind: "$design",
        },
        {
          $lookup: {
            from: "categories",
            localField: "design.category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $group: {
            _id: {
              designerId: "$design.designer",
              categoryId: "$category._id",
            },
            categoryName: { $first: "$category.name" },
            count: { $sum: 1 },
          },
        },
      ]);
      if (categoryWiseCount) {
        return res.status(200).send(categoryWiseCount);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server Error" });
    }
  },
  getCatogoryWiseDesigns: async (req, res) => {
    try {
      const { id } = req.params;
      const designCount = await Design.aggregate([
        {
          $match: {
            designer: new ObjectId(id),
          },
        },
        {
          $group: {
            _id: "$category",
            designCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $project: {
            categoryName: "$category.name",
            designCount: 1,
          },
        },
      ]);
      if (designCount) {
        res.status(200).send(designCount);
      }
    } catch (error) {
      return res.status(500).send({ message: "Server Error" });
    }
  },
  logout: async (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    res.send({ message: "logout success" });
  },
};
