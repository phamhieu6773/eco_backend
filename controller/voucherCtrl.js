const Voucher = require("../models/voucherModel");
const asyncHandler = require("express-async-handler");
const validateMondoDbId = require("../utils/validateMongodbId");

const createVoucher = asyncHandler(async (req, res) => {
  try {
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
    const getAllVoucher = await Voucher.find();
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
};
