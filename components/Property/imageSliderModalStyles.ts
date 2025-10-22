import { Platform, StyleSheet } from 'react-native';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../../lib/helpers/dimensions';
import { fullWidth, fullHeight, heightRef, widthRef, fontRef } from '../../config/screenSizes';

// Create responsive styles using screenSizes
export const createImageSliderModalStyles = () => {
  const isLarge = WINDOW_WIDTH > 600;
  
  return StyleSheet.create({
    // Modal container
    modalContainer: {
      flex: 1,
      backgroundColor: 'black',
    },
    
    // Loading overlay
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    
    // Loading text
    loadingText: {
      color: 'white',
      fontSize: 14 * fontRef,
      marginTop: 8 * heightRef,
      fontFamily: 'Overpass_400Regular',
    },
    
    // Image counter
    imageCounter: {
      position: 'absolute',
      top: 64 * heightRef,
      right: 160 * widthRef,
      paddingHorizontal: 12 * widthRef,
      paddingVertical: 4 * heightRef,
      borderRadius: 8 * widthRef,
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 10,
    },
    
    // Image counter text
    imageCounterText: {
      color: 'white',
      fontSize: 16 * fontRef,
      fontFamily: 'Overpass_500Medium',
    },
    
    // Close button
    closeButton: {
      position: 'absolute',
      top: Platform.OS === 'android' ? 70 * heightRef : 64 * heightRef,
      right: 24 * widthRef,
      zIndex: 10,
    },
    
    // Close button image
    closeButtonImage: {
      width: 24 * widthRef,
      height: 24 * heightRef,
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 12 * widthRef,
    },
    
    // Save button
    saveButton: {
      position: 'absolute',
      bottom: 40 * heightRef,
      left: '45%',
      paddingHorizontal: 24 * widthRef,
      paddingVertical: 12 * heightRef,
      borderRadius: 8 * widthRef,
      zIndex: 20,
      backgroundColor: '#5d26c1',
      transform: [{ translateX: -75 * widthRef }],
    },
    
    // Save button content
    saveButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    // Save button text
    saveButtonText: {
      color: 'white',
      fontSize: 14 * fontRef,
      fontFamily: 'Overpass_300Light',
      textAlign: 'center',
    },
    
    // Save success button
    saveSuccessButton: {
      position: 'absolute',
      bottom: 80 * heightRef,
      left: '50%',
      paddingHorizontal: 24 * widthRef,
      paddingVertical: 12 * heightRef,
      borderRadius: 8 * widthRef,
      zIndex: 20,
      backgroundColor: '#10B981',
      transform: [{ translateX: -75 * widthRef }],
    },
    
    // Save success text
    saveSuccessText: {
      color: 'white',
      fontSize: 18 * fontRef,
      fontFamily: 'Overpass_600SemiBold',
      textAlign: 'center',
    },
    
    // Image viewer container
    imageViewerContainer: {
      flex: 1,
      backgroundColor: 'black',
    },
  });
};
