const { Schema, model } = require("mongoose");

const aSchema = new Schema({
  _id: Schema.Types.ObjectId,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    weapon: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    serialNumber: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    }, 
});

module.exports = new model("Weapon", aSchema, "weapon");