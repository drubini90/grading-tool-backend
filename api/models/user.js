const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: value => {
        return validator.isEmail(value);
      }
    },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    grade: { type: Number },
    assignment: [{ type: mongoose.ObjectId, ref: "Assignment" }]
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

module.exports = mongoose.model("User", userSchema, "users");
