const { Schema, model } = require("mongoose");

const aSchema = new Schema({
  _id: Schema.Types.ObjectId,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  middleName: {
    type: String,
    required: false,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  occupation: {
    type: String,
    required: false,
    trim: true,
  },
  medicalNotes: {
    // Allergies, meds, etc.
    type: String,
    required: false,
    trim: true,
  },
  female: {
    type: Boolean,
    required: true,
  },
  pronouns: {
    type: String,
    required: false,
    trim: true,
  },
  address: {
    type: String,
    required: false,
    trim: true,
  },
  organDonor: {
    type: Boolean,
    required: true,
    default: false,
  },
  nextOfKin: {
    type: String,
    required: false,
    trim: true,
  },
  description: {
    eyeColor: {
      type: String,
      required: false,
      trim: true,
    },
    hairColor: {
      type: String,
      required: false,
      trim: true,
    },
    height: {
      type: String,
      required: false,
      trim: true,
    },
    weight: {
      type: String,
      required: false,
      trim: true,
    },
  },
  aliases: [
    {
      type: String,
      required: false,
      trim: true,
    },
  ],
  records: {
    type: [
      {
        type: {
          type: String,
          required: true,
          enum: ["arrest", "citation", "warning", "incident"],
        },
        date: {
          type: Date,
          required: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        officer: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    default: [], // Optional, but good to have to avoid `undefined`
  },
  vehicles: [
    {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: false,
    },
  ],
  guns: [
    {
      type: Schema.Types.ObjectId,
      ref: "Weapon",
      required: false,
    },
  ],
});

module.exports = new model("Character", aSchema, "characters");
