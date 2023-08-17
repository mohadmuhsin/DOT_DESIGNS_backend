const socketIO = require('socket.io') 


function intializeSocket(server) {
    const io = socketIO(server, {
        pingTimeout: 60000,
        cors: {
            origin: 'https://dotdesigns.netlify.app'
        },
      });

    // Socket.io connection
    io.on('connection', (socket) => {
        socket.on('setup', (id) => {
            socket.join(id)
            socket.emit('connected')
            console.log('A user connected');
        });

        socket.on('join', (room) => {
            socket.join(room);
        })

        socket.on('chatMessage', (message) => {
            console.log(message,"message");
            socket.in(message.reciever).emit("messageReceived", message);
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

}

module.exports = intializeSocket