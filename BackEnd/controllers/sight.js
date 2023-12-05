const express = require("express");
const { isOwner, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Sight = require("../models/sight");
const Admin = require("../models/admin");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");

router.post(
  "/create-sight",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const adminId = req.body.adminId;
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return next(new ErrorHandler("Nincs jogosultságod ehhez", 400));
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

router.get(
  "/get-all-sights-admin/:id",
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
  "/delete-admin-sight/:id",
  isOwner,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sight = await Sight.findById(req.params.id);

      if (!sight) {
        return next(new ErrorHandler("Nincs ilyen látványosság", 404));
      }

      for (let i = 0; 1 < sight.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(
          sight.images[i].public_id
        );
      }

      await sight.remove();

      res.status(201).json({
        success: true,
        message: "Látványosság sikeresen törölve",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/get-all-sights",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sights = await Sight.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        sights,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, sightId } = req.body;

      const sight = await Sight.findById(sightId);

      const review = {
        user,
        rating,
        comment,
        sightId,
      };

      const isReviewed = sight.reviews.find(
        (rev) => rev.user._id === req.user._id
      );

      if (isReviewed) {
        sight.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            (rev.rating = rating), (rev.comment = comment), (rev.user = user);
          }
        });
      } else {
        sight.reviews.push(review);
      }

      let avg = 0;

      sight.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      sight.ratings = avg / sight.reviews.length;

      await sight.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        message: "Sikeres értékelés",
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
