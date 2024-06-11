const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Store = require("../models/storeModel");
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
const { response, query } = require("express");
const mongoose = require("mongoose");

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
    await res.cookie("refreshTokenUser", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Thông tin không hợp lệ");
  }
});

// Login Admin

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("email", email);
  // kiểm tra xem user có tồn tại hay không
  const findAdmin = await User.findOne({ email: email });
  if (findAdmin.role !== "admin" && findAdmin.role !== "systemadmin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    await res.cookie("refreshTokenAdmin", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      role: findAdmin?.role,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Thông tin không hợp lệ");
  }
});

//  Register as a store
const registerStore = asyncHandler(async (req, res) => {
  // console.log(req.user);
  try {
    // Kiểm tra xem người dùng đã đăng ký cửa hàng trước đó chưa
    const findAdmin = await User.findOne({ _id: req.user._id });
    const existingStore = await Store.findOne({ owner: req.user._id });
    if (existingStore && findAdmin?.role !== "admin") {
      return res.status(400).json({ message: "Người dùng đã đăng ký cửa hàng trước đó" });
    }
    req.body.owner = req.user._id;

    // Tạo một cửa hàng mới dựa trên dữ liệu từ yêu cầu
    const newStore = await Store.create(req.body);

    // // Trả về thông tin của cửa hàng mới được tạo
    res.status(200).json(newStore);
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi đăng ký cửa hàng" });
  }
});


// const approveStoreRegistration = asyncHandler(async (req, res) => {
//   try {
//     const { userId } = req.params; // Lấy userId từ params

//     // Tìm người dùng dựa trên userId
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "Không tìm thấy người dùng" });
//     }

//     // Kiểm tra xem người dùng đã có role là admin hay chưa
//     if (user.role === 'admin') {
//       return res.status(400).json({ message: "Người dùng đã là admin" });
//     }

//     // Cập nhật vai trò của người dùng thành admin
//     user.role = 'admin';
//     await user.save();

//     res.json({ message: "Đã duyệt và cập nhật vai trò của người dùng thành công" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Đã xảy ra lỗi khi duyệt và cập nhật vai trò của người dùng" });
//   }
// });

const approveStoreRegistration = asyncHandler(async (req, res) => {
  const {status, owner} = req.body;
  const {id} = req.params;
  try {
    const updateOrderStatus = await Store.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      {
        new: true,
      }
    );

    if (status === "Chờ xử lý") {
      const user = await User.findById(owner);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }
      
      // Cập nhật vai trò của người dùng thành admin
      user.role = 'user';
      await user.save();

    }else {
      const user = await User.findById(owner);

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      // Kiểm tra xem người dùng đã có role là admin hay chưa
      if (user.role === 'admin') {
        return res.status(400).json({ message: "Người dùng đã là admin" });
      }

      // Cập nhật vai trò của người dùng thành admin
      if (user.role == "user") {
        user.role = 'admin';
        await user.save();
      }

    }

    res.json(updateOrderStatus);

  } catch (error) {
    console.error(error);
    // res.status(500).json({ message: "Đã xảy ra lỗi khi duyệt và cập nhật vai trò của người dùng" });
  }
});

const updateStore = asyncHandler(async (req, res) => {
  try {
    // Kiểm tra xem người dùng có quyền update cửa hàng không
    const findAdmin = await User.findOne({ _id: req.user._id });
    const existingStore = await Store.findOne({ owner: req.user._id });

    // Kiểm tra quyền của người dùng và xem cửa hàng đã tồn tại chưa
    if (!existingStore) {
      return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
    }
    if (existingStore.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền cập nhật cửa hàng" });
    }

    // Update cửa hàng với dữ liệu mới từ yêu cầu
    await Store.findOneAndUpdate({ owner: req.user._id }, req.body, { new: true });

    // Trả về thông tin của cửa hàng sau khi được cập nhật
    res.status(200).json({ message: "Cập nhật cửa hàng thành công" });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật cửa hàng" });
  }
});


// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  const email = req.body.email;
  const refreshToken = req.body.refreshToken;
  console.log("cookie", cookies);

  // if (!cookie.refreshToken) {
  //   throw new Error("No Refresh Token in Cookies");
  // }
  // const refreshTokenAdmin = cookie.refreshTokenAdmin;
  // const user = await User.findOne({ refreshToken: refreshTokenAdmin });
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

