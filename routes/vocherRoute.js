const express = require("express");
const {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getAllVoucher,
  getaVoucher,
} = require("../controller/voucherCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create", authMiddleware, isAdmin, createVoucher);
router.put("/update/:id", authMiddleware, isAdmin, updateVoucher);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteVoucher);
router.get("/all-vouchers", getAllVoucher);
router.get("/:id", getaVoucher);

module.exports = router;
