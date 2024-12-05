import express from "express";
import {
  forgotUserPassword,
  getUser,
  getUserForPortfolio,
  loginUser,
  logoutUser,
  registerUser,
  resetUserPassword,
  updateUser,
  updateUserPassword,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getUser);
router.put("/update/me", isAuthenticated, updateUser);
router.put("/update/password", isAuthenticated, updateUserPassword);
router.get("/portfolio/me", isAuthenticated, getUserForPortfolio);
router.post("/password/forgot", forgotUserPassword);
router.put("/password/reset/:token", resetUserPassword);

export default router;
