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

  router.delete("/calls/:id", async (req, res) => {
    if (!req.session.userId) {
      res.status(401).send("Unauthorized");
      return;
    }
    const callId = req.params.id;
    const call = await callsDB.findById(callId);
    if (!call) {
      console.error("Call not found:", callId);
      res.status(404).send("Call not found");
      return;
    }
    const membership = await memberShipDB.findOne({
      user: req.session.userId,
      guild: call.guild, //change to callGuild so users from other guilds cant delete calls
    });
    if (!membership || !membership.leo) {
      res.status(403).send("Forbidden");
      return;
    }
    // Only supervisors can delete calls with participants
    if (call.participants && call.participants.length > 0 && membership.leo.supervisor === false) {
      res.status(403).send("Forbidden");
      return;
    }
    
    await callsDB.deleteOne({ _id: callId });
    io.to(req.session.guildId).emit("callDeleted", callId);
    res.status(200).send("Call deleted successfully");
  })
  return router;
};
