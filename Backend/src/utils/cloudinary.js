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

const deleteCloudniary = async (publicId, resource_type) => {
  try {
    if (!publicId) return null;
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: `${resource_type}`,
    });
    return res;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return null;
  }
};

const deleteUserCloudniary = async (url, resourceType = "image") => {
  const public_id = extractPublicId(url);
  try {
    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: resourceType,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export { uploadOnCloudinary, deleteCloudniary, deleteUserCloudniary };

    
