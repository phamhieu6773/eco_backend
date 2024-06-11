const express = require("express");
const { getAllStores, getaStores, getaStoreByUser } = require("../controller/storeCtrl"); 

const { authMiddleware, isAdmin, isSystemAdmin } = require("../middlewares/authMiddleware");
const { getAllProductsByStoreUser } = require("../controller/productCtrl");
const router = express.Router();

router.get("/all-stores", authMiddleware, isSystemAdmin, getAllStores);
router.get("/get-store-user/:id", authMiddleware, getaStoreByUser);
router.get("/:id", getaStores);
router.get("/", getAllProductsByStoreUser);

module.exports = router;