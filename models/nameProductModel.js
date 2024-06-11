const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var nameProductSchema = new mongoose.Schema(
  {
    names: {
      type: [String],
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
module.exports = mongoose.model("NamePro", nameProductSchema);
