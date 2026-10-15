const express = require("express");

const router = express.Router();

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostStatusOverview,
  getTopPerformingPosts,
} = require("../controllers/socialMediaController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// CREATE
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createPost
);

// GET ALL
router.get("/", authMiddleware, getPosts);

// STATUS OVERVIEW
router.get(
  "/status-overview",
  authMiddleware,
  getPostStatusOverview
);

// TOP PERFORMING
router.get(
  "/top-performing",
  authMiddleware,
  getTopPerformingPosts
);

// SINGLE
router.get("/:id", authMiddleware, getPostById);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  updatePost
);

// DELETE
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;