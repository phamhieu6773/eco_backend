const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  console.log(req?.headers?.authorization?.startsWith("Bearer"));
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      res.status(401).json({
        message:
          "Mã thông báo không được ủy quyền đã hết hạn, vui lòng đăng nhập lại",
      });
      throw new Error(
        "Mã thông báo không được ủy quyền đã hết hạn, vui lòng đăng nhập lại"
      );
    }
  } else {
    throw new Error("Không có mã thông báo nào được đính kèm với tiêu đề");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  console.log(email);
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin" && adminUser.role !== "systemadmin") {
    throw new Error("You are not an Admin");
  } else {
    next();
  }
});

const isSystemAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  console.log(email);
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "systemadmin") {
    throw new Error("You are not an System Admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin, isSystemAdmin };
