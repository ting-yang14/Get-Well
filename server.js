import express from "express";
import path from "path";
import https from "https";
import fs from "fs";
import passport from "passport";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { getDirname } from "./public/js/utils.js";
import { userRouter } from "./routes/userRoutes.js";
import { recordRouter } from "./routes/recordRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { connectDB } from "./config/db.js";
import { passportStrategy } from "./config/passport.js";
const options = {
  key: fs.readFileSync(`./localhost-key.pem`),
  cert: fs.readFileSync(`./localhost.pem`),
};
const app = express();
const port = process.env.PORT || 8080;
const __dirname = getDirname(import.meta.url);
const namespace = "/recording";

dotenv.config();
connectDB();

app.set("view engine", "ejs");
app.use("/js", express.static(path.join(__dirname, "public", "js")));
app.use("/img", express.static(path.join(__dirname, "public", "img")));
app.use("/css", express.static(path.join(__dirname, "public", "css")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/record/:id", (req, res) => {
  res.render("record", { title: "我的紀錄" });
});

app.get("/user", (req, res) => {
  res.render("user", { title: "會員資料" });
});

app.use(errorHandler);

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

httpsServer.listen(port, () => {
  console.log(`Server is running at localhost: ${port}`);
});
// app.listen(port, function () {
//   console.log(`Server is running at localhost: ${port}`);
// });
