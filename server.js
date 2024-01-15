const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const users = {};

io.on("connection", (socket) => {
  console.log("New user connected");
  socket.on("join", (username) => {
    users[socket.id] = {
      username,
      socketId: socket.id,
      time: new Date().toLocaleString(),
    };
    io.emit("user joined", users[socket.id]);
    io.emit("update users", Object.values(users));
  });

  socket.on("chat message", (message) => {
    const user = users[socket.id];
    io.emit("chat message", {
      user,
      message,
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");

    io.emit("user left", users[socket.id]);

    delete users[socket.id];

    io.emit("update users", Object.values(users));
  });
});

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
