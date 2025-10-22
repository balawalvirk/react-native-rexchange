import { Platform, StyleSheet } from 'react-native';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { fullWidth, fullHeight, heightRef, widthRef, fontRef } from '../../config/screenSizes';

// Create responsive styles using screenSizes
export const createOpenAPositionStyles = () => {
  const isLarge = WINDOW_WIDTH > 600;
  
  return StyleSheet.create({
    // Loading container
    loadingContainer: {
      marginTop: 16 * heightRef,
    //   flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      padding: 16 * widthRef,
      fontSize: 18,
      textAlign: 'center',
      color: '#5d26c1',
      fontFamily: 'Rajdhani_700Bold',
    },
    loadingSubText: {
      fontSize: 14,
      textAlign: 'center',
      color: '#575757',
      fontFamily: 'Overpass_400Regular',
    },
    
    // Thank you container
    thankYouContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    thankYouText: {
      padding: 20 * widthRef,
      fontSize: 20,
      textAlign: 'center',
      color: '#10998e',
      fontFamily: 'Rajdhani_700Bold',
    },
    thankYouSubText: {
      fontSize: 14,
      textAlign: 'center',
      color: '#575757',
      fontFamily: 'Overpass_400Regular',
      marginBottom: 20 * heightRef,
    },
    
    // Already bid container
    alreadyBidContainer: {
    //   flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    alreadyBidText: {
      padding: 20 * widthRef,
      fontSize: 20,
      textAlign: 'center',
      color: '#5d26c1',
      fontFamily: 'Rajdhani_700Bold',
    },
    alreadyBidSubText: {
      fontSize: 14,
      textAlign: 'center',
      color: '#575757',
      fontFamily: 'Overpass_400Regular',
      marginBottom: 20 * heightRef,

    },
    
    // Main valuation container
    valuationContainer: {
      position: 'relative',
    //   height: isLarge && Platform.OS === 'ios' ? 250 * heightRef : isLarge ? 175 * heightRef : 'auto',
      padding: Platform.OS === 'android' ? 10 * widthRef : 20 * widthRef,
      marginHorizontal: 16 * widthRef,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom:Platform.OS === 'android' ? 0 * heightRef : 10 * heightRef,
    },
    
    // Valuation text
    valuationText: {
      fontSize: isLarge && Platform.OS === 'ios' ? 30 : isLarge ? 24 : 18,
      textAlign: 'center',
      fontFamily: 'Rajdhani_600SemiBold',
      color: '#000000',
      marginVertical: 2 * heightRef,
      marginBottom: 10 * heightRef,
    },
    
    // Button row container
    buttonRowContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4 * widthRef,
    },
    
    // Button styles
    valuationButton: {
      paddingVertical: isLarge && Platform.OS === 'ios' ? 6 * heightRef : isLarge ? 8 * heightRef :5 * heightRef,
      paddingHorizontal: isLarge && Platform.OS === 'ios' ? 8 * widthRef : isLarge ? 8 * widthRef : 16 * widthRef,
      margin: isLarge && Platform.OS === 'ios' ? 12 * widthRef : isLarge ? 4 * widthRef : 0,
      borderWidth: 2,
      borderRadius: 8 * widthRef,
    },
    valuationButtonMarginRight: {
      marginRight: 8 * widthRef,
      marginBottom: 4 * heightRef,
    },
    valuationButtonMarginLeft: {
      marginLeft: 8 * widthRef,
      marginBottom: 4 * heightRef,
    },
    
    // Too Low button
    tooLowButton: {
      borderColor: '#5d26c1',
    },
    tooLowButtonSelected: {
      backgroundColor: '#5d26c1',
    },
    tooLowButtonText: {
      color: '#5d26c1',
      fontSize: isLarge && Platform.OS === 'ios' ? 24 : isLarge ? 20 : 16,
    },
    tooLowButtonTextSelected: {
      color: 'white',
    },
    
    // Too High button
    tooHighButton: {
      borderColor: '#f19948',
    },
    tooHighButtonSelected: {
      backgroundColor: '#f19948',
    },
    tooHighButtonText: {
      color: '#f19948',
      fontSize: isLarge && Platform.OS === 'ios' ? 24 : isLarge ? 20 : 16,
    },
    tooHighButtonTextSelected: {
      color: 'white',
    },
    
    // Just Right button container
    justRightButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 4 * heightRef,
    },
    
    // Just Right button
    justRightButton: {
      borderColor: '#10998e',
    },
    justRightButtonSelected: {
      backgroundColor: '#10998e',
      borderColor: '#10998e',
    },
    // Removed justRightButtonDisabled - no longer needed
    justRightButtonText: {
      color: '#10998e',
      fontSize: isLarge && Platform.OS === 'ios' ? 24 : isLarge ? 20 : 16,
    },
    justRightButtonTextSelected: {
      color: 'white',
    },
    // Removed justRightButtonTextDisabled - no longer needed
    
    // Info button
    infoButton: {
      position: 'absolute',
      top: 8 * heightRef,
      right: 8 * widthRef,
    },
  });
};
