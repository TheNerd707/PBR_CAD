require("dotenv").config();
const fs = require("fs");
if (process.env.NODE_ENV === "dev") {
  const dev = require("./control.dev.json");
  fs.writeFileSync("./control.json", JSON.stringify(dev, null, 4));
} else if (process.env.NODE_ENV === "prod") {
  const prod = require("./control.prod.json");
  fs.writeFileSync("./control.json", JSON.stringify(prod, null, 4));
}

const control = require("./control.json");
const express = require("express");
const session = require("express-session");
const io = require("socket.io");
const http = require("http");
const path = require("path");
const { connect } = require("mongoose");

const app = express();
const server = http.createServer(app);
const socket = io(server);
require("../NEW-CAD/socket.io/main")(socket);

const PORT = process.env.PORT || 3000;

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "iamthebestintheworld",
  resave: false,
  saveUninitialized: false,
});

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(sessionMiddleware);
socket.engine.use(sessionMiddleware);

// Database schema
const Mongoose = require("mongoose");
const userSchema = require("./schema/users");
const memberShipSchena = require("./schema/memberShip");
const guildSchema = require("./schema/guild");

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
  const user = await userSchema.findOne({ username: req.body.user });

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
  const user = await userSchema.findById(req.session.userId);
  if (!user) {
    res.redirect("/");
    return;
  }
  const memberShip = await memberShipSchena
    .find({ user: user._id })
    .populate("guild");
  const guilds = memberShip.map((m) => m.guild);
  const message = req.session.message || "";
  req.session.guildId = "";
  req.session.message = "";
  res.render("server-select", {
    userGuilds: guilds,
    name: user.username,
    message: message,
  });
});

app.post("/guild-join", async (req, res) => {
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  const user = await userSchema.findById(req.session.userId);
  if (!user) {
    res.redirect("/");
    return;
  }
  const guild = await guildSchema.findOne({ code: req.body.id });

  if (!guild) {
    req.session.message = "Server not found.";
    res.redirect("/server-select");
    return;
  }

  const memberships = await memberShipSchena
    .find({ user: user.id })
    .populate("guild");
  const guilds = memberships.map((m) => m.guild);
  if (guilds.some((g) => g._id.equals(guild._id))) {
    // User is already a member of this guild
    req.session.message = "You are already in this server.";
    res.redirect("/server-select");
    return;
  }
  // Add user to guild
  const newMembership = new memberShipSchena({
    _id: new Mongoose.Types.ObjectId(),
    user: user._id,
    guild: guild._id,
  });
  await newMembership.save();
  req.session.message = "You have joined the server.";
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
  if(!req.query.guildId) {
    req.query.guildId = req.session.guildId;
  }
  const guild = await guildSchema.findOne({code: req.query.guildId});
  if (!guild) {
    res.redirect("/server-select");
    return;
  }
  if (req.query.guildId) {
    req.session.guildId = guild.id;
  }
  const memberShip = await memberShipSchena.findOne({
    user: req.session.userId,
    guild: guild._id,
  });
  if (!memberShip) {
    res.redirect("/server-select");
    return;
  }
  const departments = [];
  const departmentTypes = ["civ", "leo", "staff", "admin", "dispatch", "fire"];
  departmentTypes.forEach((type) => {
    if (memberShip[type]) {
      departments.push({ name: type, url: `/${type}` });
    }
  });

  res.render("main/main", {
    guildName: guild.name,
    departments: departments,
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

const leoRouter = require("../NEW-CAD//routes/leo/main")(socket);
const civRouter = require("../NEW-CAD/routes/civ/main");
app.use("/leo", leoRouter);
app.use("/civ", civRouter);

app.use((req, res, next) => {
  res.status(404).send("Sorry, we couldn't find that!");
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
(async () => {
  connect("mongodb://pi:27017/" + control.db.name).catch(console.error);
})();
