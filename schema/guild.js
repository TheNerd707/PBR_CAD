const { name } = require("ejs");
const e = require("express");
const { Schema, model } = require("mongoose");
const guildSchema = new Schema({
  _id: Schema.Types.ObjectId,
  code: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["GTAV", "ERLC", "Other"],
    default: "GTAV",
  },
});

module.exports = new model("Guild", guildSchema, "guild");
