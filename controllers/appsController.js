import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Apps } from "../models/appsSchema.js";
import { v2 as cloudinary } from "cloudinary";

// add timeline
export const addApplication = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Software image is required!", 400));
  }

  const { svg } = req.files;
  const { name } = req.body;

  if (!name) {
    return next(new ErrorHandler("Name is required!", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    svg.tempFilePath,
    { folder: "PORTFOLIO SOFTWARES APPLICATIONS" }
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error",
      cloudinaryResponse.error || "Unknown cloudinary error"
    );
  }

  const softwareApps = await Apps.create({
    name,
    svg: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(201).json({
    success: true,
    message: "Software application added!",
    softwareApplication: softwareApps,
  });
});

// delete timeline
export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const softwareApplication = await Apps.findByIdAndDelete(req.params.id);
  if (!softwareApplication) {
    return next(new ErrorHandler("Software application not found", 404));
  }
  cloudinary.uploader.destroy(softwareApplication.svg.public_id);

  res.status(200).json({
    success: true,
    message: "Software application deleted!",
  });
});

// get timeline
export const getAllApplications = catchAsyncErrors(async (req, res, next) => {
  const softwareApplications = await Apps.find();

  res.status(200).json({
    success: true,
    softwareApplications,
  });
});
