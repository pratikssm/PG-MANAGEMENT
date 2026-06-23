import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import cloudinary from '../config/cloudinary';
import { env } from '../config/env';

export const uploadFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  if (!env.cloudinary.cloudName) {
    throw new AppError('Cloudinary not configured', 500);
  }

  const isVideo = req.file.mimetype.startsWith('video/');
  const folder = isVideo ? 'staynest/videos' : 'staynest/images';

  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: isVideo ? 'video' : 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(req.file!.buffer);
  });

  res.status(201).json(ApiResponse.ok('File uploaded', {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    size: result.bytes,
  }));
});

export const uploadMultiple = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  if (!env.cloudinary.cloudName) {
    throw new AppError('Cloudinary not configured', 500);
  }

  const results = await Promise.all(
    (req.files as Express.Multer.File[]).map((file) => {
      return new Promise<any>((resolve, reject) => {
        const isVideo = file.mimetype.startsWith('video/');
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: isVideo ? 'staynest/videos' : 'staynest/images', resource_type: isVideo ? 'video' : 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve({ url: result!.secure_url, publicId: result!.public_id });
          }
        );
        uploadStream.end(file.buffer);
      });
    })
  );

  res.status(201).json(ApiResponse.ok('Files uploaded', { files: results }));
});
