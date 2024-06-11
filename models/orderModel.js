  const mongoose = require("mongoose"); // Erase if already required

  // Declare the Schema of the Mongo model
  var orderSchema = new mongoose.Schema(
    {
      // products: [
      //   {
      //     product: {
      //       type: mongoose.Schema.Types.ObjectId,
      //       ref: "Product",
      //     },
      //     count: Number,
      //     color: String,
      //   },
      // ],
      // paymentIntent: {},
      // orderStatus: {
      //   type: String,
      //   default: "Chưa xử lý",
      //   enum: [
      //     "Chưa xử lý",
      //     "Thanh toán khi giao hàng",
      //     "Thanh toán online",
      //     "Đã xử lý",
      //     "Hủy",
      //     "Đã giao",
      //   ],
      // },
      // orderby: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "User",
      // },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
      },
      shippingInfo: {
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        // other: {
        //   type: String,
        //   required: true,
        // },
        // pincode: {
        //   type: Number,
        //   required: true,
        // },
      },
      paymeantInfo: {
        razorpayOrderId: {
          type: String,
          // required: true,
        },
        rezorpayPaymentId: {
          type: String,
          // required: true,
        },
      },
      orderItems: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          // color: {
          //   type: mongoose.Schema.Types.ObjectId,
          //   ref: "Color",
          //   required: true,
          // },
          quantity: {
            type: Number,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
          classify: mongoose.Schema.Types.Mixed,
        },
      ],
      paidAt: {
        type: Date,
        default: Date.now(),
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      totalPriceAfterDiscount: {
        type: Number,
        required: true,
      },
      voucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voucher",
      },
      orderStatus: {
        type: String,
        default: "Chưa xử lý",
        enum: [
          "Chưa xử lý",
          "Đã xác nhận",
          "Đang vận chuyển",
          "Giao hàng thành công",
          "Đã Hủy",
        ],
      },
    },
    {
      timestamps: true,
    }
  );

  // orderSchema.path('orderItems.product').ref("Product")

  //Export the model
  module.exports = mongoose.model("Order", orderSchema);
