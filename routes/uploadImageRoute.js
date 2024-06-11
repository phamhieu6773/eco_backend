const express = require("express");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");
const { uploadImages, deleteImages, uploadFile } = require("../controller/uploadImageCtrl");
const router = express.Router();

router.put(
  "/",
  authMiddleware,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);

router.put(
  "/uploadfile",
  // authMiddleware,
  // uploadPhoto.array("images", 10),
  uploadPhoto.array("file", 10),
  // productImgResize,
  uploadFile
);
router.delete("/deleteimg/:id", authMiddleware, isAdmin, deleteImages);

module.exports = router;
