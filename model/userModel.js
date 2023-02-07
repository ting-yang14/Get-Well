import mongoose from "mongoose";
const userSchema = mongoose.Schema(
  {
    username: { type: String, required: [true, "Please filled in username"] },
    email: {
      type: String,
      required: [true, "Please filled in email"],
      unique: true,
    },
    password: { type: String, required: [true, "Please filled in password"] },
  },
  { timestamps: true }
);
export const User = mongoose.model("User", userSchema);
