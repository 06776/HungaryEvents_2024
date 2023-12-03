const express = require("express");
const { isOwner, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const CommunityProgram = require("../models/communityProgram");
const Admin = require("../models/admin");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");

router.post(
  "/create-community-program",
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
            folder: "programs",
          });

          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }

        const communityProgramData = req.body;
        communityProgramData.images = imagesLinks;
        communityProgramData.admin = admin;

        const communityProgram = await CommunityProgram.create(
          communityProgramData
        );

        res.status(201).json({
          success: true,
          communityProgram,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/get-all-programs-admin/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const programs = await CommunityProgram.find({ adminId: req.params.id });

      res.status(201).json({
        success: true,
        programs,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.delete(
  "/delete-programs/:id",
  isOwner,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const program = await CommunityProgram.findById(req.params.id);

      if (!program) {
        return next(new ErrorHandler("Product is not found with this id", 404));
      }

      for (let i = 0; 1 < program.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(
          program.images[i].public_id
        );
      }

      await program.remove();

      res.status(201).json({
        success: true,
        message: "Product Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/get-all-programs",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const programs = await CommunityProgram.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        programs,
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
      const { user, rating, comment, programId } = req.body;

      const programs = await CommunityProgram.findById(programId);

      const review = {
        user,
        rating,
        comment,
        programId,
      };

      const isReviewed = programs.reviews.find(
        (rev) => rev.user._id === req.user._id
      );

      if (isReviewed) {
        programs.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            (rev.rating = rating), (rev.comment = comment), (rev.user = user);
          }
        });
      } else {
        programs.reviews.push(review);
      }

      let avg = 0;

      programs.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      programs.ratings = avg / programs.reviews.length;

      await programs.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        message: "Reviwed succesfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/admin-all-programs",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const programs = await CommunityProgram.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        programs,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
