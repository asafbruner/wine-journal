import fs from "node:fs/promises";
import path from "node:path";

import { v2 as cloudinary } from "cloudinary";

const isCloudinaryEnabled = Boolean(process.env.CLOUDINARY_CLOUD_NAME);

if (isCloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32);
}

export async function uploadImage(file: File | Buffer, filename = "label"): Promise<string> {
  let buffer: Buffer;
  
  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    // File from browser - type guard ensures this is File
    const arrayBuffer = await (file as File).arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  if (isCloudinaryEnabled) {
    const publicId = `${sanitizeFilename(filename)}-${Date.now()}`;
    const base64 = buffer.toString("base64");
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}` as string, {
      public_id: publicId,
      folder: "wine-journal",
      overwrite: true,
    });
    return result.secure_url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const fileName = `${sanitizeFilename(filename)}-${Date.now()}.jpg`;
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
}

