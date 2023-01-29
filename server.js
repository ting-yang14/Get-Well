import express from "express";
import path from "path";
import { getDirname } from "./utils.js";

const app = express();
const port = 8080;
const __dirname = getDirname(import.meta.url);

app.set("view engine", "ejs");
app.use("/js", express.static(path.join(__dirname, "public", "js")));
app.use("/img", express.static(path.join(__dirname, "public", "img")));
app.use("/css", express.static(path.join(__dirname, "public", "css")));

app.get("/", (req, res) => {
  res.render("index", { title: "首頁" });
});
app.get("/recording", (req, res) => {
  res.send("Recording");
});
app.get("/record/:id", (req, res) => {
  res.send(`Record ID: ${req.params.id}`);
});
app.get("/user/:id", (req, res) => {
  res.send(`User ID: ${req.params.id}`);
});

app.listen(port, function () {
  console.log(`Server is running at localhost: ${port}`);
});
