// const Product = require("../models/productModel");
const User = require("../models/userModel");
const Store = require("../models/storeModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMondoDbId = require("../utils/validateMongodbId");
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} = require("../utils/cloudinary");
const fs = require("fs");


// const updateProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   try {
//     if (req.body.title) {
//       req.body.slug = slugify(req.body.title);
//     }
//     const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     res.json(updateProduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const deleteProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMondoDbId(id);
//   try {
//     const deleteProduct = await Product.findByIdAndDelete(id);
//     res.json(deleteProduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getAllStores = asyncHandler(async (req, res) => {
    try {
      const status = req.query.status;
      let query = {};
      if(status === -1 || status === undefined || status === "Tất cả") {
        query = {}
      } else {
        query.status = status
      }
      const getAllStores = await Store.find(query).populate("owner");
      res.json(getAllStores);
    } catch (error) {
      throw new Error(error);
    }
  });

const getaStores = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    // const getStore = await Product.findById(id).populate("color");
    const getStore = await Store.findById(id).populate("owner");
    res.json(getStore);
  } catch (error) {
    throw new Error(error);
  }
});

const getaStoreByUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    // const getStore = await Product.findById(id).populate("color");
    const getStore = await Store.findOne({owner: id});
    res.json(getStore);
  } catch (error) {
    throw new Error(error);
  }
});

// const rating = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const { star, comment, prodId } = req.body;
//   try {
//     const product = await Product.findById(prodId);
//     console.log(product.ratings);
//     let alreadyrated = product.ratings.find(
//       (userId) => userId.postedby.toString() === _id.toString()
//     );
//     if (alreadyrated) {
//       const updateRating = await Product.updateOne(
//         {
//           ratings: { $elemMatch: alreadyrated },
//         },
//         {
//           $set: { "ratings.$.star": star, "ratings.$.comment": comment },
//         },
//         {
//           new: true,
//         }
//       );
//       // res.json(updateRating);
//     } else {
//       const rateProduct = await Product.findByIdAndUpdate(
//         prodId,
//         {
//           $push: {
//             ratings: {
//               star: star,
//               comment: comment,
//               postedby: _id,
//             },
//           },
//         },
//         {
//           new: true,
//         }
//       );
//       // res.json(rateProduct);
//     }
//     const getallratings = await Product.findById(prodId);
//     let totalRating = getallratings.ratings.length;
//     let ratingsum = getallratings.ratings
//       .map((item) => item.star)
//       .reduce((prev, curr) => prev + curr, 0);
//     let actualRating = Math.round(ratingsum / totalRating);
//     let finalproduct = await Product.findByIdAndUpdate(
//       prodId,
//       {
//         totalrating: actualRating,
//       },
//       {
//         new: true,
//       }
//     );
//     res.json(finalproduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

module.exports = {
  getAllStores,
  getaStores,
  getaStoreByUser
//   updateProduct,
//   deleteProduct,
//   rating,
};
