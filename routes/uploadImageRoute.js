const express = require("express");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");
const { uploadImages, deleteImages } = require("../controller/uploadImageCtrl");
const router = express.Router();

router.put(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);
router.delete("/deleteimg/:id", authMiddleware, isAdmin, deleteImages);

module.exports = router;
