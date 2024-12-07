import mongoose from "mongoose";

const dbConnection = () => {
  const MONGO_URI = process.env.MONGODB_URI;

  if (!MONGO_URI) {
    console.error("Error: MongoDB URI is not defined");
    process.exit(1);
  }

  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
};

export default dbConnection;
