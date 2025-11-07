const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve index.html
app.use(express.static(path.join(__dirname, 'public')));

let users = {};

io.on('connection', socket => {
  console.log('New user connected:', socket.id);

  // New user joins and sends username
  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });

  // Receiving chat messages from users
  socket.on('send-chat-message', message => {
    io.emit('chat-message', { message: message, name: users[socket.id] });
  });

  // User disconnects
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
