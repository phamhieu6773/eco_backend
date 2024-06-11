const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMondoDbId = require("../utils/validateMongodbId");
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
  cloudinaryUploadFile,
} = require("../utils/cloudinary");
const fs = require("fs");

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadImage(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
    }

    const images = urls.map((file) => {
      return file;
    });
    res.json(images);
    // const findProduct = await Product.findByIdAndUpdate(
    //   id,
    //   {
    //     images: urls.map((file) => {
    //       return file;
    //     }),
    //   },
    //   { new: true }
    // );
    // res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = cloudinaryDeleteImage(id, "images");
    res.json({ id });
  } catch (error) {
    throw new Error(error);
  }
});

const uploadFile = asyncHandler(async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadFile(path, "file");
    const urls = [];
    const files = req.files;
    console.log(files);
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
    }

    const filesUpload = urls.map((file) => {
      return file;
    });
    res.json(filesUpload);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  uploadImages,
  deleteImages,
  uploadFile
};
