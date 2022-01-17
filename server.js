const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const Chat = require('./models/chatModel');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

const options = {
  cors: true
};

const http = require('http').Server(app);
const io = require('socket.io')(http, options);

io.on('connection', socket => {
  // console.log('Connected: ' + socket);

  socket.on('disconnect', () => {
    // console.log('Disconnected: ' + socket.userId);
  });

  socket.on('joinRoom', ({ chatroomId }) => {
    socket.join(chatroomId);
    // console.log('A user joined chatroom: ' + chatroomId);
  });

  socket.on('leaveRoom', ({ chatroomId }) => {
    socket.leave(chatroomId);
    // console.log('A user left chatroom: ' + chatroomId);
  });

  socket.on(
    'chatroomMessage',
    async ({ chatroomId, user1, user2, message }) => {
      if (message.trim().length > 0) {
        const chat = await Chat.create({
          user1,
          user2,
          message
        });
        io.to(chatroomId).emit('newMessage', {
          chat
        });
      }
    }
  );
});

const server = http.listen(process.env.PORT || 5000, () =>
  console.log(`Listening on port: ${process.env.PORT || 5000}`)
);

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });
