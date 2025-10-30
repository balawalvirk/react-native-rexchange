import { Platform, StyleSheet } from 'react-native';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { fullWidth, fullHeight, heightRef, widthRef, fontRef } from '../../config/screenSizes';

// Create responsive styles using screenSizes
export const createGameStyles = () => {
  const isLarge = WINDOW_WIDTH > 600;
  
  return StyleSheet.create({
    // Main container
    mainContainer: {
      flex: 1,
    },
    
    // Loading container
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Loading text
    loadingText: {
      marginVertical: 16,
      fontSize: 18,
      fontFamily: 'Rajdhani_700Bold',
      color: '#5d26c1',
    },
    
    // Loading image
    loadingImage: {
      marginVertical: -16,
      height: '33.33%',
    },
    
    // Empty state container
    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    
    // Empty state text
    emptyStateText: {
      marginHorizontal: 16,
      fontSize: 18,
      textAlign: 'center',
      fontFamily: 'Overpass_500Medium',
      color: '#575757',
    },
    
    // Empty state button
    emptyStateButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: 16,
      marginVertical: 16,
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 8,
      borderColor: '#10998e',
      backgroundColor: '#10998e',
    },
    
    // Empty state button text
    emptyStateButtonText: {
      fontSize: 16,
      color: 'white',
      fontFamily: 'Overpass_500Medium',
    },
    
    // Property item container
    propertyItemContainer: {
      height: fullHeight,
      backgroundColor: '#fff',
    },
    
    // Footer container
    footerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      height: fullHeight,
    },
    
    // Footer title
    footerTitle: {
      fontSize: 20,
      color: '#575757',
      fontFamily: 'Rajdhani_700Bold',
    },
    
    // Footer description
    footerDescription: {
      paddingHorizontal: 40,
      marginVertical: 16,
      lineHeight: 24,
      textAlign: 'center',
      color: '#575757',
      fontFamily: 'Overpass_500Medium',
    },
    
    // Footer button
    footerButton: {
      // flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: 16,
      margin: 16,
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 8,
      borderColor: '#10998e',
      backgroundColor: '#10998e',
    },
    
    // Footer button with margin
    footerButtonWithMargin: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: 16,
      marginHorizontal: 16,
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 8,
      borderColor: '#10998e',
      backgroundColor: '#10998e',
    },
    
    // Footer button text
    footerButtonText: {
      fontSize: 16,
      color: 'white',
      fontFamily: 'Overpass_500Medium',
    },
    
    // Skipping overlay
    skippingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 100,
    },
    walkthroughPromptContainer: {
      position: 'absolute',
      left: 16 * widthRef,
      right: 16 * widthRef,
      bottom: 32 * heightRef,
      paddingHorizontal: 16 * widthRef,
      paddingVertical: 14 * heightRef,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
      zIndex: 120,
    },
    walkthroughPromptTextContainer: {
      flex: 1,
      paddingRight: 12 * widthRef,
    },
    walkthroughPromptTitle: {
      fontFamily: 'Rajdhani_700Bold',
      fontSize: 16 * fontRef,
      color: '#1a1a1a',
    },
    walkthroughPromptSubtitle: {
      marginTop: 4 * heightRef,
      fontFamily: 'Overpass_400Regular',
      fontSize: 12 * fontRef,
      color: '#4b5563',
    },
    walkthroughPromptActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    walkthroughPromptButton: {
      paddingHorizontal: 14 * widthRef,
      paddingVertical: 8 * heightRef,
      borderRadius: 999,
      borderWidth: 1,
    },
    walkthroughPromptResumeButton: {
      borderColor: '#5d26c1',
      backgroundColor: '#5d26c1',
    },
    walkthroughPromptIgnoreButton: {
      borderColor: '#d1d5db',
      backgroundColor: '#ffffff',
      marginLeft: 8 * widthRef,
    },
    walkthroughPromptResumeText: {
      fontFamily: 'Overpass_600SemiBold',
      fontSize: 12 * fontRef,
      color: '#ffffff',
    },
    walkthroughPromptIgnoreText: {
      fontFamily: 'Overpass_500Medium',
      fontSize: 12 * fontRef,
      color: '#4b5563',
    },
    
    // Bottom sheet container
    bottomSheetContainer: {
      height: '100%',
      marginBottom: 100,
    },
    
    // Bottom sheet scroll view
    bottomSheetScrollView: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    bottomSheetCloseButtonContainer: {
    // backgroundColor: 'red',
     position: 'absolute',
      width: 24 * widthRef,
      height: 24 * heightRef,
      top: Platform.OS === 'android' ? 18 * heightRef : 14 * heightRef,
      right: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Bottom sheet title
    bottomSheetTitle: {
      padding: 16,
      textAlign: 'center',
      textTransform: 'capitalize',
      fontFamily: 'Overpass_600SemiBold',
      color: '#5d26c1',
    },
    
    // Bottom sheet close button
    bottomSheetCloseButton: {
      // position: 'absolute',
      // width: 12,
      // height: 12,
      // top: -32,
      // right: 16,
      width: 14 * widthRef,
      height: 14 * heightRef,
    },
    
    // Bottom sheet text
    bottomSheetText: {
      marginVertical: 16,
      fontSize: 16,
      fontFamily: 'Overpass_400Regular',
    },
    
    // Bottom sheet italic text
    bottomSheetItalicText: {
      fontStyle: 'italic',
    },
    
    // Bottom sheet bold text
    bottomSheetBoldText: {
      fontFamily: 'Overpass_500Medium',
    },
    
    // Bottom sheet button container
    bottomSheetButtonContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      width: '100%',
      height: 128,
      padding: 16,
      marginTop: 'auto',
      backgroundColor: 'white',
    },
    
    // Bottom sheet button
    bottomSheetButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      backgroundColor: '#10998e',
      height: 60,
    },
    
    // Bottom sheet button text
    bottomSheetButtonText: {
      fontSize: 18,
      textAlign: 'center',
      color: 'white',
      fontFamily: 'Overpass_500Medium',
    },
    
    // Test buttons container (development only)
    testButtonsContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      flexDirection: 'column',
      gap: 8,
      zIndex: 1000,
    },
    
    // Test button (development only)
    testButton: {
      backgroundColor: '#5d26c1',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    
    // Test button secondary
    testButtonSecondary: {
      backgroundColor: '#10998e',
    },
    
    // Test button text
    testButtonText: {
      color: 'white',
      fontSize: 10,
      fontFamily: 'Overpass_500Medium',
    },
  });
};
