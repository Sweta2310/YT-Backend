import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandller.js";

const toggleVideoLike = asyncHandler(async(req,res) =>{
    const {videoId} = req.params;
    // toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid VideoId");
    }

    const filter ={
        video : videoId,
        likedBy: req.user?._id,
    }

    const liked = await Like.findOne(filter);

    if(liked){
        await Like.findByIdAndDelete(liked._id);
        return res
        .status(200)
        .json(new ApiResponse(200,{ isLiked:false}
        ))
    }

    await Like.create(filter);
     return res.status(200)
     .json(new ApiResponse(200,{isliked :true}));
})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
// toggle like comment

 if(!isValidObjectId(commentId)){
    throw new ApiError (400,"Invalid commentId");
 }

 const filter ={
    comment : commentId,
    likedBy : req.user?._id,
 }

 const liked = await Like.findOne(filter);

 if(liked){
    await Like.findByIdAndDelete(liked._id);
    return res.status(200)
    .json(new ApiResponse(200,{isLiked:false}

    ));
 }
    
    await Like.create(filter);
    return res.status(200)
    .json(new ApiResponse(200,{isliked :true}));
 
});

const toggleTweetLike = asyncHandler (async (req,res)=>{
    
    const {tweetId} = req.params;
    // toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid TweetId");
    }

    const filter = {
        tweet : tweetId,
        likedBy: req.user?._id,
    }

    const liked = await Like.findOne(filter);

    if(liked){
        await Like.findByIdAndDelete(liked._id);
        return res
        .status(200)
        .json(new ApiResponse(200,{ isLiked:false}
        ))
    }

    await Like.create(filter);
     return res.status(200)
     .json(new ApiResponse(200,{isliked :true}));
});

const getLikedVideos = asyncHandler(async(req,res)=>{

    const videos = await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: {
                    $exists:true
                }
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                        $lookup :{
                            from:"users",
                            localField: "owner",
                            foreignField:"_id",
                            as:"owner",
                        }
                    } ,
                    {
                        $unwind: "$owner"
                    }, 
                ],
            },
        },
        {
            $unwind:"$video",
        },
        {
            $sort :{
                createdAt :-1,
            },
        },
        {
            $project:{
                videos:{
                    _id:1,
                    tittle:1,
                    description:1,
                    duration:1,
                    thumbnail:1,
                    views:1,
                    videoFile:1,
                    createdAt:1,
                    isPublished:1,
                    owner:{
                        username:1,
                        avatar:1,
                    },
                },
             },
       },
    ])
    return res.status(200)
    .json(new ApiResponse(200,{videos},"Liked Videos Fetched Successfully"));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}