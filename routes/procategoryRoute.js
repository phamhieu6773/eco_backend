const express = require("express");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  getaCategory,
} = require("../controller/procategoryCtrl");
const router = express.Router();

router.post("/createcategory", authMiddleware, isAdmin, createCategory);
router.put("/updatecategory/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/deletecategory/:id", authMiddleware, isAdmin, deleteCategory);
router.get("/all-categories", getAllCategory);
router.get("/:id", getaCategory);
module.exports = router;
