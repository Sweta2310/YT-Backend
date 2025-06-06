import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"


    cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, // Click 'View API Keys' above to copy your cloud name
        api_key: process.env.CLOUDINARY_API_KEY, // Click 'View API Keys' above to copy your API key
        api_secret: process.env.CLOUBINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File has been uploaded successfully
        console.log("File is uploaded on Cloudinary:", response.url);
        return response;
        
    } catch (error) {
        // Delete the file from local storage if upload fails
        fs.unlinkSync(localFilePath);
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
};
    
