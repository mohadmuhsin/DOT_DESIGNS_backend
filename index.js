const express = require("express");
const mongoose = require("mongoose");
// const routes = require('./routes/user')
const cors = require("cors");
const cookieParser = require("cookie-parser");
const designerRoute = require("./routes/designer_routes");
const admin = require("./routes/admin_routes");

// const router = require("./routes/user");
const app = express();
app.use(cookieParser());
app.use(express.json());

mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("App is listning on port 3000");
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);

// <<<<<<<<<<<<<<<<<<<<<<<<routes>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const userRoute = require("./routes/user_routes");
app.use("/", userRoute);

app.use("/designer", designerRoute);

app.use("/admin", admin);

module.exports = app;
