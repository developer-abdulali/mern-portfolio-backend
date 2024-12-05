import express from "express";
import {
  deleteMessage,
  getMessages,
  sendMessage,
} from "../controllers/msgController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/getall", getMessages);
router.delete("/delete/:id", isAuthenticated, deleteMessage);

export default router;
