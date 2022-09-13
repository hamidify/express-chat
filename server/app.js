const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { addNewUser, kickoutUser, getUser, listUsers, listRooms } = require('./utils/users');

app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

io.on('connect', (socket) => {
  socket.on('joining', ({ username: name, room: roomname }) => {
    const { user } = addNewUser({ id: socket.id, username: name, room: roomname });
    const { room, username } = user;
    socket.join(room);
    io.sockets.emit('rooms', { rooms: listRooms() })
    socket.emit('newMessage', { username: 'Server', message: ` Greetings ${username}, welcome to room ${room}.` });
    io.to(room).emit('newMessage', { username: 'Server', message: `${username} has joined!` });
    io.to(room).emit('usersInRoom', { users: listUsers(room) });
  });


  socket.on('sendMessage', (message) => {
    const user = getUser(socket.id);
    const { username, room } = user;
    io.to(room).emit('newMessage', { username, message });
  });

  socket.on('disconnect', () => {
    const user = kickoutUser(socket.id);
    if (user) {
      const { room, username } = user;
      io.to(room).emit('newMessage', { username: 'Server', message: `${username} has left.` });
      io.to(room).emit('usersInRoom', { users: listUsers(room) });
      io.sockets.emit('rooms', { rooms: listRooms() })
    }
  })
});


server.listen(5000, () => 'Server is running on port 5000');
module.exports = app;