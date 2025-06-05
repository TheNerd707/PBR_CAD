const express = require("express");
const router = express.Router();

const { getData, updateData, createData } = require("../../db/main");

const idGen = require("../../utils/funcs/idgen");

router.get("/", async (req, res) => {
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  const user = await getData("users", req.session.userId);
  const guild = user.guilds[req.session.guildId];
  if (!guild) {
    res.redirect("/main");
    return;
  }
  if (!guild.civ) {
    res.redirect("/main");
    return;
  }
const charsID = guild.chars;
const chars = [];
for (const charId in charsID) {
  const char = await getData("chars", charId);
  if (charsID[charId]) {
    char.status = "Approved";
  } else {
    char.status = "Pending";
  }
  chars.push(char);
}
const departments = [];
for (const department of guild.customDepartments) {
  departments.push({
    id: department.id,
    name: department.name,
  });
}
res.render("civ", { chars: chars, ccs: guild.ccs });
});

router.post("/characters", async (req, res) => {
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  const user = await getData("users", req.session.userId);
  const guild = user.guilds[req.session.guildId];
  const guildMaster = await getData("guilds", req.session.guildId);
  if (!guildMaster.chars) {
    guildMaster.chars = {};
  }
  if (!guild) {
    res.redirect("/main");
    return;
  }
  const id = await idGen("char", user.id);
  await createData("chars", {
    userId: req.session.userId,
    id: id,
    f_name: req.body.f_name,
    l_name: req.body.l_name,
    DOB: req.body.dob,
    occupation: req.body.occupation,
  });
  user.chars.push(id);
  guild.chars[id] = false;
  
  guildMaster.chars[id] = false;

  user.guilds[req.session.guildId] = guild;
  
  await updateData("users", req.session.userId, user);
  await updateData("guilds", req.session.guildId, guildMaster);

  res.redirect("/civ");
});

router.get("/ccs", async (req, res) => { 
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  const user = await getData("users", req.session.userId);
  const guild = user.guilds[req.session.guildId];
  if (!guild) {
    res.redirect("/main");
    return;
  }
  if (!guild.ccs) {
    res.redirect("/main");
  }

  res.render("civ/ccs", { guild: req.session.guildId, user: req.session.userId });
});

router.post("/characters/get/", async (req, res) => {
  if (!req.body.user) {
    res.status(400).send("User ID is required.");
    return;
  }
  if (!req.body.guild) {
    res.status(400).send("Guild ID is required.");
    return;
  }
  const user = await getData("users", req.body.user);
  const guild = user.guilds[req.body.guild];
  if (!guild) {
    res.status(400).send("User not in guild.");
    return;
  }
  if (!guild.ccs) {
    res.status(400).send("User is not authorised for this action in this guild.");
    return;
  }
  const guildMaster = await getData("guilds", req.body.guild);
  const chars = guildMaster.chars;
  const charList = [];
  for (const charId in chars) {
    const char = await getData("chars", charId);
    character = {
      id: char.id,
      f_name: char.f_name,
      l_name: char.l_name,
      owner: char.userId,
      status: chars[charId] ? "Approved" : "Pending"
    }
    charList.push(character);
  }
  res.status(200).send(charList);
});

module.exports = router;
