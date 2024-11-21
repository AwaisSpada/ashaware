const mongoose = require("mongoose");
const DistrictSchema = mongoose.Schema({
  districtName: {
    type: String,
  },
  districtAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  schools: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "School",
    default: [],
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  address: {
    type: Object,
    // required: true,
  },
});
module.exports = mongoose.model("District", DistrictSchema);
