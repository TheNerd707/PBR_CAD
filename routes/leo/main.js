const express = require("express");
const router = express.Router();

//dbshit
const memberShipDB = require("../../schema/memberShip");

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
    if (!req.userId) {
      res.redirect("/login");
    }
  });

  return router;
};
