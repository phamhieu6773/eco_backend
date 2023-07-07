const mongoose = require("mongoose");
const validateMondoDbId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    throw new Error("This id is not valid or not found");
  }
};

module.exports = validateMondoDbId;
