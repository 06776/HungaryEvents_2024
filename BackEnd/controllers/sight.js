const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Admin = require("../models/admin");
const Sight = require("../models/sight");
const ErrorHandler = require("../utils/ErrorHandler");
const { isOwner, isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const cloudinary = require("cloudinary");

router.post(
  "/create-sight",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const adminId = req.body.adminId;
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      } else {
        let images = [];

        if (typeof req.body.images === "string") {
          images.push(req.body.images);
        } else {
          images = req.body.images;
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "sights",
          });

          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }

        const sightData = req.body;
        sightData.images = imagesLinks;
        sightData.admin = admin;

        const sight = await Sight.create(sightData);

        res.status(201).json({
          success: true,
          sight,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get("/get-all-sights", async (req, res, next) => {
  try {
    const sights = await Sight.find();
    res.status(201).json({
      success: true,
      sights,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

router.get(
  "/get-all-sights/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sights = await Sight.find({ adminId: req.params.id });

      res.status(201).json({
        success: true,
        sights,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.delete(
  "/delete-sight/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sight = await Sight.findById(req.params.id);

      if (!sight) {
        return next(new ErrorHandler("Product is not found with this id", 404));
      }

      for (let i = 0; 1 < sight.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(
          sight.images[i].public_id
        );
      }

      await sight.remove();

      res.status(201).json({
        success: true,
        message: "Event Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/admin-all-sights",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sights = await Sight.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sights,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
