const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); // This serves your index.html and files

// Store messages for each room
const roomMessages = {
  general: [],
  random: [],
  help: [],
  gaming: []
};

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle joining a room
  socket.on('join room', (roomName) => {
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
    
    // Send recent messages from this room
    if (roomMessages[roomName]) {
      roomMessages[roomName].slice(-20).forEach(msg => {
        socket.emit('chat message', { message: msg, room: roomName });
      });
    }
  });
  
  // Handle leaving a room
  socket.on('leave room', (roomName) => {
    socket.leave(roomName);
    console.log(`User left room: ${roomName}`);
  });
  
  // Handle chat messages
  socket.on('chat message', (data) => {
    const { message, room } = data;
    
    // Store message in room history
    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }
    roomMessages[room].push(message);
    
    // Keep only last 100 messages per room
    if (roomMessages[room].length > 100) {
      roomMessages[room] = roomMessages[room].slice(-100);
    }
    
    // Broadcast to everyone in the same room
    io.to(room).emit('chat message', { message, room });
  });
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

http.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
