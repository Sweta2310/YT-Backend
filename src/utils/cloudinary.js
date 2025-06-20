import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // console.log("File uploaded on Cloudinary:", response.url);
        await fs.unlink(localFilePath);
        return response;

    } catch (error) {
        await fs.unlink(localFilePath).catch(() => {});
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary };

    
