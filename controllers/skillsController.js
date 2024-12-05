import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary";
import { Skills } from "../models/skillsSchema.js";

// add skill
export const addSkill = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Skill image is required!", 400));
  }

  const { svg } = req.files;
  const { title, proficiency } = req.body;

  if (!title || !proficiency) {
    return next(new ErrorHandler("Title and proficiency are required!", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    svg.tempFilePath,
    { folder: "PORTFOLIO SKILLS" }
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error",
      cloudinaryResponse.error || "Unknown cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload to Cloudinary", 500));
  }

  const skill = await Skills.create({
    title,
    proficiency,
    svg: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Skill added!",
    skill,
  });
});

// delete delete skill
export const deleteSkill = catchAsyncErrors(async (req, res, next) => {
  const skill = await Skills.findByIdAndDelete(req.params.id);
  if (!skill) {
    return next(new ErrorHandler("Skill not found", 404));
  }
  cloudinary.uploader.destroy(skill.svg.public_id);
  res.status(200).json({ success: true, message: "Skill deleted!" });
});

// update skill
export const updateSkill = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body);
  const { id } = req.params;
  let skill = await Skills.findById(id);
  if (!skill) {
    return next(new ErrorHandler("Skill not found", 404));
  }

  const { proficiency } = req.body;
  skill = await Skills.findByIdAndUpdate(
    id,
    { proficiency },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({ success: true, message: "Skill updated!", skill });
});

// get all skills
export const getAllSkills = catchAsyncErrors(async (req, res, next) => {
  const skills = await Skills.find();
  res.status(200).json({ success: true, skills });
});
