const jwt = require("jsonwebtoken");

module.exports = {
  authorization: (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; 
    const url = req.originalUrl;
    const isDesignerUrl = url.includes("/designer");
    const isAdminUrl = url.startsWith("/admin");
    const isOtherUrl = !isDesignerUrl && !isAdminUrl;
    if (token) {
      try {
        // if (isDesignerUrl) {
        //   const decodedToken = jwt.verify(token, "designer"); 
        //   console.log(decodedToken);
        //   if (decodedToken) {
        //     req.designerId = decodedToken._id; 
            
        //   }
        // } else if (isAdminUrl) {
        //   const decodedToken = jwt.verify(token, "admin");
        //   if (decodedToken) {
        //     req.adminId = decodedToken._id; 
        //   }
        // } else
         if (isOtherUrl) {
          const decodedToken = jwt.verify(token, "secret");
          if (decodedToken) {
            req.userId = decodedToken._id;
          

          }
        } else {
          console.log("Invalid token");
        }
      } catch (error) {
        console.log("Error verifying token:", error.message);
      }
    } else {
      console.log("Authorization header not found");
    }

    next(); 
  },
};
