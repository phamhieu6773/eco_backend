const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const validateMondoDbId = require("../utils/validateMongodbId");

const createColor = asyncHandler(async (req, res) => {
  try {
    const newColor = await Color.create(req.body);
    res.json(newColor);
  } catch (error) {
    throw new Error(error);
  }
});
const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedColor);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const deletedColor = await Color.findByIdAndDelete(id);
    res.json(deletedColor);
  } catch (error) {
    throw new Error(error);
  }
});
const getaColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const getaColor = await Color.findById(id);
    res.json(getaColor);
  } catch (error) {
    throw new Error(error);
  }
});
const getAllColor = asyncHandler(async (req, res) => {
  try {
    const getallColor = await Color.find();
    res.json(getallColor);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createColor,
  updateColor,
  deleteColor,
  getaColor,
  getAllColor,
};
