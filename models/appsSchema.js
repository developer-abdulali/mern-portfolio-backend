import mongoose from "mongoose";

const appsSchema = new mongoose.Schema({
  name: String,
  svg: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

export const Apps = mongoose.model("Apps", appsSchema);
