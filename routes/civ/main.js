const express = require("express");
const router = express.Router();

const Mongoose = require("mongoose");
const memberShipDB = require("../../schema/memberShip");
const characterDB = require("../../schema/characters");

router.get("/", async (req, res) => {
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  const memberShip = await memberShipDB.findOne({
    user: req.session.userId,
    guild: req.session.guildId,
  }).populate("characters.character")

  if (!memberShip) {
    res.redirect("/main");
    return;
  }


res.render("civ", { chars: memberShip.characters, ccs: memberShip.ccs });
});

router.post("/characters", async (req, res) => {
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  if (!req.session.guildId) {
    res.redirect("/main");
    return;
  }
  const memberShip = await memberShipDB.findOne({
    user: req.session.userId,
    guild: req.session.guildId,
  }).populate("user");
  if (!memberShip) {
    res.redirect("/main");
    return;
  }
  if (!req.body) {
    res.status(400).send("No character data provided.");
    return;
  }

  const character = new characterDB({
    _id: new Mongoose.Types.ObjectId(),
    owner: memberShip.user._id,
    firstName: req.body.f_name || "",
    lastName: req.body.l_name || "",
    dateOfBirth: req.body.dob || new Date(),
    occupation: req.body.occupation || "",
    female: false,
  });

  await character.save();
  memberShip.characters.push({
  character: character._id,
  status: "pending" // or "active", "inactive", etc., as needed
});
await memberShip.save();




  res.redirect("/civ");
});

router.get("/ccs", async (req, res) => { 
  if (!req.session.userId) {
    res.redirect("/");
    return;
  }
  
  if (!req.session.guildId) {
    res.redirect("/main");
    return;
  }
  const memberShip = await memberShipDB.findOne({
    user: req.session.userId,
    guild: req.session.guildId,
  });
  if (!memberShip) {
    res.redirect("/main");
    return;
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
 const allMemberships = await memberShipDB.find({ guild: req.body.guild}).populate("characters.character");
  if (!allMemberships) {
    res.status(404).send("No memberships found for this guild.");
    return;
  }

  
  const characters = allMemberships.map(membership => {
    return membership.characters.map(char => ({
      id: char.character._id,
      owner: membership.user._id,
      firstName: char.character.firstName,
      lastName: char.character.lastName,
      dateOfBirth: char.character.dateOfBirth,
      occupation: char.character.occupation,
      status: char.status
    }));
  }).flat();
  res.json(characters);
});

module.exports = router;
