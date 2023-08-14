const express = require("express");
const mongoose = require("mongoose");
const http = require('http');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const designerRoute = require("./routes/designer_routes");
const admin = require("./routes/admin_routes");
const userRoute = require("./routes/user_routes");
const chatRoute = require ('./routes/chat_routes')
const socketIO = require('socket.io');
const Message = require("./models/messages");
const jwt = require("jsonwebtoken");
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
app.use('/chat', chatRoute)


// <----------------socket.io-------------------->
// const io = socketIO(server, {
//   cors:'*'
// });

// const connectedUsers = new Map();

// io.on('connection', (socket) => {
//   console.log('A user connected',socket.id);

//   socket.on('set_user', (userId) => {
//   console.log('Setting user with ID:', userId);
//   connectedUsers.set(userId, socket);
//   // console.log('Connected users Map:', connectedUsers);
// });

//   socket.on('message', (data) => {
//     console.log('Received message from client:', data);
//     const { receiverId, message } = data;
    
//      const receiverSocket = connectedUsers.get(receiverId);
// console.log(receiverSocket,"vallathiim mnd=");
//     if (receiverSocket) {
       
//       receiverSocket.emit('new_message', { senderId: socket.id, message });
//     } else {
//       // Handle the case when the receiver is not online
//       console.log(`Receiver ${receiverId} is not online.`);
//     }

//     // io.to(reciever.socketId).emit("message", data);
//   });

//  socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//     connectedUsers.forEach((value, key) => {
//       if (value === socket) {
//         connectedUsers.delete(key);
//       }
//     });
//   });
// });





module.exports = { app };