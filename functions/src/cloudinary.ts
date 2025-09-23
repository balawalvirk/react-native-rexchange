import { v2 as cloudinary } from 'cloudinary';
import { UploadApiOptions, UploadApiResponse, UploadStream } from 'cloudinary';
import * as streamifier from 'streamifier';
import * as functions from 'firebase-functions';
import { fbConfig } from './config';

const config =
  JSON.stringify(functions.config()) != '{}' ? functions.config() : fbConfig;
cloudinary.config({
  cloud_name: config.cloudname.key,
  api_key: config.cloudinary_api.key,
  api_secret: config.cloudinary_secret.key,
});

export const streamUpload = (
  data: Buffer,
  id?: string,
): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const options = {
      folder: config.cloudinary_folder.key || 'default',
      invalidate: true,
      ...(id && { public_id: id, folder: null }), // in case of updating the image, we will need the public_id
      // but not the folder as it's already in the URL and if we pass
      //the value then it will create file in sub-folder instead of updating.
    };
    const stream: UploadStream = cloudinary.uploader.upload_stream(
      options as UploadApiOptions,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );
    streamifier.createReadStream(data).pipe(stream);
  });
};
