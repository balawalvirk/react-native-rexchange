import React from 'react';
import { View, Image } from 'react-native';
import { IMAGE_HEIGHT, WINDOW_WIDTH } from '../../lib/helpers/dimensions';

interface LazyLoadedImageProps {
  image: string;
  thumbnail: string;
  show: boolean;
  showThumbnail: boolean;
  width?: number | string;
  height?: number | string;
  style?: any;
  imageWidth?: string;
  thumbNailWidth?: string;
}

const LazyLoadedImage: React.FC<LazyLoadedImageProps> = ({
  image,
  thumbnail,
  show,
  width,
  height,
  style,
  showThumbnail,
  imageWidth,
}) => {
  return (
    <View
      // @ts-expect-error
      style={{
        width: width || WINDOW_WIDTH,
        height: height || IMAGE_HEIGHT,
        position: 'relative',
      }}
    >
      {showThumbnail && (
        <Image
          key={thumbnail}
          source={{ 
            uri: `https://images.weserv.nl/?url=${encodeURIComponent(thumbnail)}&w=100&h=100&fit=cover`,
            cache: 'default'
          }}
          resizeMode="cover"
          style={[
            {
              width: width || WINDOW_WIDTH,
              height: height || IMAGE_HEIGHT,
              position: 'absolute',
            },
            style,
          ]}
        />
      )}
      {show && (
        <Image
          key={image}
          source={{
            uri: `https://images.weserv.nl/?url=${encodeURIComponent(image)}&w=${imageWidth || WINDOW_WIDTH}&h=${height || IMAGE_HEIGHT}&fit=cover`,
            cache: 'default',
          }}
          resizeMode="cover"
          style={[
            {
              width: width || WINDOW_WIDTH,
              height: height || IMAGE_HEIGHT,
              position: 'absolute',
            },
            style,
          ]}
        />
      )}
    </View>
  );
};

export default LazyLoadedImage;
