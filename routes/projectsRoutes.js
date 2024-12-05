import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addProject,
  deleteProject,
  getAllProjects,
  getSingleProjects,
  updateProject,
} from "../controllers/projectsController.js";

const router = express.Router();

router.post("/add", isAuthenticated, addProject);
router.delete("/delete/:id", isAuthenticated, deleteProject);
router.put("/update/:id", isAuthenticated, updateProject);
router.get("/get/:id", isAuthenticated, getSingleProjects);
router.get("/getall", isAuthenticated, getAllProjects);

export default router;
