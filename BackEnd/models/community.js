const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nevezd el a közösségi programot"],
  },
  description: {
    type: String,
    required: [true, "Add meg a program leírását"],
  },
  category: {
    type: String,
    required: [true, "Válassz egy kategóriát"],
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
      communityId: {
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
  admin: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Community", communitySchema);
