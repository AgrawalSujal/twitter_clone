import express from "express";
import {
  followunfollow,
  getSuggestedUsers,
  getUser,
  updateUser,
} from "../controllers/user.controller.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const route = express.Router();

route.get("/profile/:username", protectedRoute, getUser);
route.get("/suggested", protectedRoute, getSuggestedUsers);
route.post("/follow/:id", followunfollow);
route.post("/update", protectedRoute, updateUser);

export default route;
