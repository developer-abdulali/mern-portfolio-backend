import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addSkill,
  deleteSkill,
  getAllSkills,
  updateSkill,
} from "../controllers/skillsController.js";

const router = express.Router();

router.post("/add", isAuthenticated, addSkill);
router.delete("/delete/:id", isAuthenticated, deleteSkill);
router.put("/update/:id", isAuthenticated, updateSkill);
router.get("/getall", isAuthenticated, getAllSkills);

export default router;
