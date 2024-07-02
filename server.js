// server.js
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();

app.use('/public', express.static(path.join(__dirname, "public")));

let users = [
  {
    id: 1,
    name: "admin",
    password: "1234",
    dcverified: true,
    civ: true,
    leo: true,
    staff: true,
    admin: true,
    characters: [
      {
        name: "John Doe",
        age: 0,
        occupation: "Unemployed",
        description: "Fat",
        id: 1,
      }
    ]
  },
];

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login", { message: "" });
});

app.post("/login", (req, res) => {
  const user = users.find((e) => e.name === req.body.user);

  if (user) {
    if (user.password === req.body.password) {
      req.session.userId = user.id;
      res.redirect("main");
    } else {
      res.render("login", {
        message:
          "Password incorrect, please check username and password and try again.",
      });
    }
  } else {
    const newUser = {
      id: Date.now().toString(),
      name: req.body.user,
      password: req.body.password,
      dcverified: false,
    };
    users.push(newUser);
    req.session.userId = newUser.id;
    res.redirect("main");
  }
});

app.get("/main", (req, res) => {
  if (req.session.userId) {
    const user = users.find((e) => e.id === req.session.userId);
    if (user.dcverified) {
      res.render("main/main", {
        civ: user.civ,
        leo: user.leo,
        staff: user.staff,
        admin: user.admin,
      });
    } else {
      res.render("main/verifyDiscord");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/civ", (req, res) => {
  if (req.session.userId) {
    const user = users.find((e) => e.id === req.session.userId);
    if (user.civ) {
      res.render("main/dep/civ",
      { characters: user.characters }
      );
    } else {
      res.redirect("/main");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/leo", (req, res) => {
  if (req.session.userId) {
    const user = users.find((e) => e.id === req.session.userId);
    if (user.leo) {
      res.render("main/dep/leo");
    } else {
      res.redirect("/main");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/staff", (req, res) => {
  if (req.session.userId) {
    const user = users.find((e) => e.id === req.session.userId);
    if (user.leo) {
      res.render("main/dep/staff", { users: users });
    } else {
      res.redirect("/main");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/admin", (req, res) => {
  if (req.session.userId) {
    const user = users.find((e) => e.id === req.session.userId);
    if (user.leo) {
      res.render("main/dep/admin");
    } else {
      res.redirect("/main");
    }
  } else {
    res.redirect("/login");
  }
});


app.post("/characters", (req, res) => { 
  const user = users.find((e) => e.id === req.session.userId);
  user.characters.push(req.body);
  res.redirect("/civ");
 });

app.get("/test", (req, res) => {
  res.render("main/dep/civ2");
});
 
app.listen(process.env.PORT || 3000, () => {
  console.log(
    "Server is running on port " +
      (process.env.PORT || 3000) +
      ` at http://localhost:` +
      (process.env.PORT || 3000)
  );
});
