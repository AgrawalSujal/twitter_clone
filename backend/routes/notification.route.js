import express from "express";
import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notification.controller.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const router = express.Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/", protectedRoute, deleteNotifications);

export default router;
