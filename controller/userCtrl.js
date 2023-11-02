const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Voucher = require("../models/voucherModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const validateMondoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");
const uniqid = require("uniqid");
const { response } = require("express");

// Create A User
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    // Tạo một User mới
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    // Người dùng đã tồn tại
    throw new Error("Người dùng đã tồn tại");
  }
});

// Login A User
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // kiểm tra xem user có tồn tại hay không
  const findUser = await User.findOne({ email: email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 72 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
      refreshToken: refreshToken,
    });
  } else {
    throw new Error("Thông tin không hợp lệ");
  }
});

// Login Admin

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // kiểm tra xem user có tồn tại hay không
  const findAdmin = await User.findOne({ email: email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 72 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
      refreshToken: refreshToken,
    });
  } else {
    throw new Error("Thông tin không hợp lệ");
  }
});

// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  // const cookie = req.cookies;
  const email = req.body.email;
  const refreshToken = req.body.refreshToken;

  console.log(email, refreshToken);
  // if (!cookie.refreshToken) {
  //   throw new Error("No Refresh Token in Cookies");
  // }
  // const refreshToken = cookie.refreshToken;
  // const user = await User.findOne({ refreshToken: refreshToken });
  // const user = await User.findById(id);
  // const user = await User.findById(id);
  const user = await User.findOne({ email: email });
  console.log("user", user);
  if (!user) {
    throw new Error("No Refresh Token present in db or not matched");
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    // if (err || user.id !== decoded.id) {
    //   throw new Error("There is something wrong with refresh token");
    // }
    err && console.log(err);
    const accessToken = generateToken(user?._id);
    res.json({ accessToken: accessToken, user: user });
  });
  // res.json(user);
});

// Logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No Refresh Token in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});

//Update A User

const updateaUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMondoDbId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});

// save user Address

const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMondoDbId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Get ALL Users

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find().populate("wishlist");
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

//Get Single User

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const getUser = await User.findById(id).populate("wishlist");
    res.json({ getUser });
  } catch (error) {
    throw new Error(error);
  }
});

//Delete A User

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ deleteUser });
  } catch (error) {
    throw new Error(error);
  }
});

// Block User

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(block);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json(unblock);
  } catch (error) {
    throw new Error(error);
  }
});

// Changed Password

const updatedPassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMondoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found with this email");
  }
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
    const data = {
      to: email,
      subject: "Forgot Password",
      text: "Hey User",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error("Try again later");
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const getWishList = asyncHandler(async (req, res) => {
  const { id } = req.user;
  try {
    const findUser = await User.findById(id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  let { cart } = req.body;
  const { _id } = req.user;
  validateMondoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      const productCart = alreadyExistCart.products;
      alreadyExistCart.deleteOne();
      for (let i = 0; i < productCart.length; i++) {
        let object = {};
        object._id = productCart[i].product.toString();
        object.count = productCart[i].count;
        object.color = productCart[i].color;
        cart.push(object);
      }
    }
    const result = [];
    const map = {};
    for (let i = 0; i < cart.length; i++) {
      const obj = cart[i];
      const key = obj._id + obj.color;
      if (map[key]) {
        map[key].count += obj.count;
      } else {
        map[key] = { ...obj };
      }
    }
    for (const key in map) {
      result.push(map[key]);
      cart = result;
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMondoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const emptyCart = await Cart.findOneAndDelete({ orderby: _id });
    res.json(emptyCart);
  } catch (error) {
    throw new Error(error);
  }
});

const applyVoucher = asyncHandler(async (req, res) => {
  const { voucher } = req.body;
  const { _id } = req.user;
  validateMondoDbId(_id);
  const validateVoucher = await Voucher.findOne({ name: voucher });
  if (validateVoucher == null) {
    throw new Error("Không tìm thấy Voucher");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({ orderby: user._id }).populate(
    "products.product"
  );
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validateVoucher.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMondoDbId(_id);
  console.log(couponApplied);
  try {
    if (!COD) throw new Error("Create Cash Order Failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmout = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmout = userCart.totalAfterDiscount;
    } else {
      finalAmout = userCart.cartTotal;
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amout: finalAmout,
        status: "Thanh toán khi giao hàng",
        created: Date.now(),
        currency: "VND",
      },
      orderby: user._id,
      orderStatus: "Thanh toán khi giao hàng",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "success", updated: updated });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMondoDbId(_id);
  try {
    const getOrders = await Order.find({ orderby: _id })
      .populate("orderby")
      .populate("products.product");
    res.json(getOrders);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const getAllOrders = await Order.find()
      .populate("products.product")
      .populate("orderby");
    res.json(getAllOrders);
  } catch (error) {
    throw new Error(error);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        paymentIntent: {
          status: status,
        },
        orderStatus: status,
      },
      {
        new: true,
      }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUsers,
  getaUser,
  deleteaUser,
  updateaUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatedPassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyVoucher,
  createOrder,
  getOrders,
  getAllOrders,
  updateOrderStatus,
};
