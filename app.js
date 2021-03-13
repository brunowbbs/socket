const express = require('express');
const path = require('path');
const http = require('http');
const PORT = 3333;

const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('Conexão detectada...');

  socket.on('join-request', username => {
    socket.username = username;
    onlineUsers.push(username);
    console.log(onlineUsers);

    socket.emit('user-ok', onlineUsers);

    socket.broadcast.emit('list-update', {
      joined: username,
      list: onlineUsers
    });
  });

  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(item => item !== socket.username);

    socket.broadcast.emit('list-update', {
      left: socket.username,
      list: onlineUsers
    });
  })

  socket.on('send-msg', (txt) => {
    let obj = {
      username: socket.username,
      message: txt
    }

    // socket.emit('show-msg', obj);
    socket.broadcast.emit('show-msg', obj);
  })

});

server.listen(PORT, () => {
  console.log(`Servidor iniciado com sucesso em http://localhost:${PORT}`)
});

