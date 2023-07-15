// const router = require("express").Router();
// const User = require("../models/user");
// const bcrypt = require("bcryptjs");
// const token = require("../models/token");
// const sendEmail = require("../utils/sendEmial");
// const crypto = require("crypto");
// const token = require("../models/token");

// router.post("/", async (req, res) => {
//   try {
//     const { error } = validate(req.body);
//     if (error) {
//      return res.status(400).send({ message: error.details[0].message });
//     }
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//      return res.status(401).send({ message: "Invalid Email" });
//     }
//     const validPassword = await bcrypt.compare(
//       req.body.password,
//       user.password
//     );
//     if(!validPassword){
//      return res.status(401).send({message:"Invalid Passwod"})   
//     }

//     if(!user.verified){
//         let tok = await token.findOne({userId:user._id})
//         if(!tok){
//           tok = await new Token({
//             userId: user._id,
//             token: crypto.randomBytes(32).toString("hex"),
//           }).save();
    
//           const url = `${process.env.BASE_URL}/${user._id}/verify/${tok.token}`;
//           await sendEmail(email, "verify Email", url);
//           res
//             .status(201)
//             .send({ message: "An Email send to your account,Please verify it!" });
        
//         }
//         return res.status(400).send({message:"An email send to your account please verify your account"})
//       }
//   } catch (error) {
//     console.log(error);
//   }
// });
