const express = require("express");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlog,
  getaBlog,
  liketheBlog,
  disliketheBlog,
  uploadImages,
} = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/createblog", authMiddleware, isAdmin, createBlog);
router.put("/updateblog/:id", authMiddleware, isAdmin, updateBlog);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 2),
  blogImgResize,
  uploadImages
);
router.put("/dislikes", authMiddleware, disliketheBlog);
router.put("/likes", authMiddleware, liketheBlog);
router.delete("/deleteblog/:id", authMiddleware, isAdmin, deleteBlog);
router.get("/all-blogs", getAllBlog);
router.get("/:id", getaBlog);

module.exports = router;
