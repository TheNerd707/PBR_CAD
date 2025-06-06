const { Schema, model } = require("mongoose");

const aSchema = new Schema({
  _id: Schema.Types.ObjectId,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    make: {
        type: String,
        required: true,
        trim: true,
    },
    model: {
        type: String,
        required: true,
        trim: true,
    },
    year: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: false,
        trim: true,
    },
    licensePlate: {
        type: String,
        required: false,
        trim: true,
    },
    vin: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ["car", "truck", "motorcycle", "other"],
        default: "car",
    },
    status: {
        type: String,
        required: true,
        enum: ["N/A", "stolen", "totaled", "impounded"],
        default: "N/A",
    },
    insured: {
        type: Boolean,
        required: true,
        default: false,
    },
    registered: {
        type: Boolean,
        required: true,
        default: false,
    },
});

module.exports = new model("Vehicle", aSchema, "vehicle");