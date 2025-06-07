import { asyncHandler } from "../utils/asyncHandller.js"; 
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary }  from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


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
      const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

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
    })

export { registerUser, }

// get user deatils form frontend
    // validation - not empty
    // check if user already exists : username or email
    // check for imagaes,check for avtar 
    //  upload them to cloudinary ,avatar
    // create user object - create entry in database
    // remove password and refresh token from response
    // check for user creation
    // return response to frontend 