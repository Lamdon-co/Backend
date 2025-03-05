const cloudinary = require("cloudinary").v2;

export const uploadToCloudinary = async (image: string, folder: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image,
      { folder },
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result?.secure_url);
      }
    );
  });
};
