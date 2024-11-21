const mongoose = require("mongoose");
const AccountsSchema = mongoose.Schema({
  startDate: {
    type: String,
    // required:true,
  },
  renewalDate: {
    type: String,
    // required:true,
  },
  price: {
    type: String,
    // required:true,
  },
  paymentType: {
    type: String,
    enum: ["monthly", "annual"],
    default: "annual",
  },
  status: {
    type: String,
    enum: ["created", "pending", "blocked"],
    default: "created",
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    default: null,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    default: null,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Account", AccountsSchema);
