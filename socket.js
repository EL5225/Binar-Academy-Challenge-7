const socketIo = require("socket.io");

const initializeSocketIO = (server) => {
  const io = socketIo(server);

  io.on("connection", (socket) => {
    console.log("connected");
  });

  return io;
};

module.exports = initializeSocketIO;
