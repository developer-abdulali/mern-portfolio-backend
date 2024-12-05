import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: "PORTFOLIO",
      serverSelectionTimeoutMS: 30000,
    })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
};

export default dbConnection;
