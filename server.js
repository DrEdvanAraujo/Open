const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join', (player) => {
    console.log(`JOIN event from ${socket.id}:`, player);
    players[socket.id] = player;
    io.emit('players', players);
  });

  socket.on('move', (data) => {
    console.log(`MOVE event from ${socket.id}:`, data);
    if (players[socket.id]) {
      players[socket.id].pos = data.pos;
      players[socket.id].rotY = data.rotY;
      io.emit('players', players);
    }
  });

  socket.on('chat', (msg) => {
    console.log(`CHAT event from ${socket.id}:`, msg);
    if (players[socket.id]) {
      io.emit('chat', { name: players[socket.id].name, msg, id: socket.id });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('players', players);
  });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
