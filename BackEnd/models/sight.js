const mongoose = require("mongoose");

const sightSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nevezd el a látványosságot"],
  },
  description: {
    type: String,
    required: [true, "Add meg a látványosság leírását"],
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
      sightId: {
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

module.exports = mongoose.model("Sight", sightSchema);
