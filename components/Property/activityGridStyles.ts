import { Platform, StyleSheet } from 'react-native';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { fullWidth, fullHeight, heightRef, widthRef, fontRef } from '../../config/screenSizes';

// Create responsive styles using screenSizes
export const createActivityGridStyles = (isOpenHouse: boolean) => {
  const isLarge = WINDOW_WIDTH > 600;
  
  return StyleSheet.create({
    // Main container
    mainContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8 * heightRef,
      marginTop: -8 * heightRef,
    },
    
    // Grid item containers - using flex-50 equivalent
    gridItemLeft: {
      paddingBottom: 4 * heightRef,
      paddingLeft: 16 * widthRef,
      paddingRight: 4 * widthRef,
      width: '50%',
    },
    gridItemRight: {
      paddingBottom: 4 * heightRef,
      paddingLeft: 4 * widthRef,
      paddingRight: 16 * widthRef,
      width: '50%',
    },
    gridItemLeftBottom: {
      paddingTop: 4 * heightRef,
      paddingLeft: 16 * widthRef,
      paddingRight: 4 * widthRef,
      width: '50%',
    },
    gridItemRightBottom: {
      paddingTop: 4 * heightRef,
      paddingLeft: 4 * widthRef,
      paddingRight: 16 * widthRef,
      width: '50%',
    },
    
    // Card containers
    cardContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: 8 * widthRef,
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 6 * widthRef,
      backgroundColor: '#fafafa',
      borderColor: '#E5E5E5',
      minHeight: 60 * heightRef,
    },
    
    // Text styles
    rextimateInfoText: {
      textTransform: 'uppercase',
      fontFamily: 'Overpass_700Bold',
      color: '#575757',
      fontSize: isLarge ? 20 : 12,
      paddingVertical: isLarge ? 8 : 0,
      textAlign: 'center',
    },
    
    rextimateValueText: {
      fontFamily: 'Rajdhani_700Bold',
      fontSize: isLarge && isOpenHouse ? 30 : isLarge ? 30 : 24,
      paddingVertical: isLarge && isOpenHouse ? 8 : isLarge ? 0 : 0,
      textAlign: 'center',
    },
    
    // Color variants
    textRed: {
      color: '#ca322f',
    },
    textGreen: {
      color: '#10998e',
    },
    
    // Button container for valuations
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32 * widthRef,
      height: 32 * widthRef,
      backgroundColor: 'white',
      borderRadius: 16 * widthRef,
      shadowColor: 'black',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#E5E5E5',
    },
    
    // Button text
    buttonText: {
      fontFamily: 'Rajdhani_700Bold',
      fontSize: isLarge && isOpenHouse ? 30 : isLarge ? 30 : 24,
      paddingVertical: isLarge && isOpenHouse ? 8 : isLarge ? 0 : 0,
      textAlign: 'center',
    },
  });
};
