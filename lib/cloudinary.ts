import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Missing Cloudinary environment variables.");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

type UploadOptions = {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
  resourceType?: "image" | "video" | "raw" | "auto";
};

export async function uploadAsset(
  file: string,
  options: UploadOptions = {},
) {
  return cloudinary.uploader.upload(file, {
    folder: options.folder ?? "unimart",
    resource_type: options.resourceType ?? "image",
    public_id: options.publicId,
    overwrite: options.overwrite,
  });
}

export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

export { cloudinary };
