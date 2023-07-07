const express = require("express");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getAllBrand,
  getaBrand,
} = require("../controller/brandCtrl");
const router = express.Router();

router.post("/createbrand", authMiddleware, isAdmin, createBrand);
router.put("/updatebrand/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/deletebrand/:id", authMiddleware, isAdmin, deleteBrand);
router.get("/all-brands", getAllBrand);
router.get("/:id", getaBrand);
module.exports = router;