const handleRefreshTokenUser = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  console.log("cookie", cookies.refreshTokenUser);

  if (!cookies.refreshTokenUser) {
    throw new Error("No Refresh Token in Cookies");
  }
  const refreshTokenUser = cookies.refreshTokenUser;
  const user = await User.findOne({ refreshToken: refreshTokenUser });
  if (!user) {
    throw new Error("No Refresh Token present in db or not matched");
  }
  jwt.verify(refreshTokenUser, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized access.", err });
      // throw new Error("There is something wrong with refresh token");
    }
    err && console.log(err);
    const accessToken = generateToken(user?._id);
    res.json({ accessToken: accessToken, user: user });
  });
});

const handleRefreshTokenAdmin = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  console.log("cookie", cookies.refreshTokenAdmin);

  if (!cookies.refreshTokenAdmin) {
    throw new Error("No Refresh Token in Cookies");
  }
  const refreshTokenAdmin = cookies.refreshTokenAdmin;
  const user = await User.findOne({ refreshToken: refreshTokenAdmin });
  if (!user) {
    throw new Error("No Refresh Token present in db or not matched");
  }
  jwt.verify(refreshTokenAdmin, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized access.", err });
      // throw new Error("There is something wrong with refresh token");
    }
    err && console.log(err);
    const accessToken = generateToken(user?._id);
    res.json({ accessToken: accessToken, user: user });
  });
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
        avatar: req?.body?.avatar
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

const getUser = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateMondoDbId(_id);
    console.log("_id", _id);
    const getUser = await User.findOne({_id: _id}).populate("wishlist");
    res.json(getUser);
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
    res.json(findUser.wishlist);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  // let { cart } = req.body;
  const { productId, quantity, price, classify, storeId } = req.body;
  const { _id } = req.user;
  validateMondoDbId(_id);
  try {
    // let products = [];
    // const user = await User.findById(_id);
    // const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    // if (alreadyExistCart) {
    //   const productCart = alreadyExistCart.products;
    //   alreadyExistCart.deleteOne();
    //   for (let i = 0; i < productCart.length; i++) {
    //     let object = {};
    //     object._id = productCart[i].product.toString();
    //     object.count = productCart[i].count;
    //     object.color = productCart[i].color;
    //     cart.push(object);
    //   }
    // }
    // const result = [];
    // const map = {};
    // for (let i = 0; i < cart.length; i++) {
    //   const obj = cart[i];
    //   const key = obj._id + obj.color;
    //   if (map[key]) {
    //     map[key].count += obj.count;
    //   } else {
    //     map[key] = { ...obj };
    //   }
    // }
    // for (const key in map) {
    //   result.push(map[key]);
    //   cart = result;
    // }
    // for (let i = 0; i < cart.length; i++) {
    //   let object = {};
    //   object.product = cart[i]._id;
    //   object.count = cart[i].count;
    //   object.color = cart[i].color;
    //   let getPrice = await Product.findById(cart[i]._id).select("price").exec();
    //   object.price = getPrice.price;
    //   products.push(object);
    // }
    // let cartTotal = 0;
    // for (let i = 0; i < products.length; i++) {
    //   cartTotal = cartTotal + products[i].price * products[i].count;
    // }
    // let newCart = await new Cart({
    //   products,
    //   cartTotal,
    //   orderby: user?._id,
    // }).save();
    const alreadyExistCarts = await Cart.find({ userId: _id });
    var alreadyExistCart = {};
    for (const itemCart of alreadyExistCarts) {
      if (
        itemCart?.productId.toString() === productId
        &&
        JSON.stringify(itemCart?.classify) === JSON.stringify(classify)
      ) {
        alreadyExistCart = itemCart;
      }
      if (itemCart?.productId.toString() === productId && !itemCart?.classify) {
        alreadyExistCart = itemCart;
      }
    }

    if (
      alreadyExistCart?._id 
    ) {
      let updateQuantity = 0;
      updateQuantity =
        parseInt(alreadyExistCart?.quantity) + parseInt(quantity);

      const updateCart = await Cart.findByIdAndUpdate(
        alreadyExistCart._id,
        { quantity: updateQuantity },
        {
          new: true,
        }
      );
      res.json(updateCart);
    } else {
      let newCart = await new Cart({
        userId: _id,
        productId,
        storeId,
        price,
        quantity,
        classify
      }).save();
      res.json(newCart);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMondoDbId(_id);
  try {
    const cart = await Cart.find({ userId: _id })
      .populate("productId")
      .populate("storeId")
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

// const updateUserCart = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   validateMondoDbId(_id);
//   const { cartItemId } = req.params;
// });
const updateUserCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updateUserCart = await Cart.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateUserCart);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId } = req.params;
  console.log("cartItemId", cartItemId);
  validateMondoDbId(_id);
  try {
    const deleteProductFromCart = await Cart.deleteOne({
      userId: _id,
      _id: cartItemId,
    });
    res.json(deleteProductFromCart);
  } catch (error) {
    throw new Error(error);
  }
});

