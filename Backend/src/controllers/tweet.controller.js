import mongoose, { isValidObjectId } from "mongoose";
import {Tweet} from "../models/tweet.models.js";
import { asyncHandler } from "../utils/asyncHandller.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {User} from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

const getAllTweets = asyncHandler (async (req,res) => {
    
const tweet = await Tweet.find({})

return res.status(200).json(
    new ApiResponse("success", "All tweets fetched successfully", tweet)
);

});

const createTweet = asyncHandler (async (req,res) =>{

    const {content} = req.body;

    if(!content){
        throw new ApiError(400, "Content is required to create a tweet");

    }
    const {_id} = req.user;

    if(!mongoose.isValidObjectId(_id)){
        throw new ApiError(400, "Invalid user ID");
    }

    const owner = await User.findById(_id);
    if(!owner){
        throw new ApiError(404, "User not found");
    }

    const tweet = await Tweet.create({
        owner: owner?._id,
        content
    });

    if(!tweet){
        throw new ApiError(500, "Failed to create tweet");
    }
    return res.status(201).json(
    new ApiResponse(true, "Tweet created successfully", tweet)
  );

});

const getUserTweets = asyncHandler (async (req,res)=>{

    const {userId} = req.params;

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID");
    }

    const tweet = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId),  
            },
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            },
        },
        {
            $project:{
                content:1,
                video:1,
                owner:{
                _id:1,
                username:1,
                fullName:1,
                },
                likeCount:1,
            },
        },
    ]);

    if(!tweet || tweet.length === 0){
        throw new ApiError(404, "No tweets found for this user");
    }

    return res.status(200).json(
        new ApiResponse(true, "User tweets fetched successfully", tweet)
    );
});

const updateTweet = asyncHandler (async (req,res) =>{

    const {tweetId} = req.params;
    const {content} = req.body;

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID");
    }

    if(!content){
        throw new ApiError(400, "Content is required to update a tweet");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {content},
        {new: true}
    );

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    return res.status(200).json(
        new ApiResponse(true, "Tweet updated successfully", tweet)
    );
});

const deleteTweet = asyncHandler (async (req,res) =>{

    const {tweetId} = req.params;

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    return res.status(200).json(
        new ApiResponse(true, "Tweet deleted successfully", tweet)
    );
});

export {
    getAllTweets,
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};



