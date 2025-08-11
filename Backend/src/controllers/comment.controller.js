import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandller.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//  Get Comments for a Video
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  console.log("Fetching comments for video:", videoId);

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const comments = await Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: { $first: "$ownerDetails" },
        likes: { $size: "$likes" },
      },
    },
    {
      $unset: "ownerDetails",
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Comments fetched successfully", { comments })
  );
});

// Add Comment
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!content) {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: video?._id,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to add comment");
  }

  return res.status(201).json(
    new ApiResponse(201, "Comment added successfully", { comment })
  );
});

// Update Comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const updatedcomment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content } },
    { new: true, runValidators: true }
  );

  if (!updatedcomment) {
    throw new ApiError(404, "Comment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Comment updated successfully", { updatedcomment })
  );
});

//  Delete Comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(404, "Comment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Comment deleted successfully", { deletedComment })
  );
});

// Get All Comments by a User
const getUserAllVideoComments = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const comments = await Comment.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                    email: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              thumbnail: 1,
              duration: 1,
              owner: 1,
            },
          },
          {
            $unwind: "$ownerDetails",
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: { $size: "$likes" },
      },
    },
    {
      $project: {
        owner: 0,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "User comments fetched successfully", { comments })
  );
});

//  Export as object
export const commentController = {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  getUserAllVideoComments,
};
