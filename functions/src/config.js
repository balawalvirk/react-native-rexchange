'use strict';
exports.__esModule = true;
exports.fbConfig = void 0;
exports.fbConfig = {
  homejunction: {
    key: process.env.HOMEJUNCTION_API_KEY || '',
  },
  cloudinary_folder: {
    key: process.env.CLOUDINARY_FOLDER || 'rexchange-bfb0a',
  },
  cloudname: {
    key: process.env.CLOUDINARY_CLOUD_NAME || '',
  },
  cloudinary_api: {
    key: process.env.CLOUDINARY_API_KEY || '',
  },
  cloudinary_secret: {
    key: process.env.CLOUDINARY_SECRET || '',
  },
  sendgrid: {
    key: process.env.SENDGRID_API_KEY || '',
  },
};
