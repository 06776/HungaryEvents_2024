const mongoose = require("mongoose");

const sightSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Add meg a látványosság nevét"],
  },
  description: {
    type: String,
    required: [true, "Add meg a látványosság leírását"],
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
  adminId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Sight", sightSchema);
