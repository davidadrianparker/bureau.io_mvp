const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');

app.use(express.static(__dirname)); // This serves your index.html and files
app.use(express.json()); // For parsing JSON bodies

// Simple password hashing function
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

// User database file
const userDBPath = path.join(__dirname, 'users.json');

// Initialize user database
function initUserDB() {
    if (!fs.existsSync(userDBPath)) {
        fs.writeFileSync(userDBPath, JSON.stringify({}));
    }
}

// Load users from database
function loadUsers() {
    try {
        const data = fs.readFileSync(userDBPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Save users to database
function saveUsers(users) {
    fs.writeFileSync(userDBPath, JSON.stringify(users, null, 2));
}

// Server database functions
function initServerDB() {
    if (!fs.existsSync('servers.json')) {
        fs.writeFileSync('servers.json', JSON.stringify({}, null, 2));
        console.log('Created servers.json');
    }
}

function loadServers() {
    try {
        const data = fs.readFileSync('servers.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading servers:', error);
        return {};
    }
}

function saveServers(servers) {
    try {
        fs.writeFileSync('servers.json', JSON.stringify(servers, null, 2));
    } catch (error) {
        console.error('Error saving servers:', error);
    }
}

// Initialize databases
initUserDB();
initServerDB();

// API Routes for user management
app.post('/api/register', (req, res) => {
    const { username, password, email } = req.body;
    const users = loadUsers();
    
    if (users[username]) {
        return res.json({ success: false, message: 'Username already exists' });
    }
    
    users[username] = {
        username,
        password: hashPassword(password),
        email: email || '',
        createdAt: new Date().toISOString(),
        profile: {
            status: 'Hey there! I\'m using bureau.io',
            avatar: '',
            bio: '',
            location: ''
        }
    };
    
    saveUsers(users);
    res.json({ success: true, message: 'User registered successfully' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body; // 'username' can be username OR email
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json')));
  let user = null;

  // Try to find by username
  if (users[username]) {
    user = users[username];
  } else {
    // Try to find by email
    user = Object.values(users).find(u => u.email === username);
  }

  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }

  if (user.password !== hashPassword(password)) {
    return res.json({ success: false, message: 'Incorrect password' });
  }

  // Success!
  res.json({ success: true, user });
});

app.get('/api/user/:username', (req, res) => {
    const { username } = req.params;
    const users = loadUsers();
    
    if (!users[username]) {
        return res.json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
        success: true, 
        user: {
            username: users[username].username,
            email: users[username].email,
            profile: users[username].profile,
            createdAt: users[username].createdAt
        }
    });
});

app.post('/api/user/:username/profile', (req, res) => {
    const { username } = req.params;
    const { status, bio, location } = req.body;
    const users = loadUsers();
    
    if (!users[username]) {
        return res.json({ success: false, message: 'User not found' });
    }
    
    users[username].profile = {
        ...users[username].profile,
        status: status || users[username].profile.status,
        bio: bio || users[username].profile.bio,
        location: location || users[username].profile.location
    };
    
    saveUsers(users);
    res.json({ success: true, message: 'Profile updated successfully' });
});

// Update user profile with picture support
app.post('/api/update-profile', (req, res) => {
    const { username, newUsername, bio, location, picture } = req.body;
    const users = loadUsers();
    
    if (!users[username]) {
        return res.json({ success: false, message: 'User not found' });
    }
    
    // Check if new username is already taken (if changing username)
    if (newUsername !== username && users[newUsername]) {
        return res.json({ success: false, message: 'Username already taken' });
    }
    
    // If username is changing, update the user object key
    if (newUsername !== username) {
        users[newUsername] = {
            ...users[username],
            username: newUsername
        };
        delete users[username];
    } else {
        users[username].username = newUsername;
    }
    
    // Update profile data
    const userKey = newUsername !== username ? newUsername : username;
    users[userKey].profile = {
        ...users[userKey].profile,
        bio: bio || '',
        location: location || '',
        picture: picture || ''
    };
    
    saveUsers(users);
    res.json({ success: true, user: users[userKey] });
});

// Password reset request
app.post('/api/request-password-reset', (req, res) => {
    const { username } = req.body;
    const users = loadUsers();
    
    if (!users[username]) {
        return res.json({ success: false, message: 'User not found' });
    }
    
    // In a real app, you'd send an email here
    // For now, we'll just return success
    res.json({ success: true, message: 'Password reset request received' });
});

// Password reset
app.post('/api/reset-password', (req, res) => {
    const { username, newPassword } = req.body;
    const users = loadUsers();
    
    if (!users[username]) {
        return res.json({ success: false, message: 'User not found' });
    }
    
    if (!newPassword || newPassword.length < 6) {
        return res.json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    // Update password
    users[username].password = hashPassword(newPassword);
    saveUsers(users);
    
    res.json({ success: true, message: 'Password reset successfully' });
});

// Create a new server
app.post('/api/servers', (req, res) => {
    const { name, description, owner } = req.body;

    if (!name || !owner) {
        return res.json({ success: false, message: 'Server name and owner are required' });
    }

    const servers = loadServers();
    const users = loadUsers();

    // Check if owner exists
    if (!users[owner]) {
        return res.json({ success: false, message: 'Owner not found' });
    }

    // Generate unique server ID
    const serverId = 'server_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Create server
    servers[serverId] = {
        id: serverId,
        name: name,
        description: description || '',
        owner: owner,
        createdAt: new Date().toISOString(),
        isPublic: false,
        inviteCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
        members: [owner],
        channels: {
            general: { name: 'general', type: 'text' },
            random: { name: 'random', type: 'text' }
        },
        settings: {
            allowInvites: true,
            defaultRole: 'member'
        }
    };

    // Add server to user's server list
    users[owner].servers = users[owner].servers || [];
    users[owner].servers.push(serverId);

    saveServers(servers);
    saveUsers(users);

    res.json({
        success: true,
        server: servers[serverId]
    });
});

// Get user's servers
app.get('/api/servers/user/:username', (req, res) => {
    const { username } = req.params;
    const users = loadUsers();
    const servers = loadServers();
    
    if (!users[username]) {
        return res.json({ success: false, message: 'User not found' });
    }
    
    const userServers = users[username].servers || [];
    const serverList = userServers.map(serverId => servers[serverId]).filter(Boolean);
    
    res.json({
        success: true,
        servers: serverList
    });
});

// Get server details
app.get('/api/servers/:serverId', (req, res) => {
    const { serverId } = req.params;
    const servers = loadServers();
    
    if (!servers[serverId]) {
        return res.json({ success: false, message: 'Server not found' });
    }
    
    res.json({
        success: true,
        server: servers[serverId]
    });
});

// Store messages for each room
let roomMessages = loadMessages();

// Store users in each room
const roomUsers = {
  general: new Set(),
  random: new Set(),
  help: new Set(),
  gaming: new Set()
};

// Store socket to username mapping
const socketToUser = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining rooms
  socket.on('join room', (data) => {
    const { serverId, roomName, username } = data;
    const fullRoom = serverId + ':' + roomName;
    
    // Leave previous room if any
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    
    // Join the new room
    socket.join(fullRoom);
    socketToUser.set(socket.id, username);
    
    // Add user to room users
    if (!roomUsers[fullRoom]) {
      roomUsers[fullRoom] = new Set();
    }
    roomUsers[fullRoom].add(username);
    
    // Notify others in the room
    socket.to(fullRoom).emit('user joined', { username });
    
    // Send current users in room
    const usersInRoom = Array.from(roomUsers[fullRoom]);
    io.to(fullRoom).emit('user list update', { users: usersInRoom });
    
    // Send message history to the joining user
    console.log(`Checking for messages in room ${fullRoom}:`, roomMessages[fullRoom]);
    if (roomMessages[fullRoom] && roomMessages[fullRoom].length > 0) {
      console.log(`Sending ${roomMessages[fullRoom].length} messages to ${username}`);
      socket.emit('message history', {
        room: roomName,
        messages: roomMessages[fullRoom]
      });
    } else {
      console.log(`No messages found in room ${fullRoom}`);
    }
    
    console.log(`${username} joined room ${fullRoom}`);
  });

  // Handle typing indicators
  socket.on('typing start', (data) => {
    const { room, username, serverId } = data;
    const fullRoom = serverId + ':' + room;
    socket.to(fullRoom).emit('typing start', { username });
  });

  socket.on('typing stop', (data) => {
    const { room, username, serverId } = data;
    const fullRoom = serverId + ':' + room;
    socket.to(fullRoom).emit('typing stop', { username });
  });

  socket.on('chat message', (data) => {
    console.log('Received chat message:', data);
    const { message, timestamp, room, serverId, username } = data;
    const fullRoom = serverId + ':' + room;
    const messageId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const msgData = { id: messageId, message, timestamp, username };

    // Store message in room history
    if (!roomMessages[fullRoom]) {
      roomMessages[fullRoom] = [];
    }
    roomMessages[fullRoom].push(msgData);
    // Keep only last 100 messages per room
    if (roomMessages[fullRoom].length > 100) {
      roomMessages[fullRoom] = roomMessages[fullRoom].slice(-100);
    }
    
    console.log(`Storing message in room ${fullRoom}:`, msgData);
    console.log(`Total messages in room: ${roomMessages[fullRoom].length}`);
    
    saveMessages(roomMessages); // Persist messages

    // Broadcast to everyone in the same room
    io.to(fullRoom).emit('chat message', { ...msgData, room });
  });

  socket.on('delete message', (data) => {
    const { serverId, room, messageId } = data;
    const fullRoom = serverId + ':' + room;
    if (roomMessages[fullRoom]) {
        // Remove the message with the given ID
        roomMessages[fullRoom] = roomMessages[fullRoom].filter(msg => msg.id !== messageId);
        saveMessages(roomMessages); // Persist messages after deletion
        // Broadcast deletion to all clients in the room
        io.to(fullRoom).emit('delete message', { messageId });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    
    // Remove user from room users
    const username = socketToUser.get(socket.id);
    if (username) {
      socket.rooms.forEach(room => {
        if (room !== socket.id && roomUsers[room]) {
          roomUsers[room].delete(username);
          socket.to(room).emit('user left', { username });
          
          // Update user list
          const usersInRoom = Array.from(roomUsers[room]);
          io.to(room).emit('user list update', { users: usersInRoom });
        }
      });
      socketToUser.delete(socket.id);
    }
  });
});

app.get('/api/test', (req, res) => {
    res.send('Test route works!');
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/api/my-servers', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  // Load users and servers
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json')));
  const servers = JSON.parse(fs.readFileSync(path.join(__dirname, 'servers.json')));

  // Find the user
  const user = users[username];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get the servers this user belongs to
  const userServers = user.servers.map(serverId => servers[serverId]).filter(Boolean);
  res.json(userServers);
});

app.post('/api/servers/:serverId/channels', (req, res) => {
    console.log('POST /api/servers/:serverId/channels', req.body, req.params);
    const { serverId } = req.params;
    const { roomName } = req.body;
    const servers = loadServers();

    if (!servers[serverId]) {
        return res.status(404).json({ success: false, message: 'Server not found' });
    }
    if (!roomName || servers[serverId].channels[roomName]) {
        return res.status(400).json({ success: false, message: 'Invalid or duplicate room name' });
    }

    servers[serverId].channels[roomName] = { name: roomName, type: 'text' };
    saveServers(servers);
    res.json({ success: true });
});

const messagesDBPath = path.join(__dirname, 'messages.json');

function loadMessages() {
    try {
        const data = fs.readFileSync(messagesDBPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

function saveMessages(messages) {
    try {
        fs.writeFileSync(messagesDBPath, JSON.stringify(messages, null, 2));
        console.log('Messages saved successfully');
    } catch (error) {
        console.error('Error saving messages:', error);
    }
}