// const createOrder = asyncHandler(async (req, res) => {
//   const {
//     shippingInfo,
//     orderItems,
//     totalPrice,
//     totalPriceAfterDiscount,
//     paymentInfo,
//   } = req.body;
//   console.log(orderItems);
//   const { _id } = req.user;
//   try {
//     const order = await Order.create({
//       user: _id,
//       shippingInfo,
//       orderItems,
//       totalPrice,
//       totalPriceAfterDiscount,
//       paymentInfo,
//     });
//     res.json({ order, success: true });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    totalPrice,
    totalPriceAfterDiscount,
    paymentInfo,
    cartState,
    store,
    voucher
  } = req.body;


  const { _id } = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Lặp qua từng sản phẩm trong đơn hàng
    for (const orderItem of orderItems) {
      const { product, quantity, price, classify} = orderItem;

      // Giảm số lượng sản phẩm trong kho
      const productInDB = await Product.findById(product);

      if (!productInDB) {
        throw new Error(`Không tìm thấy sản phẩm với ID: ${product}`);
      }

      if (productInDB.quantity < quantity) {
        // Nếu số lượng đặt hàng vượt quá số lượng có sẵn trong kho
        throw new Error(
          `Sản phẩm ${productInDB.title} không đủ số lượng trong kho.`
        );
      }
      if (classify) {
        productInDB.variations.forEach(item => {
          let match = true;
          for (const key in classify) {
            if (classify.hasOwnProperty(key)) {
              if (item.get(key) !== classify[key]) {
                match = false;
                break;
              }
            }
          }
          if (item.get('quantity') < quantity) {
            throw new Error(
              `Sản phẩm ${productInDB.title} không đủ số lượng trong kho.`
            );
          }
          if (match) {
            const count = item.get('quantity') - quantity;
            item.set('quantity', count);
          }
        });
      }
      productInDB.quantity -= quantity;
      productInDB.sold += quantity;
      await Product.findByIdAndUpdate(product, {
        $set: {
          ...productInDB
        }
      })
    }

    // Tạo đơn hàng
    const order = await Order.create({
      user: _id,
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
      paymentInfo,
      store: store,
      voucher: voucher,
    });

    async function deleteCarts() {
      for (const cart of cartState) {
          try {
              const doc = await Cart.findByIdAndDelete(cart?._id);
              if (doc) {
                  console.log('Tài liệu đã được xóa:', doc);
                  // Xử lý sau khi xóa thành công
              } else {
                  console.log('Không tìm thấy tài liệu với id đã cho.');
                  // Xử lý khi không tìm thấy tài liệu với id đã cho
              }
          } catch (err) {
              console.error('Lỗi khi xóa tài liệu:', err);
              // Xử lý lỗi
          }
      }
  }
  
  deleteCarts();

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ order, success: true });
  } catch (error) {
    // Rollback transaction nếu có lỗi
    await session.abortTransaction();
    session.endSession();
    console.log(error);

    res.status(500).json({ error: error.message, success: false });
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const emptyCart = await Cart.deleteMany({ userId: _id });
    res.json(emptyCart);
  } catch (error) {
    throw new Error(error);
  }
});

// const applyVoucher = asyncHandler(async (req, res) => {
//   const { voucher } = req.body;
//   const { _id } = req.user;
//   validateMondoDbId(_id);
//   const validateVoucher = await Voucher.findOne({ name: voucher });
//   if (validateVoucher == null) {
//     throw new Error("Không tìm thấy Voucher");
//   }
//   const user = await User.findOne({ _id });
//   let { cartTotal } = await Cart.findOne({ orderby: user._id }).populate(
//     "products.product"
//   );
//   let totalAfterDiscount = (
//     cartTotal -
//     (cartTotal * validateVoucher.discount) / 100
//   ).toFixed(2);
//   await Cart.findOneAndUpdate(
//     { orderby: user._id },
//     { totalAfterDiscount },
//     { new: true }
//   );
//   res.json(totalAfterDiscount);
// });

// const createOrder = asyncHandler(async (req, res) => {
//   const { COD, couponApplied } = req.body;
//   const { _id } = req.user;
//   validateMondoDbId(_id);
//   console.log(couponApplied);
//   try {
//     if (!COD) throw new Error("Create Cash Order Failed");
//     const user = await User.findById(_id);
//     let userCart = await Cart.findOne({ userId: user._id });
//     let finalAmout = 0;
//     if (couponApplied && userCart.totalAfterDiscount) {
//       finalAmout = userCart.totalAfterDiscount;
//     } else {
//       finalAmout = userCart.cartTotal;
//     }

