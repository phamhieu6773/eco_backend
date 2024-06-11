const express = require("express");
const {
  createProduct,
  getAllProducts,
  getaProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  getaProductRasa,
  getAllProductsByStore,
  getAllProductsByStoreUser,
  searchProduct,
  getCountProducts,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/createproduct", authMiddleware, isAdmin, createProduct);

router.put("/updateproduct/:id", authMiddleware, isAdmin, updateProduct);

router.get("/all-products", getAllProducts);
router.get("/search", searchProduct);
router.get("/all-products-store", authMiddleware, getAllProductsByStore);
router.get("/count-products-store", authMiddleware, getCountProducts);

router.put("/wishlist", authMiddleware, addToWishList);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/:id", getaProduct);
router.get("/", getaProductRasa);
router.put("/rating", authMiddleware, rating);

module.exports = router;
