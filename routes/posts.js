import express from "express";
import {
  addPost,
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
} from "../controllers/post.js";
const router = express.Router();

// fetch all post
router.get("/", getAllPosts);
router.get("/:id", getPost);
router.post("/", addPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
