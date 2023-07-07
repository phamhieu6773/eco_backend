const express = require("express");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  createColor,
  updateColor,
  deleteColor,
  getAllColor,
  getaColor,
} = require("../controller/colorCtrl");
const router = express.Router();

router.post("/createcolor", authMiddleware, isAdmin, createColor);
router.put("/updatecolor/:id", authMiddleware, isAdmin, updateColor);
router.delete("/deletecolor/:id", authMiddleware, isAdmin, deleteColor);
router.get("/all-color", getAllColor);
router.get("/:id", getaColor);
module.exports = router;
