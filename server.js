// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};

io.on('connection', (socket) => {
  socket.on('join', (player) => {
    players[socket.id] = player;
    io.emit('players', players);
  });

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].pos = data.pos;
      players[socket.id].rotY = data.rotY;
      io.emit('players', players);
    }
  });

  socket.on('chat', (msg) => {
    if (players[socket.id]) {
      io.emit('chat', { name: players[socket.id].name, msg, id: socket.id });
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('players', players);
  });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
