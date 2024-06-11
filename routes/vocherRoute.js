const express = require("express");
const {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getAllVoucher,
  getaVoucher,
  getAllVoucherByUser,
} = require("../controller/voucherCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create", authMiddleware, isAdmin, createVoucher);
router.put("/update/:id", authMiddleware, isAdmin, updateVoucher);
router.get("/all-vouchers", authMiddleware, getAllVoucher);
router.get("/all-vouchers-user", authMiddleware, getAllVoucherByUser);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteVoucher);

router.get("/:id", getaVoucher);

module.exports = router;
