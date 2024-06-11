const mongoose = require("mongoose");
var storeSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      unique: true,
    },
    // storeDescription: {
    //   type: String,
    //   required: true,
    // },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    taxCode: {
      type: String,
      unique: true,
    },
    images: {
      // public_id: String,
      type: String,
    },
    status: {
      type: String,
      default: "Chờ xử lý",
      enum: ["Chờ xử lý", "Đã phê duyệt"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
        comment: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Store", storeSchema);
