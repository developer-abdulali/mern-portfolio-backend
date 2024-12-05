import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dbConnection from "./config/db.js";
import { errorMiddleware } from "./middlewares/error.js";
import msgRouter from "./routes/msgRoutes.js";
import userRouter from "./routes/userRoutes.js";
import timelineRouter from "./routes/timelineRoutes.js";
import appsRouter from "./routes/softwareAppsRoutes.js";
import skillsRouter from "./routes/skillsRoutes.js";
import projectsRouter from "./routes/projectsRoutes.js";

const app = express();
dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
  })
);

// api routes
app.use("/api/v1/message", msgRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/app", appsRouter);
app.use("/api/v1/skill", skillsRouter);
app.use("/api/v1/project", projectsRouter);

dbConnection();
app.use(errorMiddleware);

export default app;
