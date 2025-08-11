import mongoose, {isValidObjectId} from 'mongoose';
import {Share } from '../models/share.models.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandller.js';
import {Video} from '../models/video.models.js';

 const shareVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { platform } = req.body;

  if (!videoId || !platform) {
    throw new ApiError(400, "Video ID and platform are required");
  }


  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check this video: http://localhost:3000/video/${videoId}`)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn’t have direct link-sharing like WhatsApp
    facebook: `https://www.facebook.com/sharer/sharer.php?u=http://localhost:3000/video/${videoId}`,
    twitter: `https://twitter.com/intent/tweet?url=http://localhost:3000/video/${videoId}`,
  };

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Create shareable link (frontend can open this link)
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const shareLink = `${baseUrl}/watch/${video._id}`;

  // Save share log
  const share = await Share.create({
    video: video._id,
    sharedBy: req.user._id,
    platform,
    shareLink,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, share, "Video share link generated successfully"));
});

export  {  shareVideo };