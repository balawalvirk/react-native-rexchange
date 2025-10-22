import { Platform, StyleSheet } from 'react-native';
import { isLarge } from '../../lib/helpers/dimensions';
import { fullWidth, fullHeight, heightRef, widthRef, fontRef } from '../../config/screenSizes';

// Create responsive styles using screenSizes
export const createEnterAGuessStyles = () => {
  const isLargeScreen = isLarge;
  
  return StyleSheet.create({
    // Main container
    mainContainer: {
      marginHorizontal: 16 * widthRef,
      marginTop: 20 * heightRef,
      marginBottom: 0,
      // backgroundColor: 'red',
    },
    
    // Guess container
    guessContainer: {
      paddingHorizontal: 32 * widthRef,
      paddingVertical: isLargeScreen ? 24 * heightRef : 20 * heightRef,
      borderWidth: 1,
      borderColor: '#E5E5E5',
    marginTop: Platform.OS === 'android' ? 0 * heightRef : 36,
    },
    
    // Info button
    infoButton: {
      position: 'absolute',
      right: 8 * widthRef,
      top: 10 * heightRef,
    },
    
    // Guess text
    guessText: {
      fontSize: isLargeScreen ? 24 : 18,
      fontFamily: 'Rajdhani_600SemiBold',
      textAlign: 'center',
      marginVertical: 16 * heightRef,
    },
    
    // Text input styles
    textInput: {
      marginTop: 'auto',
      fontSize: isLargeScreen ? 48 : 24,
      height: isLargeScreen ? 64 * heightRef : 'auto',
      textAlign: 'center',
      borderWidth: 2,
      borderRadius: 8 * widthRef,
      paddingHorizontal: 16 * widthRef,
      paddingVertical: 8 * heightRef,
      fontFamily: 'Rajdhani_500Medium',
    },
    textInputPurple: {
      borderColor: '#5d26c1',
      color: '#5d26c1',
    },
    textInputOrange: {
      borderColor: '#f19948',
      color: '#f19948',
    },
    textInputGreen: {
      borderColor: '#10998e',
      color: '#10998e',
    },
    
    // Button container
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 46 * heightRef,
      marginBottom: 8 * heightRef,
    },
    
    // Circle button styles
    circleButton: {
      width: 60,
      height: 60,
      borderWidth: 2,
      borderStyle: 'solid',
    },
    circleButtonRed: {
      borderColor: '#ca322f',
    },
    circleButtonGreen: {
      borderColor: '#10998e',
      backgroundColor: '#10998e',
    },
    circleButtonImage: {
      width: 24 * widthRef,
      height: 24 * heightRef,
    },
    
    // Button text
    buttonText: {
      marginVertical: 8 * heightRef,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontSize: isLargeScreen ? 20 : 16,
      fontWeight: 'bold',
    },
    buttonTextRed: {
      color: '#ca322f',
    },
    buttonTextGreen: {
      color: '#10998e',
    },
    
    // Bottom sheet modal styles
    bottomSheetContainer: {
      height: '100%',
      marginBottom: 100 * heightRef,
    },
    bottomSheetScrollView: {
      paddingHorizontal: 16 * widthRef,
      paddingBottom: 32 * heightRef,
    },
    
    // Modal header
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    modalHeaderText: {
      padding: 16 * widthRef,
      fontSize: isLargeScreen ? 24 : 16,
      textTransform: 'capitalize',
      fontFamily: 'Overpass_600SemiBold',
      color: '#5d26c1',
    },
    modalCloseIcon: {
      position: 'absolute',
      width: 12 * widthRef,
      height: 12 * heightRef,
      top: -32 * heightRef,
      right: 16 * widthRef,
    },
    
    // Modal content text
    modalContentText: {
      marginVertical: 16 * heightRef,
      fontSize: isLargeScreen ? 24 : 16,
      fontFamily: 'Overpass_400Regular',
    },
    
    // Modal button container
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      width: '100%',
      height: 128 * heightRef,
      padding: 16 * widthRef,
      marginHorizontal: 'auto',
      marginTop: 'auto',
      backgroundColor: 'white',
    },
    modalButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6 * widthRef,
      backgroundColor: '#10998e',
      height: 60 * heightRef,
    },
    modalButtonText: {
      fontSize: isLargeScreen ? 24 * fontRef : 18 * fontRef,
      textAlign: 'center',
      color: 'white',
      fontFamily: 'Overpass_500Medium',
    },
  });
};
