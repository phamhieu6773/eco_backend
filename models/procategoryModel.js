const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var procategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // details: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("PCategory", procategorySchema);
