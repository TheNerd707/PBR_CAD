require("dotenv").config();

const express = require("express");
const session = require("express-session");
const io = require("socket.io");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
const socket = io(server);
require("../NEW-CAD/socket.io/main")(socket);
const { getData, updateData, createData, checkData } = require("./db/main");

const PORT = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "iamthebestintheworld",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.send("Sorry, this feature is not available yet.");
});

app.get("/login", (req, res) => {
  res.render("login", { message: "", user: "" });
});

app.post("/login", async (req, res) => {
  const user = await getData("users", req.body.user);

  if (!user) {
    res.render("login", {
      message: "User not found, please check username and try again.",
      user: req.body.user,
    });
  } else if (user.password !== req.body.password) {
    res.render("login", {
      message:
        "Password incorrect, please check username and password and try again.",
      user: req.body.user,
    });
  } else if (user.password === req.body.password) {
    req.session.userId = user.id;
    res.redirect("/server-select");
  }
});

app.get("/server-select", async (req, res) => {
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  const user = await getData("users", req.session.userId);
  if (!user) {
    res.redirect("/");
    return;
  }
  const guilds = [];
  for (const guildId in user.guilds) {
    if (user.guilds.hasOwnProperty(guildId)) {
      const guild = await getData("guilds", guildId);
      guilds.push(guild);
    }
  }
  const message = req.session.message || "";
  req.session.guildId = "";
  req.session.message = "";
  res.render("server-select", {
    userGuilds: guilds,
    name: user.name,
    message: message,
  });
});

app.post("/guild-join", async (req, res) => {
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  const user = await getData("users", req.session.userId);
  if (!user) {
    res.redirect("/");
    return;
  }
  if (user.guilds[req.body.id]) {
    req.session.message = "You are already in this server.";
    res.redirect("/server-select");
    return;
  }
  const guild = await getData("guilds", req.body.id);
  if (!guild) {
    req.session.message = "Server not found.";
    res.redirect("/server-select");
    return;
  }
  user.guilds.push(req.body.id);
  guild.members.push(user.id);
  await updateData("guilds", req.body.id, guild);
  await updateData("users", req.session.userId, user);
  res.session.message = "You have joined the server.";
  res.redirect("/server-select");
});
app.get("/main", async (req, res) => {
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  if (!req.query.guildId && !req.session.guildId) {
    res.redirect("/server-select");
    return;
  }
  if (req.query.guildId) {
    req.session.guildId = req.query.guildId;
  }
  const user = await getData("users", req.session.userId);
  const guild = user.guilds[req.session.guildId];
  if (!guild) {
    res.redirect("/server-select");
    return;
  }
  const guildMaster = await getData("guilds", req.session.guildId);
  const departments = [];
  const departmentTypes = ["civ", "leo", "staff", "admin", "dispatch", "fire"];
  departmentTypes.forEach(type => {
    if (guild[type]) {
      departments.push({ name: type, url: `/${type}` });
    }
  });

  res.render("main/main", {
    guildName: guildMaster.name,
    departments: departments,
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

const leoRouter = require("../NEW-CAD//routes/leo/main");
const civRouter = require("../NEW-CAD/routes/civ/main");
app.use("/leo", leoRouter(socket));
app.use("/civ", civRouter);

app.use((req, res, next) => {
  res.status(404).send("Sorry, we couldn't find that!");
});

checkData();
server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
