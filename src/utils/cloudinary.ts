import { cloudinaryConfig } from "../config/cloudinary";


export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryConfig.uploader.upload_stream(
      { folder },
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result?.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};
