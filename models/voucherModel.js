const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var voucherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expiry: {
    type: Date,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  }
});

//Export the model
module.exports = mongoose.model("Voucher", voucherSchema);
