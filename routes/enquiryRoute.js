const express = require("express");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getAllEnquiry,
  getaEnquiry,
} = require("../controller/enquiryCtrl");
const router = express.Router();

router.post("/create-enquiry", authMiddleware, createEnquiry);
router.put("/update-enquiry/:id", authMiddleware, isAdmin, updateEnquiry);
router.delete("/delete-enquiry/:id", authMiddleware, isAdmin, deleteEnquiry);
router.get("/all-enquiry", getAllEnquiry);
router.get("/:id", getaEnquiry);
module.exports = router;
