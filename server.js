// -- for local dev --
import https from "https";
import fs from "fs";
// ---
// -- for docker build --
// import http from "http";
// ---
import express from "express";
import path from "path";
import passport from "passport";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { getDirname } from "./public/js/utils.js";
import { socketHandler } from "./public/js/socketHandler.js";
import { userRouter } from "./routes/userRoutes.js";
import { s3Router } from "./routes/s3Routes.js";
import { recordRouter } from "./routes/recordRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { connectDB } from "./config/db.js";
import { passportStrategy } from "./config/passport.js";

const app = express();
const port = process.env.PORT;
const __dirname = getDirname(import.meta.url);

dotenv.config();
connectDB();

app.set("view engine", "ejs");
app.use("/js", express.static(path.join(__dirname, "public", "js")));
app.use("/img", express.static(path.join(__dirname, "public", "img")));
app.use("/css", express.static(path.join(__dirname, "public", "css")));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: " 1mb ", extended: true }));

app.use("/api/s3", s3Router);
app.use("/api/user", userRouter);
app.use("/api/record", recordRouter);

passportStrategy(passport);
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.render("index", { title: "首頁" });
});

app.get("/recording", (req, res) => {
  res.render("recording", { title: "開始復健" });
});

app.get("/record/:recordId", (req, res) => {
  res.render("record", { title: "復健紀錄" });
});

app.get("/user", (req, res) => {
  res.render("user", { title: "我的紀錄" });
});

app.use(errorHandler);

// -- for local dev --
const options = {
  key: fs.readFileSync(`./localhost-key.pem`),
  cert: fs.readFileSync(`./localhost.pem`),
};
const httpsServer = https.createServer(options, app);
const io = new Server(httpsServer);
// ---

// -- for docker build --
// const httpServer = http.createServer(app);
// const io = new Server(httpServer);
// ---
const recordingIo = io.of("/recording");
let rooms = {};

recordingIo.on("connection", (socket) => {
  console.log(socket.id, "connected");
  // emitted by either device
  socket.on("user-join", (joinDevice, userId) => {
    console.log(`${userId} 的 ${joinDevice} 已連接`);
    const result = socketHandler.join(joinDevice, userId, rooms);
    if (result.join) {
      socket.join(userId);
      if (userId in rooms) {
        rooms[userId].push({ [socket.id]: [joinDevice] });
      } else {
        rooms[userId] = [{ [socket.id]: [joinDevice] }];
      }
      // to device(s) in room userId
      recordingIo.in(userId).emit("join-result", result);
      console.log(userId, "連線裝置：", rooms[userId]);
    } else {
      // to emitted device
      socket.emit("join-result", result);
    }
  });

  socket.on("device-access", (userId, result) => {
    console.log(`user:${userId} ${result.msg}`);
    if (result.access) {
      socketHandler.access(userId, socket.id, rooms);
      recordingIo.in(userId).emit("access-result", result);
    } else {
      socket.emit("access-result", result);
    }
  });

  socket.on("record", (state, triggerDevice, userId) => {
    console.log(`由 ${userId} 的 ${triggerDevice} ${state} 紀錄`);
    const result = socketHandler.record(state, triggerDevice, userId, rooms);
    recordingIo.in(userId).emit(`${state}-result`, triggerDevice, result);
  });

  socket.on("disconnect", () => {
    console.log(socket.id, "disconnected");
    socketHandler.removeDisconnectedDeviceSocketId(socket.id, rooms);
    console.log(socket.rooms);
  });
  // emitted by mobile
  socket.on("send-record", (record, userId) => {
    // to another device
    socket.to(userId).emit("receive-record", record);
  });

  socket.on("send-acc", (acc, userId) => {
    socket.to(userId).emit("receive-acc", acc);
  });

  socket.on("send-ori", (ori, userId) => {
    socket.to(userId).emit("receive-ori", ori);
  });
  // emitted by desktop
  socket.on("post-start", (userId) => {
    socket.to(userId).emit("receive-start");
  });

  socket.on("post-result", (result, userId) => {
    recordingIo.in(userId).emit("receive-result", result);
  });
});

// -- for local dev --
httpsServer.listen(port, () => {
  console.log(`Server is running at localhost: ${port}`);
});
// ---

// -- for docker build --
// httpServer.listen(port, () => {
//   console.log(`Server is running at localhost: ${port}`);
// });
// ---
