import React, { useState } from 'react';
import { View, Image, ActivityIndicator, Pressable, Text } from 'react-native';
import { IMAGE_HEIGHT, WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import tw from '../../lib/tailwind/tailwind';

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
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleThumbnailLoad = () => {
    setThumbnailLoading(false);
  };

  const handleThumbnailError = () => {
    setThumbnailLoading(false);
    setThumbnailError(true);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const retryThumbnail = () => {
    setThumbnailError(false);
    setThumbnailLoading(true);
  };

  const retryImage = () => {
    setImageError(false);
    setImageLoading(true);
  };

  const imageStyle = [
    {
      width: width || WINDOW_WIDTH,
      height: height || IMAGE_HEIGHT,
      position: 'absolute' as const,
    },
    style,
  ];

  return (
    <View
      // @ts-expect-error
      style={{
        width: width || WINDOW_WIDTH,
        height: height || IMAGE_HEIGHT,
        position: 'relative',
        backgroundColor: '#f5f5f5', // Light gray background
      }}
    >
      {/* Thumbnail Loading Indicator */}
      {showThumbnail && thumbnailLoading && !thumbnailError && (
        <View style={[imageStyle, tw`flex items-center justify-center bg-gray-200`]}>
          <ActivityIndicator size="small" color="#6B7280" />
        </View>
      )}

      {/* Thumbnail Image */}
      {showThumbnail && !thumbnailLoading && !thumbnailError && (
        <Image
          key={`${thumbnail}-loaded`}
          source={{ 
            uri: `https://images.weserv.nl/?url=${encodeURIComponent(thumbnail)}&w=100&h=100&fit=cover`,
            cache: 'default'
          }}
          resizeMode="cover"
          style={imageStyle}
          onLoad={handleThumbnailLoad}
          onError={handleThumbnailError}
        />
      )}

      {/* Thumbnail Error with Retry */}
      {showThumbnail && thumbnailError && (
        <Pressable 
          style={[imageStyle, tw`flex items-center justify-center bg-gray-200`]}
          onPress={retryThumbnail}
        >
          <View style={tw`items-center`}>
            <Image
              style={tw`w-8 h-8 mb-2`}
              source={require('../../assets/times_gray.png')}
            />
            <Text style={tw`text-xs text-gray-600 text-center`}>Tap to retry</Text>
          </View>
        </Pressable>
      )}

      {/* Main Image Loading Indicator */}
      {show && imageLoading && !imageError && (
        <View style={[imageStyle, tw`flex items-center justify-center bg-gray-200`]}>
          <ActivityIndicator size="large" color="#6B7280" />
        </View>
      )}

      {/* Main Image */}
      {show && !imageLoading && !imageError && (
        <Image
          key={`${image}-loaded`}
          source={{
            uri: `https://images.weserv.nl/?url=${encodeURIComponent(image)}&w=${imageWidth || WINDOW_WIDTH}&h=${height || IMAGE_HEIGHT}&fit=cover`,
            cache: 'default',
          }}
          resizeMode="cover"
          style={imageStyle}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Main Image Error with Retry */}
      {show && imageError && (
        <Pressable 
          style={[imageStyle, tw`flex items-center justify-center bg-gray-200`]}
          onPress={retryImage}
        >
          <View style={tw`items-center`}>
            <Image
              style={tw`w-12 h-12 mb-2 opacity-50`}
              source={require('../../assets/times_gray.png')}
            />
            <Text style={tw`text-sm text-gray-600 text-center`}>Tap to retry</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default LazyLoadedImage;
