// const jwt = require("jsonwebtoken");

// module.exports = {
//   designerautherization: async (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
// console.log("designer");
//     const decodedToken = jwt.verify(token, "designer");
//     console.log(decodedToken);
//     if (decodedToken) {
//       req.designerId = decodedToken._id;
//     }
//   },
// };
