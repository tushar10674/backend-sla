const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guestContact: {
      type: String,
      default: "",
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "GoldProduct",
          required: false,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        priceAtTimeOfAdding: {
          type: Number,
          required: true,
          default: 0,
        },
        productSnapshot: {
          name: String,
          description: String,
          category: String,
          image: String,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      fullName: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phone: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "Created",
        "ORDER PLACED",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Deleted",
      ],
      default: "ORDER PLACED",
    },
    // Cashfree payment gateway fields
    cashfree: {
      orderId: { type: String },
      cfOrderId: { type: String },
      paymentSessionId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
      orderDetails: { type: Object },
      paymentDetails: { type: Object },
      webhookData: { type: Object },
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ "cashfree.orderId": 1 });
orderSchema.index({ "cashfree.cfOrderId": 1 });

orderSchema.methods.getPaymentGatewayData = function () {
  if (this.paymentMethod === "ONLINE") {
    return this.cashfree || null;
  }
  return null;
};

orderSchema.methods.isPaid = function () {
  return this.paymentStatus === "Paid";
};

orderSchema.methods.isPaymentPending = function () {
  return this.paymentMethod === "ONLINE" && this.paymentStatus === "Pending";
};

module.exports = mongoose.model("Order", orderSchema);
