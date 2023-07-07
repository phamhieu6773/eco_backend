const express = require("express");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  getaCategory,
} = require("../controller/blogcategoryCtrl");
const router = express.Router();

router.post("/create", authMiddleware, isAdmin, createCategory);
router.put("/update/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteCategory);
router.get("/all-categories", getAllCategory);
router.get("/:id", getaCategory);
module.exports = router;
