import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  aboutMe: {
    type: String,
    required: [true, "About text is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
  },
  resume: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  portfolioURL: {
    type: String,
    required: [true, "Portfolio URL is required"],
  },
  githubURL: String,
  instagramURL: String,
  linkedinURL: String,
  facebookURL: String,
  twitterURL: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// generate jwt token
userSchema.methods.generateJwtToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  return token;
};

// forgot password
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
