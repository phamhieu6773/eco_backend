const Voucher = require("../models/voucherModel");
const asyncHandler = require("express-async-handler");
const validateMondoDbId = require("../utils/validateMongodbId");
const Store = require("../models/storeModel");

const createVoucher = asyncHandler(async (req, res) => {
  // const { _id } = req.user;
  // validateMondoDbId(_id);
  try {
    if (req.user._id){
      req.body.user_id = req.user._id;
    }
    const store = await Store.findOne({owner: req.user._id });
    console.log(store);

    if (store) {
      req.body.store_id = store._id;
    }
    const newVoucher = await Voucher.create(req.body);
    res.json(newVoucher);
  } catch (error) {
    throw new Error(error);
  }
});

const updateVoucher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const updateVoucher = await Voucher.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateVoucher);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteVoucher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const deleteVoucher = await Voucher.findByIdAndDelete(id);
    res.json(deleteVoucher);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllVoucher = asyncHandler(async (req, res) => {
  try {
    const store = await Store.findOne({owner: req.user._id });
    console.log(store);
    const getAllVoucher = await Voucher.find({store_id: store?._id});
    res.json(getAllVoucher);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllVoucherByUser = asyncHandler(async (req, res) => {
  const store_id = req.query.store_id;
  try {
    const getAllVoucher = await Voucher.find({store_id: store_id});
    res.json(getAllVoucher);
  } catch (error) {
    throw new Error(error);
  }
});

const getaVoucher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const getaVoucher = await Voucher.findById(id);
    res.json(getaVoucher);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getAllVoucher,
  getaVoucher,
  getAllVoucherByUser
};
