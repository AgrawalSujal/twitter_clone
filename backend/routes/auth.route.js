import express from "express";
import {
  getMe,
  Login,
  Logout,
  Signup,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const router = express.Router();

router.post("/signup", Signup);

router.post("/login", Login);

router.get("/logout", Logout);

router.get("/getme", protectedRoute, getMe);

export default router;
