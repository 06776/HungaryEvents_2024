const mongoose = require("mongoose");

const communityProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Add meg az esemény nevét"],
  },
  description: {
    type: String,
    required: [true, "Add meg az esemény leírását"],
  },
  category: {
    type: String,
    required: [true, "Válaszd ki a kategóriát"],
  },
  tags: {
    type: String,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  reviews: [
    {
      user: {
        type: Object,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      communityProgramId: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  ratings: {
    type: Number,
  },
  adminId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("CommunityProgram", communityProgramSchema);
