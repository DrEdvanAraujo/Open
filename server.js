const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};

io.on('connection', (socket) => {
  console.log(`🔌 Jogador conectado: ${socket.id}`);

  socket.on('join', (player) => {
    players[socket.id] = {
      ...player,
      id: socket.id,
      human: true
    };
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
    console.log(`❌ Jogador desconectado: ${socket.id}`);
    delete players[socket.id];
    io.emit('players', players);
  });
});

// Se estiver usando "index.html" na raiz do projeto:
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
