import express from "express";
import path from "path";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";
import { getDirname } from "./utils.js";
const options = {
  key: fs.readFileSync(`./localhost-key.pem`),
  cert: fs.readFileSync(`./localhost.pem`),
};
const app = express();
const port = 8080;
const __dirname = getDirname(import.meta.url);
const namespace = "/recording";

app.set("view engine", "ejs");
app.use("/js", express.static(path.join(__dirname, "public", "js")));
app.use("/img", express.static(path.join(__dirname, "public", "img")));
app.use("/css", express.static(path.join(__dirname, "public", "css")));

app.get("/", (req, res) => {
  res.render("index", { title: "首頁" });
});
app.get("/recording", (req, res) => {
  // res.send("Recording");
  res.render("recording", { title: "復健紀錄" });
});
app.get("/record/:id", (req, res) => {
  res.send(`Record ID: ${req.params.id}`);
});
app.get("/user/:id", (req, res) => {
  res.send(`User ID: ${req.params.id}`);
});
const httpsServer = https.createServer(options, app);

const io = new Server(httpsServer);
io.of(namespace).on("connection", (socket) => {
  console.log(socket.id, "connected");

  socket.on("video-start", (Msg) => {
    console.log(socket.id, Msg);
    socket.broadcast.emit("desktop-start", Msg);
  });
  socket.on("video-stop", (Msg) => {
    console.log(socket.id, Msg);
    socket.broadcast.emit("desktop-stop", Msg);
  });
  socket.on("sensor-start", (Msg) => {
    console.log(socket.id, Msg);
    socket.broadcast.emit("mobile-start", Msg);
  });
  socket.on("sensor-stop", (Msg) => {
    console.log(socket.id, Msg);
    socket.broadcast.emit("mobile-stop", Msg);
  });
  socket.on("disconnect", () => console.log(socket.id, "disconnected"));
});

httpsServer.listen(port, function () {
  console.log(`Server is running at localhost: ${port}`);
});
// app.listen(port, function () {
//   console.log(`Server is running at localhost: ${port}`);
// });
