import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary";
import { Projects } from "../models/projectsSchema.js";

// add project
export const addProject = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Project Banner image is required!", 400));
  }

  const { projectBanner } = req.files;

  const {
    title,
    description,
    gitRepoLink,
    projectLink,
    technologies,
    stack,
    deployed,
  } = req.body;

  if (!title || !technologies || !stack) {
    return next(new ErrorHandler("All fields are required!", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    projectBanner.tempFilePath,
    { folder: "PROJECTS BANNER IMAGES" }
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error",
      cloudinaryResponse.error || "Unknown cloudinary error"
    );
    return next(
      new ErrorHandler("Failed to upload project image to cloudinary", 500)
    );
  }

  const project = await Projects.create({
    title,
    description,
    gitRepoLink,
    projectLink,
    technologies,
    stack,
    deployed,
    projectBanner: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(201).json({ success: true, message: "Project added!", project });
});

// delete delete project
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const project = await Projects.findByIdAndDelete(req.params.id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  cloudinary.uploader.destroy(project.projectBanner.public_id);
  res.status(200).json({ success: true, message: "Project deleted" });
});

// update project
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const newProjectsData = {
    title: req.body.title,
    description: req.body.description,
    gitRepoLink: req.body.gitRepoLink,
    projectLink: req.body.projectLink,
    technologies: req.body.technologies,
    stack: req.body.stack,
    deployed: req.body.deployed,
  };

  // update project banner image
  if (req.files && req.files.projectBanner) {
    const projectBanner = req.files.projectBanner;
    const project = await Projects.findById(req.params.id);
    const projectBannerId = project.projectBanner.public_id;
    await cloudinary.uploader.destroy(projectBannerId);
    const cloudinaryResponse = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      { folder: "PROJECTS BANNER IMAGES" }
    );

    newProjectsData.projectBanner = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  const updatedProject = await Projects.findByIdAndUpdate(
    req.params.id,
    newProjectsData,
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res.status(200).json({
    success: true,
    message: "Project updated!",
    project: updatedProject,
  });
});

// get single projects
export const getSingleProjects = catchAsyncErrors(async (req, res, next) => {
  const project = await Projects.findById(req.params.id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }
  res.status(200).json({ success: true, project });
});

// get all projects
export const getAllProjects = catchAsyncErrors(async (req, res) => {
  const projects = await Projects.find();
  res.status(200).json({ success: true, projects });
});
