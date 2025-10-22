import { Platform, StyleSheet } from 'react-native';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { fullWidth, fullHeight, heightRef, widthRef, fontRef } from '../../config/screenSizes';

// Create responsive styles using screenSizes
export const createDetailsStyles = (isOpenHouse: boolean) => {
  const isLarge = WINDOW_WIDTH > 600;
  
  return StyleSheet.create({
    // Main container
    mainContainer: {
      padding: 16 * widthRef,
    },
    
    // Courtesy text
    courtesyText: {
      color: 'black',
      fontFamily: 'Overpass_400Regular',
      textDecorationLine: 'underline',
      fontSize: isLarge && isOpenHouse ? 18 : isLarge ? 20 : 12,
      marginTop: isLarge && isOpenHouse ? -8 : isLarge ? -8 : -8,
      marginBottom: isLarge ? 0 : 2,
    },
    
    // Address text
    addressText: {
      textDecorationLine: 'underline',
      textTransform: 'capitalize',
      fontFamily: 'Overpass_400Regular',
      fontSize: isLarge ? 24 : 14,
    },
    
    // Rextimate container
    rextimateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    
    // Rextimate text
    rextimateText: {
      fontSize: isLarge && isOpenHouse ? 36 : isLarge ? 48 : 30,
      paddingVertical: isLarge && isOpenHouse ? 8 : isLarge ? 16 : 0,
      color: '#5d26c1',
      fontFamily: 'Rajdhani_700Bold',
    },
    
    // Crown container
    crownContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    // Crown image
    crownImage: {
      width: isLarge ? 24 : 16,
      height: isLarge ? 24 : 16,
    },
    
    // Current/Final text
    currentText: {
      marginLeft: 4,
      fontSize: isLarge ? 24 : 18,
      textTransform: 'uppercase',
      color: '#5d26c1',
      fontFamily: 'Rajdhani_700Bold',
    },
    
    // Sale price text
    salePriceText: {
      color: '#575757',
      fontFamily: 'Overpass_600SemiBold',
    },
    
    // Details container
    detailsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: isLarge && isOpenHouse ? -8 : isLarge ? -16 : 0,
      marginBottom: isLarge && isOpenHouse ? 4 : isLarge ? 0 : 0,
    },
    
    // Property feature container
    featureContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    // Circle button styles
    circleButton: {
      width: isLarge ? 64 : 24,
      height: isLarge ? 64 : 24,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      backgroundColor: '#fafafa',
      borderRadius: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleButtonWithMargin: {
      width: isLarge ? 64 : 24,
      height: isLarge ? 64 : 24,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      backgroundColor: '#fafafa',
      borderRadius: 42,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    
    // Circle button image
    circleButtonImage: {
      width: isLarge ? 20 : 12,
      height: isLarge ? 20 : 12,
    },
    
    // Feature text
    featureText: {
      marginLeft: isLarge ? 16 : 4,
      fontSize: isLarge ? 14 : 10,
      fontFamily: 'Overpass_500Medium',
      color: '#575757',
    },
    
    // More info button
    moreInfoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 4,
      marginHorizontal: 0,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#5d26c1',
    },
    
    // More info icon
    moreInfoIcon: {
      marginRight: 4,
      width: 12,
      height: 12,
    },
    
    // More info text
    moreInfoText: {
      fontSize: isLarge ? 18 : 12,
      color: '#5d26c1',
      fontFamily: 'Overpass_600SemiBold',
    },
    
    // Horizontal line container
    horizontalLineContainer: {
      marginVertical: 4 * heightRef,
    },
  });
};
