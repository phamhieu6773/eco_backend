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
  handleRefreshTokenAdmin,
  handleRefreshTokenUser,
  logout,
  updatedPassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  deleteProductFromCart,
  // applyVoucher,
  emptyCart,
  createOrder,
  // getOrders,
  getOrder,
  getOrderByUser,
  updateOrderStatus,
  getAllOrders,
  updateUserCart,
  registerStore,
  approveStoreRegistration,
  getUser,
  getCountAllOrders,
  updateStore
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin, isSystemAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.post("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatedPassword);
router.post("/cart", authMiddleware, userCart);
router.post("/login", loginUserCtrl);
router.post("/register-store", authMiddleware, registerStore);
router.put("/update-store", authMiddleware, updateStore);
router.post("/admin-login", loginAdmin);
router.post("/create-order", authMiddleware, createOrder);
router.get("/all-users", authMiddleware, isAdmin, getAllUsers);
router.get("/wishlist", authMiddleware, getWishList);
router.post("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/refresh-admin", handleRefreshTokenAdmin);
router.get("/refresh-user", handleRefreshTokenUser);
router.get("/getuser", authMiddleware, getUser);
router.get("/cart", authMiddleware, getUserCart);
router.get("/:id", authMiddleware, getaUser);
router.get("/cart/get-orderbyuser", authMiddleware, getOrderByUser);
router.get("/cart/get-order/:id", getOrder);
router.get("/cart/getallorders", authMiddleware, isAdmin, getAllOrders);
router.get("/cart/getallorderscount", authMiddleware, isAdmin, getCountAllOrders);
// router.get("/cart/get-orders", authMiddleware, getOrders);
router.delete("/delete/:id", deleteaUser);
router.delete(
  "/deleteitemcart/:cartItemId",
  authMiddleware,
  deleteProductFromCart
);
router.delete("/emptycart", authMiddleware, emptyCart);
router.put("/edit-user", authMiddleware, updateaUser);
router.put("/updateitemcart/:id", authMiddleware, updateUserCart);
// router.put("/applyvoucher", authMiddleware, applyVoucher);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.put("/updateStatusStore/:id", authMiddleware, isSystemAdmin, approveStoreRegistration);
router.put(
  "/cart/update-order-status/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);

module.exports = router;
