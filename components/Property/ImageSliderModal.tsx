import React, { useEffect, useState } from "react";
import {
  Pressable,
  View,
  Image,
  BackHandler,
  Modal,
  ActivityIndicator,
  Text,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import ImageViewer from "react-native-image-zoom-viewer";
import { WINDOW_HEIGHT, WINDOW_WIDTH } from "../../lib/helpers/dimensions";
import tw from "../../lib/tailwind/tailwind";
import { saveImageToAlbumFromUrl } from "../../utils/imageSaver";
interface ImageSliderModalProps {
  state: {
    show: boolean;
    index: number;
  };
  imageUrls: any;
  setState: any;
  onClose: () => any;
}

const ImageSliderModal: React.FC<ImageSliderModalProps> = ({
  state,
  imageUrls,
  setState,
  onClose,
}) => {
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSavingMessage, setShowSavingMessage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(state.index);

  // Optimize image URLs for modal viewing with aggressive caching
  const optimizedImageUrls = imageUrls?.map((img: any, index: number) => {
    if (typeof img === 'string') {
      // If it's just a string URL, optimize it
      return {
        url: `https://images.weserv.nl/?url=${encodeURIComponent(img)}&w=1200&h=800&fit=cover&q=90&output=webp`,
        headers: {
          'Cache-Control': 'public, max-age=31536000',
        }
      };
    } else if (img.url) {
      // If it's already an object, enhance it with better caching
      return {
        ...img,
        headers: {
          'Cache-Control': 'public, max-age=31536000',
          ...img.headers
        }
      };
    }
    return img;
  }) || [];


  
  const handleCloseClick = () => {
    setState({ ...state, show: false });
    onClose();
  };

  const saveImageToGallery = async (imageUrl: string) => {
    try {
      // Save the image to the camera roll
      await CameraRoll.save(imageUrl, { type: 'photo' });
      
      // Show success message
      setShowSaveSuccess(true);
      if (Platform.OS === 'android') {
        ToastAndroid.show("Image saved to album!", ToastAndroid.SHORT);
      }
      
      // Auto-hide the success message after 2 seconds
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving image:', error);
      
      // Check if it's a permission error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Permission denied') || errorMessage.includes('EACCES')) {
        console.log('🚫 Permission denied during save');
        Alert.alert(
          'Permission Required',
          'Please allow storage permission to save images to your gallery.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Save Failed',
          'Unable to save image to gallery. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const showSaveSuccessMessage = () => {
    setShowSaveSuccess(true);
    if (Platform.OS === 'android') {
      ToastAndroid.show("Image saved to album!", ToastAndroid.SHORT);
    }
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 2000);
  };


  const checkPermissionAndSave = async (imageUrl: string) => {
    try {
      // Check permission by trying to access camera roll
      await CameraRoll.getPhotos({ first: 1 });
      
      console.log('✅ Photo library permission: GRANTED');
      // Permission is granted - the bottom sheet with save/cancel options will handle the rest
      
    } catch (error) {
      console.error('❌ Photo library permission: DENIED', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if it's a permission error
      if (errorMessage.includes('Permission denied') || errorMessage.includes('EACCES')) {
        console.log('🚫 Permission denied during permission check');
        Alert.alert(
          'Permission Required',
          'Please allow photo library permission to save images.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('⚠️ Other error occurred during permission check');
        Alert.alert(
          'Permission Check Failed',
          'Unable to check photo library permissions. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleSaveImage = async (url: string) => {
    const result = await saveImageToAlbumFromUrl(
      url,
      // onProgress
      (message) => {
        if (message === 'Saving to album...') {
          setShowSavingMessage(true);
        }
      },
      // onSuccess
      () => {
        setShowSavingMessage(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      },
      // onError
      () => {
        setShowSavingMessage(false);
      }
    );
  };

  // Reset messages when modal opens and sync image index
  useEffect(() => {
    if (state.show) {
      setShowSaveSuccess(false);
      setShowSavingMessage(false);
      setCurrentImageIndex(state.index);
    }
  }, [state.show, state.index]);


  // Handle Android back button to close image preview
  useEffect(() => {
    if (!state.show) return; // Only handle back button when modal is visible

    const backAction = () => {
      handleCloseClick();
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [state.show, setState, onClose]);

  return (
    <Modal
      visible={state.show}
      transparent={false}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleCloseClick}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
        }}
      >
        <ImageViewer
          style={{
            flex: 1,
          }}
          show={true}
          imageUrls={optimizedImageUrls}
          index={state.index}
          enableSwipeDown={true}
          onSwipeDown={handleCloseClick}
          failImageSource={require("../../assets/times_gray.png")}
          enablePreload={true} // Enable preloading for faster navigation
          enableImageZoom={true} // Enable zoom for better UX
          maxOverflow={5} // Preload 5 images ahead
          renderIndicator={() => <></>}
          saveToLocalByLongPress={true} 
          onSave={(url) => {
            console.log('💾 Library save callback triggered for URL:', url);
            handleSaveImage(url);
          }}
          onChange={(index) => {
            if (index !== undefined) {
              setCurrentImageIndex(index);
            }
          }}
          menuContext={{
            saveToLocal: 'Save to Album',
            cancel: 'Cancel'
          }}
          // Enhanced caching and performance options
          minScale={1}
          maxScale={3}
          doubleClickInterval={175}
          renderHeader={() => <></>}
          renderFooter={() => <></>}
          loadingRender={() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "black",
              }}
            >
              <ActivityIndicator size="large" color="white" />
              <Text style={tw`text-white text-sm mt-2 font-overpass400`}>
                Loading...
              </Text>
            </View>
          )}
        />
        {/* Custom Image Counter */}
        <View
          style={tw`absolute top-16 right-40 px-3 py-1 rounded-lg bg-black/70 z-10`}
        >
          <Text style={tw`text-white text-sm font-overpass500`}>
            {currentImageIndex + 1} of {optimizedImageUrls.length}
          </Text>
        </View>
        
        <Pressable
          style={tw`absolute top-16 right-6 z-10`}
          onPress={handleCloseClick}
        >
          <Image
            style={tw`w-6 h-6 border-1 border-white rounded-full`}
            source={require("../../assets/times_white.png")}
          />
        </Pressable>
        
        {/* Save Messages Overlay */}
        {showSavingMessage && (
          <Pressable
            style={[tw`absolute bottom-10 px-6 py-3 rounded-lg z-20 bg-purple`, { left: '45%', transform: [{ translateX: -75 }] }]}
          >
            <View style={tw`flex-row items-center`}>
              <ActivityIndicator size="small" color="white" style={tw`mr-2`} />
              <Text style={tw`text-white text-sm font-overpass300 text-center`}>
                Saving to album...
              </Text>
            </View>
          </Pressable>
        )}
        
        {/* {showSaveSuccess && (
          <Pressable
            style={[tw`absolute bottom-20 px-6 py-3 rounded-lg z-20 bg-green-500`, { left: '50%', transform: [{ translateX: -75 }] }]}
          >
            <Text style={tw`text-white text-lg font-overpass600 text-center`}>
              ✓ Image saved to album!
            </Text>
          </Pressable>
        )} */}
        
      </View>
      
    </Modal>
  );
};

export default ImageSliderModal;
