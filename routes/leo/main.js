const express = require("express");
const router = express.Router();

module.exports = (io) => {
  router.get("/", async (req, res) => {
    res.render("leo/index");
  });

  router.post("/calls", async (req, res) => {
    if (!req.userId) {
     res.redirect("/login");
    }
  });

  return router;
};
