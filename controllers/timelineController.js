import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Timeline } from "../models/timelineSchema.js";

// add timeline
export const postTimeline = catchAsyncErrors(async (req, res) => {
  const { title, description, from, to } = req.body;

  const newTimeline = await Timeline.create({
    title,
    description,
    timeline: { from, to },
  });
  res
    .status(200)
    .json({ success: true, message: "Timeline Added", newTimeline });
});

// delete timeline
export const deleteTimeline = catchAsyncErrors(async (req, res, next) => {
  const timeline = await Timeline.findByIdAndDelete(req.params.id);
  if (!timeline) {
    return next(new ErrorHandler("Timeline not found", 404));
  }
  res.status(200).json({ success: true, message: "Timeline deleted" });
});

// get timeline
export const getAllTimelines = catchAsyncErrors(async (req, res, next) => {
  const timelines = await Timeline.find();
  res.status(200).json({ success: true, timelines });
});