//     let newOrder = await new Order({
//       products: userCart.products,
//       paymentIntent: {
//         id: uniqid(),
//         method: "COD",
//         amout: finalAmout,
//         status: "Thanh toán khi giao hàng",
//         created: Date.now(),
//         currency: "VND",
//       },
//       orderby: user._id,
//       orderStatus: "Thanh toán khi giao hàng",
//     }).save();
//     let update = userCart.products.map((item) => {
//       return {
//         updateOne: {
//           filter: { _id: item.product._id },
//           update: { $inc: { quantity: -item.count, sold: +item.count } },
//         },
//       };
//     });
//     const updated = await Product.bulkWrite(update, {});
//     res.json({ message: "success", updated: updated });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getOrderByUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMondoDbId(_id);
  try {
    let query = {};
    const status = req.query.orderStatus
    if(status === -1 || status === undefined || status === "Tất cả") {
      query = { user: _id }
    } else {
      query.user = _id;
      query.orderStatus = status;
    }
    const getOrders = await Order.find(query)
    .populate({
      path: "user",
      select: "firstname lastname email mobile"
    })
    .populate("orderItems.product")
    .populate("store");
    res.json(getOrders);
  } catch (error) {
    throw new Error(error);
  }
});

// const getaProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   try {
//     const getProduct = await Product.findById(id).populate("color");
//     res.json({ getProduct });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getOrder = await Order.findById( id)
      .populate({
        path: "user",
        select: "firstname lastname email mobile"
      })
      .populate("orderItems.product");

    res.json(getOrder);
  } catch (error) {
    throw new Error(error);
  }
});

// const getAllOrders = asyncHandler(async (req, res) => {
//   try {
//     const store = await Store.findOne({owner: req.user._id });
//     const status = req.query.orderStatus
//     let query = {store: store?._id};
//     if(status === -1 || status === undefined || status === "Tất cả") {
//       query = {store: store?._id}
//     } else {
//       query.orderStatus = status
//     }

//     const getAllOrders = await Order.find(query)
//       .populate("orderItems.product")
//       .populate({
//         path: "user",
//         select: "firstname lastname email mobile"
//       });
//     res.json(getAllOrders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    const status = req.query.orderStatus;
    const day = req.query.day;
    const month = req.query.month;
    const year = req.query.year;

    let query = { store: store?._id };

    if (status && status !== -1 && status !== "Tất cả") {
      query.orderStatus = status;
    }

    if (year || month || day) {
      let startDate = new Date(0); // Epoch start time
      let endDate = new Date(); // Current time

      if (year) {
        startDate = new Date(year, 0, 1); // January 1st of the year
        endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st of the year
      }
      if (month) {
        startDate = new Date(year, month - 1, 1); // 1st day of the month
        endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month
      }
      if (day) {
        startDate = new Date(year, month - 1, day, 0, 0, 0); // Start of the day
        endDate = new Date(year, month - 1, day, 23, 59, 59); // End of the day
      }

      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const getAllOrders = await Order.find(query)
      .populate("orderItems.product")
      .populate({
        path: "user",
        select: "firstname lastname email mobile"
      })
      .sort({ createdAt: -1 }); // Sắp xếp theo thứ tự mới nhất đến cũ nhất

    res.json(getAllOrders);
  } catch (error) {
    throw new Error(error);
  }
});

const getCountAllOrders = asyncHandler(async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    const orderCount = await Order.countDocuments({ store: store?._id });
    const orderCountUnhandled = await Order.countDocuments({ store: store?._id, orderStatus: "Chưa xử lý" });
    res.json({orderCount : orderCount, orderCountUnhandled: orderCountUnhandled});
  } catch (error) {
    
  }
})



const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMondoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
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

// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const { id } = req.params;
//   validateMondoDbId(id);
//   try {
//     const updateOrderStatus = await Order.findByIdAndUpdate(
//       id,
//       {
//         paymentIntent: {
//           status: status,
//         },
//         orderStatus: status,
//       },
//       {
//         new: true,
//       }
//     );
//     res.json(updateOrderStatus);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUsers,
  getaUser,
  getUser,
  deleteaUser,
  updateaUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  handleRefreshTokenAdmin,
  handleRefreshTokenUser,
  logout,
  updatedPassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  updateUserCart,
  deleteProductFromCart,
  emptyCart,
  // applyVoucher,
  createOrder,
  // getOrders,
  getOrderByUser,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  registerStore,
  updateStore,
  approveStoreRegistration,
  getCountAllOrders
};
