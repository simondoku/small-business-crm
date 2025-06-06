// backend/models/Customer.js
const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    totalPurchases: {
      type: Number,
      required: true,
      default: 0,
    },
    lastPurchaseDate: {
      type: Date,
      required: false,
    },
    // Business isolation: track which business owns this customer
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Customer', customerSchema);