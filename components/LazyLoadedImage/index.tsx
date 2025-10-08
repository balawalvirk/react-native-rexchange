import React, { useState, useRef, useEffect } from "react";
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

// Global cache to store loading states for images to prevent repeated loaders
const imageLoadingCache = new Map<string, {
  thumbnailLoaded: boolean;
  imageLoaded: boolean;
  thumbnailError: boolean;
  imageError: boolean;
}>();

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
  // Create a unique cache key for this image
  const cacheKey = `${image}-${thumbnail}`;
  
  // Get cached state or initialize new state
  const getCachedState = () => {
    return imageLoadingCache.get(cacheKey) || {
      thumbnailLoaded: false,
      imageLoaded: false,
      thumbnailError: false,
      imageError: false,
    };
  };

  const [thumbnailLoading, setThumbnailLoading] = useState(() => {
    const cached = getCachedState();
    return !cached.thumbnailLoaded && !cached.thumbnailError;
  });
  const [thumbnailError, setThumbnailError] = useState(() => {
    return getCachedState().thumbnailError;
  });
  const [imageLoading, setImageLoading] = useState(() => {
    const cached = getCachedState();
    return !cached.imageLoaded && !cached.imageError;
  });
  const [imageError, setImageError] = useState(() => {
    return getCachedState().imageError;
  });

  const [retryKey, setRetryKey] = useState(0); // bust cache when retrying
  const opacity = useRef(new Animated.Value(0)).current;

  // Initialize opacity based on cached state
  useEffect(() => {
    const cached = getCachedState();
    if (cached.imageLoaded) {
      opacity.setValue(1);
    }
  }, []);

  const handleThumbnailLoad = () => {
    setThumbnailLoading(false);
    // Cache the successful load
    const cached = getCachedState();
    imageLoadingCache.set(cacheKey, {
      ...cached,
      thumbnailLoaded: true,
      thumbnailError: false,
    });
  };

  const handleThumbnailError = () => {
    setThumbnailLoading(false);
    setThumbnailError(true);
    // Cache the error state
    const cached = getCachedState();
    imageLoadingCache.set(cacheKey, {
      ...cached,
      thumbnailLoaded: false,
      thumbnailError: true,
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    // Cache the successful load
    const cached = getCachedState();
    imageLoadingCache.set(cacheKey, {
      ...cached,
      imageLoaded: true,
      imageError: false,
    });
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    // Cache the error state
    const cached = getCachedState();
    imageLoadingCache.set(cacheKey, {
      ...cached,
      imageLoaded: false,
      imageError: true,
    });
  };

  const retryThumbnail = () => {
    setThumbnailError(false);
    setThumbnailLoading(true);
    setRetryKey((k) => k + 1);
    // Clear cache for retry
    imageLoadingCache.delete(cacheKey);
  };

  const retryImage = () => {
    setImageError(false);
    setImageLoading(true);
    setRetryKey((k) => k + 1);
    // Clear cache for retry
    imageLoadingCache.delete(cacheKey);
  };

  const imageStyle = [
    {
      width: width || WINDOW_WIDTH,
      height: height || IMAGE_HEIGHT,
      position: "absolute" as const,
    },
    style,
  ];

  // Build optimized URL with aggressive caching and quality settings
  const buildUrl = (url: string, params = "", isThumbnail = false) => {
    const quality = isThumbnail ? 75 : 85; // Lower quality for thumbnails
    const cacheBuster = retryKey > 0 ? `&t=${retryKey}` : ''; // Only add cache buster on retry
    return `https://images.weserv.nl/?url=${encodeURIComponent(
      url
    )}${params}&q=${quality}${cacheBuster}`;
  };

  return (
    <View
      style={[
        {
          width: (width || WINDOW_WIDTH) as any,
          height: (height || IMAGE_HEIGHT) as any,
          position: "relative",
          backgroundColor: "#f5f5f5",
        }
      ]}
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
            uri: buildUrl(thumbnail, "&w=200&h=200&fit=cover", true), // use small size
            cache: "force-cache", // Aggressive caching for thumbnails
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
              uri: buildUrl(image, "", false), // full quality (no resize params)
              cache: "default", // Standard caching for main images
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
