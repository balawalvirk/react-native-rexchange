import { Cloudinary } from '@cloudinary/url-gen';
export const getPublicId = (imageURL: string) => {
  const publicid = imageURL.split('/')?.pop()?.split('.')[0] || '';
  return publicid;
};

export const myCloudinary = new Cloudinary({
  cloud: {
    cloudName: 'wherewego',
  },
  url: {
    secure: true,
  },
});

export const getGalleryImage = (image: string) => {
  return `https://res.cloudinary.com/wherewego/image/fetch/${image}`;
};
