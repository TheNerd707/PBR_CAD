const { Schema, model } = require("mongoose");

const membershipSchema = new Schema({
  _id: Schema.Types.ObjectId,
  user: { type: Schema.Types.ObjectId, ref: "User" },
  guild: { type: Schema.Types.ObjectId, ref: "Guild" },
  characters: [{ 
    character: { type: Schema.Types.ObjectId, ref: "Character" },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
   }],
   civ: {
    type: Boolean,
    required: true,
    default: false,
    },
    leo: {
        type: Schema.Types.Mixed,
        default: false
    },
    admin: {
        type: Boolean,
        required: true,
        default: false,
    },
    dispatch: {
        type: Boolean,
        required: true,
        default: false,
    },
    fire: {
        type: Boolean,
        required: true,
        default: false,
    },
    staff: {
        type: Boolean,
        required: true,
        default: false,
    },
    ccs: {
        type: Boolean,
        required: true,
        default: false,
    },
});

module.exports = new model("MemberShip", membershipSchema, "membership");
