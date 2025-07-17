const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); // This serves your index.html and files

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Sends message to everyone
  });
});

http.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
