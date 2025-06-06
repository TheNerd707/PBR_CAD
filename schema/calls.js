const { name } = require("ejs");
const e = require("express");
const { Schema, model } = require("mongoose");
const users = require("./users");
const guildSchema = new Schema({
    _id: Schema.Types.ObjectId,
    guild: {
        type: Schema.Types.ObjectId,
        ref: "Guild",
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    location: {
        type: String,
        required: false,
        trim: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        required: true,
        enum: ["open", "closed", "waiting"],
        default: "open",
    },
    participants: [
        {
            users: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            type: {
                type: String,
                required: true,
                enum: ["civilian", "dispatcher", "officer", "other"],
                default: "officer",
            },
            status: {
                type: String,
                required: true,
                enum: ["primary", "attached", "on-scene", "en-route"],
                default: "attached",
            },
        },
    ],
    callType: {
        type: String,
        required: true,
        enum: ["911", "non-emergency", "other"],
        default: "non-emergency",
    },
});

guildSchema.index({ createdAt: 1 }, { expireAfterSeconds: 43200 }); // 12 hours

module.exports = new model("Calls", guildSchema, "calls");