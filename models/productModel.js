const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      // required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    color: [{ type: mongoose.Schema.Types.ObjectId, ref: "Color" }],
    tags: {
      type: String,
      required: true,
    },
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    totalrating: {
      type: Number,
      default: 0,
    },
    specs: {
      type: Array,
      default: [],
    },
    classify: mongoose.Schema.Types.Mixed,
    variations: [
      {
        type: Map,
        of: String,
      }
    ]
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
