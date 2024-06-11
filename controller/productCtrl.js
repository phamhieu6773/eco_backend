const Product = require("../models/productModel");
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
const NamePro = require("../models/nameProductModel");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    if (req.body.classify?.length > 0) {
      let totalQuantity = 0; // Khởi tạo tổng là số nguyên

      req.body.variations?.forEach((element) => {
        totalQuantity += parseFloat(element.quantity); // Ép kiểu element.quantity thành float và cộng vào tổng
      });

      req.body.quantity = totalQuantity; // Gán tổng trở lại req.body.quantity
      req.body.price = null;
    }

    if (req.user._id) {
      req.body.user_id = req.user._id;
    }
    const store = await Store.findOne({ owner: req.user._id });
    console.log(store);

    if (store) {
      req.body.store_id = store._id;
    }

    const newName = req.body.title;

    let namePro = await NamePro.findOne();

    if (!namePro) {
      namePro = new NamePro({ names: [newName] });
    } else {
      if (namePro.names.includes(newName)) {
        return res.status(400).json({ error: "Name already exists" });
      }
      namePro.names.push(newName);
    }

    await namePro.save();
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr)).populate("color");

    // Sắp xếp
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("This Page does not exists");
      }
    }
    console.log(page, limit, skip);

    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

const searchProduct = asyncHandler(async (req, res) => {
  const paramName = req.query.product_name;
  try {
    // Xây dựng truy vấn tìm kiếm theo tiêu đề sản phẩm
    let query = {};
    if (paramName) {
      query.title = { $regex: paramName, $options: "i" }; // 'i' để tìm kiếm không phân biệt chữ hoa chữ thường
    }

    // Thực hiện truy vấn và giới hạn số lượng sản phẩm trả về là 5
    const products = await Product.find(query).limit(5);

    // Trả về kết quả tìm kiếm
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllProductsByStore = asyncHandler(async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    console.log(store);
    const queryObj = { ...req.query, store_id: store?._id };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr)).populate("color");

    // Sắp xếp
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("This Page does not exists");
      }
    }
    console.log(page, limit, skip);

    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProductsByStoreUser = asyncHandler(async (req, res) => {
  const { store_id } = req.query;
  try {
    // const store = await Store.findOne({owner: req.user._id });
    // console.log(store);
    const queryObj = { ...req.query, store_id: store_id };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr)).populate("color");

    // Sắp xếp
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("This Page does not exists");
      }
    }
    console.log(page, limit, skip);

    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

const getCountProducts = asyncHandler(async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    const queryObj = { ...req.query, store_id: store?._id };
    const productCount = await Product.countDocuments(queryObj);
    res.json(productCount);
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const getProduct = await Product.findById(id)
      .populate("store_id")
      .populate("ratings.postedby");
    res.json({ getProduct });
  } catch (error) {
    throw new Error(error);
  }
});

// const getaProductRasa = asyncHandler(async (req, res) => {
//   const productName = req.query.product_name;
//   try {
//     const getProduct = await Product.findById(productId).populate("color");
//     res.json({ getProduct });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const findSimilarNames = (names, query) => {
//   const regex = new RegExp(query, 'i');
//   return names.filter(name => regex.test(name));
// };

// const getaProductRasa = asyncHandler(async (req, res) => {
//   const paramName = req.query.product_name;
//   console.log(paramName);
//   const productName = "Nitro";
//   const nameProDoc = await NamePro.findOne();
//     if (!nameProDoc || !nameProDoc.names || nameProDoc.names.length === 0) {
//       return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
//     }
//   const similarNames = findSimilarNames(nameProDoc.names, paramName);
//     if (similarNames.length === 0) {
//       return res.status(404).json({ message: "Không tìm thấy sản phẩm tương tự" });
//     }
//   try {
//     // Tìm sản phẩm với tiêu đề giống với tên sản phẩm truyền vào
//     const getProduct = await Product.findOne({ title: { $regex: new RegExp(similarNames[0], 'i') } });
//     if (!getProduct) {
//       return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
//     }
//     res.json({ getProduct });
//   } catch (error) {
//     // Nếu có lỗi, ném ra lỗi 500 (Lỗi server nội bộ)
//     res.status(500).json({ message: "Đã xảy ra lỗi khi tìm kiếm sản phẩm" });
//   }
// });

// Helper function to find similar names
const findSimilarNames = (names, query) => {
  const regex = new RegExp(query, "i");
  return names.filter((name) => regex.test(name));
};

// Function to extract potential product names from a long text
const extractProductNames = (text) => {
  // Split the text into words and combinations of words
  const words = text.split(/\s+/);
  const potentialNames = [];

  // Generate all possible combinations of words up to a certain length (e.g., 3 words)
  const maxCombinationLength = 3;
  for (let i = 0; i < words.length; i++) {
    for (let j = i; j < Math.min(i + maxCombinationLength, words.length); j++) {
      potentialNames.push(words.slice(i, j + 1).join(" "));
    }
  }

  return potentialNames;
};

const getaProductRasa = asyncHandler(async (req, res) => {
  const paramName = req.query.product_name;
  try {
    // Tìm NamePro document đầu tiên (giả sử chỉ có một)
    const nameProDoc = await NamePro.findOne();
    if (!nameProDoc || !nameProDoc.names || nameProDoc.names.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Extract potential product names from paramName
    const potentialProductNames = extractProductNames(paramName);

    // Find similar names in the NamePro document
    let similarNames = [];
    for (const potentialName of potentialProductNames) {
      similarNames = findSimilarNames(nameProDoc.names, potentialName);
      if (similarNames.length > 0) break;
    }

    if (similarNames.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm tương tự" });
    }

    // Tìm sản phẩm với tiêu đề giống với tên sản phẩm gần giống tìm được
    const getProduct = await Product.findOne({
      title: { $regex: new RegExp(similarNames[0], "i") },
    });
    if (!getProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(getProduct);
  } catch (error) {
    // Nếu có lỗi, ném ra lỗi 500 (Lỗi server nội bộ)
    res
      .status(500)
      .json({
        message: "Đã xảy ra lỗi khi tìm kiếm sản phẩm",
        details: error.message,
      });
  }
});

// const getaProduct = asyncHandler(async (req, res) => {
//   const { _id } = req.query; // Thay đổi từ req.params sang req.query
//   console.log(req.query);
//   try {
//     const product = await Product.findById(_id);
//     res.json({ product }); // Thay đổi tên biến từ getProduct thành product
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: prodId } },
        { new: true }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        { $push: { wishlist: prodId } },
        { new: true }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, prodId } = req.body;
  try {
    const product = await Product.findById(prodId);
    console.log(product.ratings);
    let alreadyrated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyrated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyrated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
      // res.json(updateRating);
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
      // res.json(rateProduct);
    }
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      {
        new: true,
      }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getAllProducts,
  getaProduct,
  getaProductRasa,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  getAllProductsByStore,
  getAllProductsByStoreUser,
  searchProduct,
  getCountProducts,
};
