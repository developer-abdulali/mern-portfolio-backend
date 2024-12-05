import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import {
  addApplication,
  deleteApplication,
  getAllApplications,
} from "../controllers/appsController.js";

const router = express.Router();

router.post("/add", isAuthenticated, addApplication);
router.delete("/delete/:id", isAuthenticated, deleteApplication);
router.get("/getall", isAuthenticated, getAllApplications);

export default router;
