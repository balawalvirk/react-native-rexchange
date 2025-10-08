import { Platform, Alert, ToastAndroid, PermissionsAndroid } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

export interface ImageSaveResult {
  success: boolean;
  message?: string;
}

export const saveImageToAlbumFromUrl = async (
  url: string,
  onProgress?: (message: string) => void,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<ImageSaveResult> => {
  try {
    console.log('💾 Starting image save process from URL:', url);
    onProgress?.('Saving to album...');

    // 1) Permissions (keep your current logic)
    if (Platform.OS === 'android') {
      console.log('📱 Requesting Android storage permissions...');
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ];
      if (Platform.Version <= 28) {
        permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      }
      if (Platform.Version >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      }
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      const allGranted = Object.values(granted).every(
        (v) => v === PermissionsAndroid.RESULTS.GRANTED
      );
      if (!allGranted) {
        console.log('🚫 Android storage permissions not fully granted:', granted);
        const error = 'Please allow storage/photos permission to save images.';
        onError?.(error);
        Alert.alert('Permission Required', error);
        return { success: false, message: error };
      }
      console.log('✅ All Android storage permissions granted');
    } else {
      // iOS: Check and request photo library permission properly
      console.log('📱 Checking iOS CameraRoll permission...');
      try {
        // First try to get photos to check permission
        const result = await CameraRoll.getPhotos({ first: 1 });
        console.log('✅ iOS CameraRoll permission confirmed');
      } catch (error: any) {
        console.log('🚫 iOS CameraRoll permission not granted:', error);
        
        // If permission is denied, show a helpful message
        if (error.message?.includes('3302') || error.message?.includes('Permission denied')) {
          const errorMsg = 'Please allow Photos access in Settings to save images. Go to Settings > Privacy & Security > Photos > Rexchange and select "All Photos" or "Selected Photos".';
          onError?.(errorMsg);
          Alert.alert(
            'Photos Access Required', 
            'To save images, please allow Photos access in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => {
                // On iOS simulator, this won't work, but on real device it will
                if (Platform.OS === 'ios') {
                  const { Linking } = require('react-native');
                  Linking.openSettings();
                }
              }}
            ]
          );
          return { success: false, message: errorMsg };
        }
        
        // For other errors, show generic message
        const errorMsg = 'Please allow Photos access to save images.';
        onError?.(errorMsg);
        Alert.alert('Permission Required', errorMsg);
        return { success: false, message: errorMsg };
      }
    }

    // 2) Download the image to a temporary file
    console.log('📥 Downloading image to local cache...');
    const fileExt =
      (url.match(/\.(png|jpg|jpeg|webp|gif)(\?|$)/i)?.[1] ?? 'jpg').toLowerCase();
    const localFileName = `rexchange_${Date.now()}.${fileExt}`;
    const localPath = `${RNFS.CachesDirectoryPath}/${localFileName}`;

    console.log('📁 Local file path:', localPath);

    // If your URLs may redirect, RNFS handles it. Optionally set headers.
    const download = RNFS.downloadFile({
      fromUrl: url,
      toFile: localPath,
      headers: { Accept: 'image/*' },
    });

    const result = await download.promise;
    console.log('📥 Download result:', result);
    
    if (result.statusCode && result.statusCode >= 400) {
      throw new Error(`DOWNLOAD_FAILED_${result.statusCode}`);
    }

    // 3) Save the LOCAL file path to the gallery
    console.log('💾 Saving local file to camera roll...');
    
    // For iOS, use the local path directly, for Android add file:// prefix
    const fileUri = Platform.OS === 'android' ? `file://${localPath}` : localPath;
    
    console.log('📁 File URI for save:', fileUri);

    const saveOptions =
      Platform.OS === 'android'
        ? ({ type: 'photo' as const, album: 'Rexchange' })
        : ({ type: 'photo' as const });

    await CameraRoll.save(fileUri, saveOptions);
    console.log('✅ Image saved to camera roll successfully!');

    // 4) Clean up + UX
    onSuccess?.();
    if (Platform.OS === 'android') {
      ToastAndroid.show('Image saved to album!', ToastAndroid.SHORT);
    }

    // Optional: delete temp file after saving (Android copies into MediaStore)
    RNFS.unlink(localPath).catch(() => {
      console.log('🧹 Cleaned up temporary file');
    });

    return { success: true, message: 'Image saved successfully!' };
  } catch (err: any) {
    console.error('❌ Error saving image to album:', err);
    const msg = (err && err.message) || String(err);

    let errorMessage = 'Unable to save image. Please try again.';

    if (msg === 'NO_IOS_PHOTO_PERMISSION') {
      errorMessage = 'Please allow Photos access to save images.';
      Alert.alert('Permission Required', errorMessage);
    } else if (msg.includes('3302') || msg.includes('PHPhotosErrorDomain')) {
      errorMessage = 'Photos access is required. Please allow Photos permission in Settings.';
      Alert.alert(
        'Photos Access Required',
        'To save images, please allow Photos access in Settings > Privacy & Security > Photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            if (Platform.OS === 'ios') {
              const { Linking } = require('react-native');
              Linking.openSettings();
            }
          }}
        ]
      );
    } else if (msg.startsWith('DOWNLOAD_FAILED') || msg.includes('Failed to fetch')) {
      errorMessage = 'Unable to download the image. Please check your connection and try again.';
      Alert.alert('Download Failed', errorMessage);
    } else if (msg.includes('EACCES') || msg.includes('Permission denied')) {
      errorMessage = 'Storage/Photos permission is required to save images.';
      Alert.alert('Permission Required', errorMessage);
    } else {
      Alert.alert('Save Failed', errorMessage);
    }

    onError?.(errorMessage);
    return { success: false, message: errorMessage };
  }
};

// Helper function to check permissions without saving
export const checkImageSavePermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ];
      if (Platform.Version <= 28) {
        permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      }
      if (Platform.Version >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      }
      
      // Check permissions without requesting them
      const granted = permissions.map(permission => 
        PermissionsAndroid.check(permission)
      );
      const results = await Promise.all(granted);
      return results.every(result => result === true);
    } else {
      // For iOS, try to access photos
      await CameraRoll.getPhotos({ first: 1 });
      return true;
    }
  } catch (error) {
    return false;
  }
};
