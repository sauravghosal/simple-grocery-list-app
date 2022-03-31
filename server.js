const express = require("express");
const items = require("./items.js");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`server listening on port: ${port}`)
);
const io = require("socket.io")(server);

app.use(express.static("public"));
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/api/typeahead", (req, res) => {
  console.log(req.query.food);
  axios
    .get("https://api.edamam.com/auto-complete", {
      app_id: "0433116b",
      app_key: "dee12692a84c03db7a909ae1ce55156b",
      q: req.query.food,
    })
    .then((response) => {
      console.log(response.data);
      return res.send(response.data);
    })
    .catch((err) => console.error(err));
});

io.on("connection", (socket) => {
  io.to(socket.id).emit("loadItems", items);
  socket.on("addItem", (evt) => {
    items.push({ name: evt, checked: false });
    io.emit("loadItems", items);
  });
  socket.on("removeItem", (evt) => {
    items.splice(evt, 1);
    io.emit("loadItems", items);
  });
  socket.on("updateItem", (evt) => {
    items[evt.index] = { ...items[evt.index], checked: evt.checked };
    socket.broadcast.emit("loadItems", items);
  });
});

io.on("disconnect", (evt) => {
  console.log("some people left");
});
