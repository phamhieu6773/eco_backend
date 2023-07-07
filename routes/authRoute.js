const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getAllUsers,
  getaUser,
  deleteaUser,
  updateaUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatedPassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  applyVoucher,
  emptyCart,
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.post("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatedPassword);
router.post("/cart", authMiddleware, userCart);
router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdmin);
router.post("/create-order", authMiddleware, createOrder);
router.get("/all-users", getAllUsers);
router.get("/wishlist", authMiddleware, getWishList);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/cart", authMiddleware, getUserCart);
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.get("/cart/get-orders", authMiddleware, getOrders);
router.delete("/delete/:id", deleteaUser);
router.delete("/emptycart", authMiddleware, emptyCart);
router.put("/edit-user", authMiddleware, updateaUser);
router.put("/applyvoucher", authMiddleware, applyVoucher);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.put(
  "/cart/update-order-status/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);

module.exports = router;
