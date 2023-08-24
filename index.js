const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const designerRoute = require("./routes/designer_routes");
const admin = require("./routes/admin_routes");
const userRoute = require("./routes/user_routes");
const chatRoute = require ('./routes/chat_routes')
const intializeSocket = require('./socket/socket')
const app = express();

const server =  app.listen(3000, () => {
  console.log("App is listning on port 3000");
});

intializeSocket(server)
// <------------------mongoose connection------------------->
mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// <------------------cors-------------------->
app.use(cors({
    credentials: true,
    origin: ["https://dotdesigns.netlify.app"],
  })
);

// <------------------cookie parser-------------------->
app.use(cookieParser());
app.use(express.json());


// <------------------routes-------------------->
app.use("/", userRoute);
app.use("/designer", designerRoute);
app.use("/admin", admin);
app.use('/chat', chatRoute)


module.exports = { app };