const express = require("express");
const router = express.Router();

//dbshit
const memberShipDB = require("../../schema/memberShip");
const callsDB = require("../../schema/calls");
const  mongoose = require("mongoose");

module.exports = (io) => {
  router.get("/", async (req, res) => {
    if (!req.session.userId) {
      res.redirect("/");
      return;
    }
    if (!req.session.guildId) {
      res.redirect("/main");
      return;
    }
    const membership = await memberShipDB.findOne({
      user: req.session.userId,
      guild: req.session.guildId,
    });
    if (!membership) {
      res.redirect("/main");
      return;
    }
    if (!membership.leo) {
      res.redirect("/main");
      return;
    }
    res.render("leo/index");
  });
  router.post("/calls", async (req, res) => {
    const call = new callsDB({
      _id: new mongoose.Types.ObjectId(),
      owner: req.session.userId,
      title: "Test Call",
      description: "Test Description",
      location: "Test Location",
      guild: req.session.guildId,
      participants: [{
        user: req.session.userId,
        type: "officer",
        status: "attached",
        callSign: "R-187"
      }],
      additionalsNeeded: [{
        type: "leo",
        number: 1,
      },
      {
        type: "ems",
        number: 1,
      }],
    });

    await call.save()
    res.send("ok");
    io.to(req.session.guildId).emit("calls", [{
      id: call._id,
      title: call.title,
      description: call.description,
      location: call.location,
      units: call.participants.map(p => p.callSign || p.user.username),
      additionalsNeeded: call.additionalsNeeded.map(a => `${a.number} ${a.type}`).join(", "),
  }]);
  });

  return router;
};
