import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// register
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("No files were uploaded", 400));
  }

  const { avatar, resume } = req.files;

  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    { folder: "AVATARS" }
  );

  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    console.error(
      "Cloudinary Error",
      cloudinaryResponseForAvatar.error || "Unknown cloudinary error"
    );
  }

  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    { folder: "MY_RESUME" }
  );

  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    console.error(
      "Cloudinary Error",
      cloudinaryResponseForResume.error || "Unknown cloudinary error"
    );
  }

  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    linkedinURL,
    facebookURL,
    twitterURL,
  } = req.body;

  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    linkedinURL,
    facebookURL,
    twitterURL,
    avatar: {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResponseForResume.public_id,
      url: cloudinaryResponseForResume.secure_url,
    },
  });

  generateToken(user, "User Registered!", 201, res);
});

// login user
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // validate email and password
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  // check if user exists
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // check if password is correct
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // generate jwt token
  generateToken(user, "User Logged In!", 200, res);
});

// logout user
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User Logged Out!",
    });
});

// get user
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.json({ success: true, user });
});

// Update User
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    portfolioURL: req.body.portfolioURL,
    githubURL: req.body.githubURL,
    instagramURL: req.body.instagramURL,
    linkedinURL: req.body.linkedinURL,
    facebookURL: req.body.facebookURL,
    twitterURL: req.body.twitterURL,
  };

  // Update Avatar
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    const profileImageId = user.avatar.public_id;
    if (profileImageId) await cloudinary.uploader.destroy(profileImageId);
    const cloudinaryResponse = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      { folder: "AVATARS" }
    );

    newUserData.avatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  // Update Resume
  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);
    const resumeId = user.resume.public_id;
    if (resumeId) await cloudinary.uploader.destroy(resumeId);
    const cloudinaryResponse = await cloudinary.uploader.upload(
      resume.tempFilePath,
      { folder: "MY_RESUME" }
    );
    newUserData.resume = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.json({ success: true, message: "Profile Updated!", user: updatedUser });
});

// update user password
export const updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  // validate password
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await User.findById(req.user.id).select("+password");

  // check if password is correct
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid current password", 401));
  }

  // check if new password and confirm password match
  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("New password and confirm password do not match", 400)
    );
  }

  // update password
  user.password = newPassword;
  await user.save();

  // send response
  res.json({ success: true, message: "Password updated!" });
});

export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const id = "67423f697357894a1ca06adb";
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

// forgot password request
export const forgotUserPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with that email", 404));
  }

  // generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // send reset password email
  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is: \n\n ${resetPasswordUrl} \n\n If you've want to reset your password`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Personal Portfolio Dashboard Reset Password",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully!`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Failed to send email", 500));
  }
});

// reset user password
export const resetUserPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Invalid or expired reset password token", 400)
    );
  }

  // validate password
  if (req.body.password !== req.body.confirmNewPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  // update password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // send response
  generateToken(user, "Reset Password Successfully", 200, res);
});
