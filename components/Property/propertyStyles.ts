import { Platform, StyleSheet } from 'react-native';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { fullWidth, fullHeight, heightRef, widthRef, fontRef } from '../../config/screenSizes';

// Create responsive styles using screenSizes
export const createPropertyStyles = () => {
  const isLarge = WINDOW_WIDTH > 600;
  
  return StyleSheet.create({
    // Main container styles
    mainContainer: {
      backgroundColor: '#fff',
    },
    relativeContainer: {
      position: 'relative',
    },
    
    // Loading container
    loadingContainer: {
      backgroundColor: 'white',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontSize: 18 * fontRef,
      color: '#6b7280',
    },
    
    // List price container
    listPriceContainer: {
      position: 'absolute',
      paddingHorizontal: 8 * widthRef,
      paddingVertical: 4 * heightRef,
      backgroundColor: 'white',
      borderRadius: 6 * widthRef,
      bottom: 16 * heightRef,
      left: 16 * widthRef,
    },
    listPriceText: {
      fontSize: isLarge ? 18 * fontRef : 12 * fontRef,
      color: '#10998e',
      fontFamily: 'Overpass_600SemiBold',
    },
    
    // Button containers
    homeButtonContainer: {
      position: 'absolute',
      right: 24 * widthRef,
      top: Platform.OS === 'android' ? 64 * heightRef : 80 * heightRef,
    },
    fullScreenButtonContainer: {
      position: 'absolute',
      right: 24 * widthRef,
      top: Platform.OS === 'android' ? 138 * heightRef : 144 * heightRef,
    },
    graphButtonContainer: {
      position: 'absolute',
      right: 24 * widthRef,
      top: Platform.OS === 'android' ? 212 * heightRef : 216 * heightRef,
    },
    
    // Circle button styles
    circleButtonSize: {
      width: 48 * widthRef,
      height: 48 * heightRef,
    },
    circleButtonImageSize: {
      width: 20 * widthRef,
      height: 20 * heightRef,
    },
    circleButtonImageSizeFlex: {
      width: 20 * widthRef,
      height: 20 * heightRef,
      flex: 1,
    },
    circleButtonPurple: {
      width: 48,
      height: 48,
      backgroundColor: '#5d26c1',
    },
    circleButtonBlack: {
      width: 48 ,
      height: 48,
      backgroundColor: '#000000',
    },
    circleButtonYellow: {
      width: 48,
      height: 48,
      backgroundColor: '#f1c84c',
    },
    
    // Image count container
    imageCountContainer: {
      position: 'absolute',
      paddingHorizontal: 8 * widthRef,
      paddingVertical: 4 * heightRef,
      borderRadius: 6 * widthRef,
      backgroundColor: '#5d26c1',
      bottom: 16 * heightRef,
      right: 24 * widthRef,
    },
    imageIndexText: {
      color: 'white',
      fontSize: isLarge ? 18 * fontRef : 12 * fontRef,
    },
    
    // Disclaimer container
    disclaimerContainer: {
      flexDirection: 'row',
      paddingHorizontal: Platform.OS === 'android' ? 16 * widthRef : 24 * widthRef,
      paddingVertical: Platform.OS === 'android' ? 16 * heightRef : 24 * heightRef,
    alignItems: 'center',
    },
    disclaimerIcon: {
      width: isLarge ? 32 * widthRef : 12 * widthRef,
      height: isLarge ? 32 * heightRef : 12 * heightRef,
      marginRight: 8 * widthRef,
    },
    disclaimerText: {
      flex: 1,
      fontSize: isLarge ? 18 * fontRef : 12 * fontRef,
    },
    
    // Bottom sheet styles
    bottomSheetShadow: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.58,
      shadowRadius: 16.0,
      elevation: 24,
    },
    bottomSheetMarginTop: {
      marginTop: 40 * heightRef,
    },
    
    // Terms and conditions styles
    termsConditionTitle: {
      padding: 16 * widthRef,
      fontSize: isLarge ? 24 * fontRef : 16 * fontRef,
      textAlign: 'center',
      textTransform: 'capitalize',
      fontFamily: 'Overpass_600SemiBold',
      color: '#5d26c1',
    },
    termsConditionCloseIcon: {
      position: 'absolute',
      width: 12 * widthRef,
      height: 12 * heightRef,
      top: -32 * heightRef,
      right: 16 * widthRef,
    },
    termsConditionContent: {
      paddingHorizontal: 16 * widthRef,
      paddingVertical: 8 * heightRef,
    },
    termsConditionText: {
      marginVertical: 8 * heightRef,
      fontSize: isLarge ? 24 * fontRef : 16 * fontRef,
      fontFamily: 'Overpass_400Regular',
    },
    termsConditionBoldText: {
      fontSize: isLarge ? 24 * fontRef : 16 * fontRef,
      fontFamily: 'Overpass_700Bold',
    },
    
    // Open position info styles
    openPositionInfoContainer: {
      paddingHorizontal: 16 * widthRef,
      paddingVertical: 32 * heightRef,
    },
    
    // My totals styles
    myTotalsContainer: {
      height: '100%',
    },
    myTotalsButtonContainer: {
      position: 'absolute',
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      height: 128 * heightRef,
      padding: 16 * widthRef,
      backgroundColor: 'white',
      left: 16 * widthRef,
      right: 16 * widthRef,
    },
    myTotalsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6 * widthRef,
      backgroundColor: '#10998e',
      height: 60 * heightRef,
    },
    myTotalsButtonText: {
      fontSize: 18 * fontRef,
      textAlign: 'center',
      color: 'white',
      fontFamily: 'Overpass_500Medium',
    },
    
    // Chart modal styles
    chartModalContainer: {
      // paddingBottom: 8 * heightRef,
      marginBottom: 0 * heightRef,
      marginHorizontal: isLarge ? -48 * widthRef : -20 * widthRef,
      marginTop: isLarge ? -64 * heightRef : -128 * heightRef,
      backgroundColor: 'white',
      borderRadius: 6 * widthRef,
    },
    chartTitle: {
      padding: 16 * widthRef,
      textAlign: 'center',
      textTransform: 'capitalize',
      fontFamily: 'Overpass_600SemiBold',
      color: '#5d26c1',
      fontSize: isLarge ? 24 * fontRef : 16 * fontRef,
      marginTop: Platform.OS === 'android' ? 0 * heightRef : 60 * heightRef,
    },
    chartContent: {
      marginTop: 8 * heightRef,
    },
    chartInfoText: {
      paddingHorizontal: 16 * widthRef,
      fontFamily: 'Overpass_500Medium',
      fontSize: isLarge ? 18 * fontRef : 12 * fontRef,
    },
    chartLogo: {
      width: 64 * widthRef,
      height: 64 * heightRef,
      paddingHorizontal: 16 * widthRef,
      marginHorizontal: 'auto',
      marginTop: 8 * heightRef,
    },
    chartSwipeText: {
      paddingTop: 8 * heightRef,
      paddingHorizontal: 16 * widthRef,
      fontSize: isLarge ? 18 * fontRef : 12 * fontRef,
      textAlign: 'center',
    },
    chartSwipeIndicator: {
      backgroundColor: '#9ca3af',
      height: 3 * heightRef,
      width: 32 * widthRef,
      alignSelf: 'center',
      marginTop: 6 * heightRef,
      borderRadius: 20 * widthRef,
    },
    chartCloseButton: {
      position: 'absolute',
      top: -32 * heightRef,
      right: 16 * widthRef,
      width: 32 * widthRef,
      height: 32 * heightRef,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartCloseIcon: {
      width: 12 * widthRef,
      height: 12 * heightRef,
    },
    
    // Backdrop styles
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
  });
};
