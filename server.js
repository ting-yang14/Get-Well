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

app.use("/api/user", userRouter);
app.use("/api/record", recordRouter);

passportStrategy(passport);
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.render("index", { title: "首頁" });
});

app.get("/recording", (req, res) => {
  res.render("recording", { title: "紀錄復健" });
});

app.get("/record/:recordId", (req, res) => {
  res.render("record", { title: "我的紀錄" });
});

app.get("/user", (req, res) => {
  res.render("user", { title: "會員資料" });
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

  socket.on("user-join", (joinDevice, userId) => {
    console.log(`${userId} 的 ${joinDevice} 已連接`);
    const result = socketHandler.join(joinDevice, userId, rooms);
    if (result.join) {
      // user join the room
      socket.join(userId);
      if (userId in rooms) {
        // rooms = {"userId1":[],...} 或
        // rooms = {"userId1":[{"socketId1":["Desktop"]}],...}
        rooms[userId].push({ [socket.id]: [joinDevice] });
      } else {
        // rooms = {...}
        rooms[userId] = [{ [socket.id]: [joinDevice] }];
      }
      // to device(s) in room userId
      recordingIo.in(userId).emit("join-result", result);
      console.log(userId, "連線裝置：", rooms[userId]);
    } else {
      // user is rejected, back to sender
      socket.emit("join-result", result);
    }
  });

  socket.on("device-access", (userId, result) => {
    console.log(`user:${userId} ${result.msg}`);
    if (result.access) {
      socketHandler.access(userId, socket.id, rooms);
      // to device(s) in room userId
      recordingIo.in(userId).emit("access-result", result);
    } else {
      // access is denied, back to sender
      socket.emit("access-result", result);
    }
  });

  socket.on("record", (state, triggerDevice, userId) => {
    console.log(`由 ${userId} 的 ${triggerDevice} ${state} 紀錄`);
    // const result = checkStop(stopDevice, userId, rooms);
    const result = socketHandler.record(state, triggerDevice, userId, rooms);
    if (result.both) {
      // room 中 2 裝置都回應
      recordingIo.in(userId).emit(`${state}-result`, triggerDevice, result);
    } else {
      if (state === "start") {
        // 對 startDevice (sender) 給 失敗訊息
        socket.emit(`${state}-result`, triggerDevice, result);
      } else {
        // 對 stopDevice (sender)外的另一裝置 給 失敗訊息
        socket.to(userId).emit(`${state}-result`, triggerDevice, result);
      }
    }
  });

  socket.on("send-record", (record, userId) => {
    socket.to(userId).emit("receive-record", record);
    // recordingIo.in(userId).emit("receive-record", record);
  });

  socket.on("send-acc", (acc, userId) => {
    socket.to(userId).emit("receive-acc", acc);
    // recordingIo.in(userId).emit("receive-record", record);
  });

  socket.on("send-ori", (ori, userId) => {
    socket.to(userId).emit("receive-ori", ori);
    // recordingIo.in(userId).emit("receive-record", record);
  });

  socket.on("send-result", (result, userId) => {
    // socket.to(userId).emit("receive-result", result);
    recordingIo.in(userId).emit("receive-result", result);
  });

  socket.on("disconnect", () => {
    console.log(socket.id, "disconnected");
    socketHandler.removeDisconnectedDeviceSocketId(socket.id, rooms);
    console.log(socket.rooms);
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

// app.listen(port, function () {
//   console.log(`Server is running at localhost: ${port}`);
// });
