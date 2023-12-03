const express = require("express");
const path = require("path");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const Admin = require("../models/admin");
const { isAuthenticated, isOwner, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendAdminToken = require("../utils/adminToken");

router.post(
  "/create-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;
      const ownerEmail = await Admin.findOne({ email });
      if (ownerEmail) {
        return next(new ErrorHandler("Az admin már létezik", 400));
      }

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
      });

      const owner = {
        name: req.body.name,
        email: email,
        password: req.body.password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      };

      const activationToken = createActivationToken(owner);

      const activationUrl = `https://localhost:3000/owner/activation/${activationToken}`;

      try {
        await sendMail({
          email: owner.email,
          subject: "Aktiváld a regisztrációdat",
          message: `${owner.name}!
          Kérlek, aktiváld a regisztrációdat az alábbi linkre kattintva: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `Ellenőrizd az e-mailjeidet fiókod aktiválásához`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

const createActivationToken = (owner) => {
  return jwt.sign(owner, process.env.ACTIVATION_SECRET, {
    expiresIn: "10m",
  });
};

router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newOwner = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newOwner) {
        return next(new ErrorHandler("A link már lejárt", 400));
      }
      const { name, email, password, avatar } =
        newOwner;

      let owner = await Admin.findOne({ email });

      if (owner) {
        return next(new ErrorHandler("Az admin már létezik", 400));
      }

      owner = await Admin.create({
        name,
        email,
        avatar,
        password,
      });

      sendAdminToken(owner, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.post(
  "/login-admin",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await Admin.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      sendAdminToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/get-owner",
  isOwner,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const owner = await Admin.findById(req.owner._id);

      if (!owner) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        owner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("owner_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/get-admin-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.params.id);
      res.status(201).json({
        success: true,
        admin,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/update-admin-avatar",
  isOwner,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let existsOwner = await Admin.findById(req.owner._id);

      const imageId = existsOwner.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
      });

      existsOwner.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      await existsOwner.save();

      res.status(200).json({
        success: true,
        owner: existsOwner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/update-owner-info",
  isOwner,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description } = req.body;

      const admin = await Admin.findOne(req.owner._id);

      if (!admin) {
        return next(new ErrorHandler("User not found", 400));
      }

      admin.name = name;
      admin.description = description;

      await admin.save();

      res.status(201).json({
        success: true,
        admin,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/admin-all-owners",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const owners = await Admin.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        owners,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.delete(
  "/delete-owner/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const owner = await Admin.findById(req.params.id);

      if (!owner) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      await Admin.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
