import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    minLength: [2, "Name must be at least 2 characters"],
  },
  subject: {
    type: String,
    minLength: [2, "Subject must be at least 2 characters"],
  },
  message: {
    type: String,
    minLength: [2, "Message must be at least 2 characters"],
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Message = mongoose.model("Message", messageSchema);