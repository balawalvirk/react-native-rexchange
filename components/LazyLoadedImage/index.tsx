import React, { useState, useRef } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  Pressable,
  Text,
  Animated,
} from "react-native";
import { IMAGE_HEIGHT, WINDOW_WIDTH } from "../../lib/helpers/dimensions";
import tw from "../../lib/tailwind/tailwind";

interface LazyLoadedImageProps {
  image: string; // Full-size image
  thumbnail: string; // Low-res thumbnail
  show: boolean;
  showThumbnail: boolean;
  width?: number | string;
  height?: number | string;
  style?: any;
  imageWidth?: string | number;
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

  const [retryKey, setRetryKey] = useState(0); // bust cache when retrying
  const opacity = useRef(new Animated.Value(0)).current;

  const handleThumbnailLoad = () => setThumbnailLoading(false);
  const handleThumbnailError = () => {
    setThumbnailLoading(false);
    setThumbnailError(true);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const retryThumbnail = () => {
    setThumbnailError(false);
    setThumbnailLoading(true);
    setRetryKey((k) => k + 1);
  };

  const retryImage = () => {
    setImageError(false);
    setImageLoading(true);
    setRetryKey((k) => k + 1);
  };

  const imageStyle = [
    {
      width: width || WINDOW_WIDTH,
      height: height || IMAGE_HEIGHT,
      position: "absolute" as const,
    },
    style,
  ];

  // Build safe URL with cache buster
  const buildUrl = (url: string, params = "") =>
    `https://images.weserv.nl/?url=${encodeURIComponent(
      url
    )}${params}&t=${retryKey}`;

  return (
    <View
      style={{
        width: width || WINDOW_WIDTH,
        height: height || IMAGE_HEIGHT,
        position: "relative",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Thumbnail Loader */}
      {showThumbnail && thumbnailLoading && !thumbnailError && (
        <View
          style={[imageStyle, tw`flex items-center justify-center bg-gray-200`]}
        >
          <ActivityIndicator size="small" color="#6B7280" />
        </View>
      )}

      {/* Thumbnail */}
      {showThumbnail && !thumbnailError && (
        <Image
          key={`thumb-${retryKey}`}
          source={{
            uri: buildUrl(thumbnail, "&w=200&h=200&fit=cover"), // use small size
            cache: "default",
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
              source={require("../../assets/times_gray.png")}
            />
            <Text style={tw`text-xs text-gray-600 text-center`}>
              Tap to retry
            </Text>
          </View>
        </Pressable>
      )}

      {/* Main Image */}
      {show && !imageError && (
        <>
          <Animated.Image
            key={`main-${retryKey}`}
            source={{
              uri: buildUrl(image), // full quality (no resize params)
              cache: "default",
            }}
            resizeMode="cover"
            style={[imageStyle, { opacity }]}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {imageLoading && (
            <View
              style={[
                imageStyle,
                tw`flex items-center justify-center bg-gray-200`,
              ]}
            >
              <ActivityIndicator size="large" color="#6B7280" />
            </View>
          )}
        </>
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
              source={require("../../assets/times_gray.png")}
            />
            <Text style={tw`text-sm text-gray-600 text-center`}>
              Tap to retry
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default LazyLoadedImage;
