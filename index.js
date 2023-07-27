const express = require("express");
const mongoose = require("mongoose");
const http = require('http');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const designerRoute = require("./routes/designer_routes");
const admin = require("./routes/admin_routes");
const userRoute = require("./routes/user_routes");
const socketIO = require('socket.io');
const Message = require("./models/messages");
const jwt = require("jsonwebtoken");



const app = express();

const server =  app.listen(3000, () => {
  console.log("App is listning on port 3000");
});
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
    origin: ["http://localhost:4200"],
  })
);

// <------------------cookie parser-------------------->
app.use(cookieParser());
app.use(express.json());

// <------------------routes-------------------->
app.use("/", userRoute);
app.use("/designer", designerRoute);
app.use("/admin", admin);

// <----------------socket.io-------------------->
const io = socketIO(server, {
  cors:'*'
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('message', (data) => {
    console.log('Received message from client:', data);
    // const { user } = data

    
    const message = new Message({
      user: data.user,
      designer: data.designer,
      text: data.text,
    });

   const result = message.save()
      if (!result) {
        console.error("Error saving message:", err);
      } else {
        console.log("Message saved to database:", message);
    }
    
    io.in(data.user).emit("new_message", message);
    io.in(data.designer).emit("new_message", message);
    // io.emit('new_message', { text: data.text });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});




module.exports = { app, io };