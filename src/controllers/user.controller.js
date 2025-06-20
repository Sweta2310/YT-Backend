import { asyncHandler } from "../utils/asyncHandller.js"; 
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary }  from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { subscribe } from "diagnostics_channel";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Internal server error");
  }
};

const registerUser = asyncHandler(async (req, res) => {

     const { fullName, email, username, password } = req.body;
     console.log("User Registration Details:", { fullName, email, username, password });

     if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
     ) {
        throw new ApiError(400, "All fields are required");

     }

    const existedUser = await  User.findOne({
         $or: [{ email }, { username }] 
        })

        if(existedUser){
            throw new ApiError(409, "User already exists with this email or username");
        }

       const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //   const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;

      if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar image is required");
    }


     const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image");
  }
    
     let coverImage;
     if (coverImageLocalPath) {
     coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email, 
            username: username.toLowerCase(),
            password, // Ensure password is hashed in the User model
        });
       
         const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );
        if (!createdUser) {
            throw new ApiError(500, "User creation failed");
        }


        return res.status(201).json(
            new ApiResponse(200, createdUser,"User created successfully")
        );

   } })

const loginUser = asyncHandler (async (req, res) => {
     const { email, username, password } = req.body;
     if(!email && !username) {
         throw new ApiError(400, "Email or Username and Password are required");
     }
     const user = await User.findOne({
        $or: [{username},{email}]
     })

     if(!user) {
         throw new ApiError(404, "User not found");
     }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if(!isPasswordValid) {
            throw new ApiError(401, "Invalid password");
        }

       const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

         const loggedInUser = await User.findById(user._id).
         select("-password -refreshToken")

         const options ={
            httpOnly : true,
            secure : true

         }

         return res
         .status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",refreshToken,options)
         .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accessToken,
                    refreshToken
                },
                "User Logged In Successfully"
            )
         )


     } );

 const logoutUser = asyncHandler(async(req,res) =>{
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken:undefined
                }
            },
            {
                new: true
            }
        )
         const options ={
            httpOnly : true,
            secure : true

         }

         return res
         .status(200)
         .clearCookie("accessToken",options)
         .clearCookie("refreshToken",options)
         .json(new ApiResponse(200,{},"User loged out "))

     }
    )

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken ||
    req.body.refreshToken 
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request: No refresh token provided");
    }

 try {
       const decodedToken = jwt.verify(
           incomingRefreshToken,
           process.env.REFRESH_TOKEN_SECRET,
   
       )
   
       const user = await User.findById(decodedToken.id) //_nhi lagayu
        if (!user){
           throw new ApiError(401,"Invalid refresh token: user not found");
        }
   
        if(incomingRefreshToken !== user?.refreshToken) {
           throw new ApiError(401, " refresh token is expired or invalid");
   
        }
   
        const options = {
           httpOnly: true,
           secure: true
        }
   
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
           new ApiResponse(
               200,
               { accessToken, refreshToken: newrefreshToken },
               "Access token refreshed successfully"
           )
   
        )
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
    
 }

})

const ChangeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword; // Ensure password is hashed in the User model
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  
    
   return res.status(200).json(
        new ApiResponse(200, req.user, "Current user retrieved successfully"))
    
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
   
    if(!fullName || !email) {
        throw new ApiError(400, "Full name and email are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    );
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Failed to upload avatar image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    );
})
 

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(400, "Failed to upload Cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, user, "Cover Image updated successfully")
    );
})


const avtarImageDelete = asyncHandler(async (req, res) => {

  const avatarLocalPath = req.file?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  
  fs.unlink(avatarLocalPath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      throw new ApiError(500, "Failed to delete avatar image");
    }

    return res.status(200).json(
        new ApiResponse(200, req.user, "Avatar updated successfully"))
    });
  });


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params;
    if (!username?. trim()) {
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: { username: username.toLowerCase() }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedto"
            }
            

        },
        {
            $addFields:{
                subscriberCount: {
                     $size: "$subscribers" 
                    },
                channelssubscribedToCount: {
                     $size: "$subscribedto"
                     },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelssubscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])

    if(!channel?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res.status(200).json(
        new ApiResponse(200, channel[0], "Channel profile retrieved successfully")
    );

})

const getWatchHistory = asyncHandler(async (req, res) => {

    const watchHistory = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.user.id) } },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchhistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                                {
                                    $addFields: {
                                        owner:{
                                            $first: "$ownerDetails"
                                        }
                                    }
                                }

                            ]
                        }
                    }
                ]
            }
        },
    
    ]);

    if (!watchHistory || !watchHistory.length) {
        return res.status(404).json(
            new ApiResponse(404, [], "No watch history found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, watchHistory[0].history, "Watch history retrieved successfully")
    );
});

 
export { registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        ChangeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        avtarImageDelete,
        getUserChannelProfile,
        getWatchHistory
 }

