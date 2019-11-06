const mongoose = require("mongoose");
const validator = require("validator");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    project_link: {
      type: String,
      required: true,
      validate: value => {
        return validator.isURL(value);
      }
    },
    actual_score: { type: Number },
    max_score: { type: Number },
    percentile: { type: Number },
    student: { type: mongoose.ObjectId, ref: "User" }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema, "assignments");
