const { Schema, model } = require("mongoose");

const aSchema = new Schema({
  _id: Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    discordId: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    },
});

module.exports = new model("User", aSchema, "user");