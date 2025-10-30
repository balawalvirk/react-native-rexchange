import { StyleSheet } from "react-native";
import { fontRef, heightRef, widthRef } from '../../config/screenSizes';
import { Platform } from "react-native";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";

export const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(1, 1, 1, 0.3)',
    },
    buttonHighlightShadow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 16,
    },
    buttonHighlightContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonContainer: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
    moreInfoButtonContainer: {
      right: Platform.OS === 'android' ? 11 : 11,
      top: Platform.OS === 'android' ? 456 : 418,
      width: 100 * widthRef,
      height: 60 * heightRef,
    },
    homeButtonContainer: {
      right: 23 * widthRef,
      top: Platform.OS === 'android' ? 88 * widthRef : 80 * widthRef,
      width: 50,
      height: 50,
    },
    historyButtonContainer: {
      right: 22 * widthRef,
      top: Platform.OS === 'android' ? 235 * widthRef : 216 * widthRef,
      width: 50,
      height: 50,
    },
    // Additional button container anchors for other steps (approximate positions)
    tooLowButtonContainer: {
      left: 16,
      bottom: 200,
      width: 120 * widthRef,
      height: 48 * heightRef,
    },
    tooHighButtonContainer: {
      left: 16 + 130 * widthRef,
      bottom: 200,
      width: 120 * widthRef,
      height: 48 * heightRef,
    },
    justRightButtonContainer: {
      left: 80 * widthRef,
      bottom: Platform.OS == 'android' ? 184 * heightRef : 180 * heightRef,
      width: 120 * widthRef,
      height: 48 * heightRef,
    },
    enterAmountButtonContainer: {
      left: 80 * widthRef,
      bottom: 200 * widthRef,
      width: 280 * widthRef,
      height: 56 * heightRef,
    },
    circleButtonPurple: {
      width: 48,
      height: 48,
      backgroundColor: '#5d26c1',
      borderRadius: 24,
    },
    circleButtonYellow: {
      width: 48,
      height: 48,
      backgroundColor: '#f1c84c',
      borderRadius: 24,
    },
    circleButtonImageSize: {
      width: 20,
      height: 20,
    },
    circleButtonImageSizeFlex: {
      width: 20,
      height: 20,
      flex: 1,
    },
    moreInfoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
      marginHorizontal: 0,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#5d26c1',
      backgroundColor: '#ffffff',
    },
    // Visual clone of the game screen "Too Low" button for the walkthrough overlay
    tooLowDemoButton: {
      height: 40 * heightRef,
      width: 120 * widthRef,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderRadius: 8,
      borderColor: '#5d26c1',
      backgroundColor: '#ffffff',
      position: 'absolute',
      left: 16,
      top: Platform.OS === 'android' ? 70 : 45
    },
    tooLowDemoButtonText: {
      color: '#5d26c1',
      fontSize: 16 * fontRef,
      fontFamily: 'Overpass_600SemiBold',
    },
    tooHighwDemoButton: {
      height: 40 * heightRef,
      width: 120 * widthRef,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderRadius: 8,
      borderColor: '#f19948',
      backgroundColor: '#ffffff',
      position: 'absolute',
      left: 14 * widthRef,
      top: Platform.OS === 'android' ? 68 : 43
    },
    tooHighDemoButtonText: {
      color: '#f19948',
      fontSize: 16 * fontRef,
      fontFamily: 'Overpass_600SemiBold',
    },
    JustRightDemoButton:{
        height: 40 * heightRef,
        width: 120 * widthRef,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#36827B',
        backgroundColor: '#ffffff',
        position: 'absolute',
        left: 14 * widthRef,
        top: Platform.OS === 'android' ? 90 : 53
    },
    JustRightDemoButtonText:{
        color: '#36827B',
        fontSize: 16 * fontRef,
        fontFamily: 'Overpass_600SemiBold',
    },
    EnterAmountDemoButton:{
        height: 60 * heightRef,
        width: 350 * widthRef,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#5d26c1',
        backgroundColor: '#ffffff',
    },
    EnterAmountDemoButtonText:{
        color: '#5d26c1',
        fontSize: 20 * fontRef,
        fontFamily: 'Overpass_500',
    },
    tooLowButton: {
      width: 120,
      height: 48,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#10998D',
      backgroundColor: 'transparent',
    },
    moreInfoIcon: {
      marginRight: 4,
      width: 12,
      height: 12,
    },
    moreInfoText: {
      fontSize: 12,
      color: '#5d26c1',
      fontFamily: 'Overpass_600SemiBold',
    },
    tooltipContainer: {
      position: 'absolute',
      paddingVertical: 10 * heightRef,
      paddingHorizontal: 12 * widthRef,
      borderRadius: 12,
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 12,
      width: 224 * widthRef,
    },
    // Arrow (triangle-like) that points from the tooltip to the highlighted control
    arrowBase: {
      position: 'absolute',
      width: 12 * widthRef,
      height: 12 * heightRef,
      backgroundColor: '#ffffff',
      transform: [{ rotate: '45deg' }],
    },
    // Common placements relative to tooltip container
    arrowTopCenter: {
      top: -6 * heightRef,
      left: 24 * widthRef,
    },
    arrowRightCenter: {
      right: -6 * widthRef,
      top: 24 * heightRef,
    },
    arrowBottomCenter: {
      bottom: -6 * heightRef,
      left: 24 * widthRef,
    },
    arrowLeftCenter: {
      left: -6 * widthRef,
      top: 24 * heightRef,
    },
    moreInfoTooltipContainer: {
      right: 60 * widthRef,
      top: Platform.OS === 'android' ? 520 : 480,
    },
    moreInfoArrow: {
      // Tooltip for more-info sits below the target; arrow points upward
      top: -6 * heightRef,
      right: 40 * widthRef,
    },
    homeTooltipContainer: {
      right: 90 * widthRef,
      top: 90 * widthRef,
    },
    homeArrow: {
      right: -6 * widthRef,
      top: 24 * heightRef,
    },
    historyTooltipContainer: {
      right: 90 * widthRef,
      top: 240 * heightRef,
    },
    historyArrow: {
      right: -6 * widthRef,
      top: 24 * heightRef,
    },
    // Tooltip positions for additional steps
    tooLowTooltipContainer: {
      right: 16 * widthRef,
      bottom: Platform.OS === 'android' ? 200 * heightRef : 230 * heightRef,

    },
    tooLowArrow: {
      bottom: -6 * heightRef,
      left: 24 * widthRef,
    },
    tooHighTooltipContainer: {
      left: 16 * widthRef,
      bottom: Platform.OS === 'android' ? 200 * heightRef : 230 * heightRef,
    },
    tooHighArrow: {
      bottom: -6 * heightRef,
      right: 24 * widthRef,
    },
    justRightTooltipContainer: {
      right: 16 * widthRef,
      bottom: Platform.OS === 'android' ? 160 * heightRef : 190 * heightRef,
    },
    justRightArrow: {
      bottom: -6 * heightRef,
      left: 24 * widthRef,
    },
    enterAmountTooltipContainer: {
      left: 100 * widthRef,
      bottom: 280 * heightRef,
    },
    enterAmountArrow: {
      bottom: -6 * heightRef,
      left: 24 * widthRef,
    },
    tooltipHeader: {
      flexDirection: 'row',
    //   alignItems: 'center',
      justifyContent: 'space-between',
    },
    tooltipProgress: {
      fontSize: 10 * fontRef,
      color: '#121212',
      fontFamily: 'Overpass_600SemiBold',
    },
    closeText: {
      fontSize: 14 * fontRef,
      color: '#575757',
    },
    tooltipTitle: {
      fontSize: 12 * fontRef,
      fontFamily: 'Rajdhani_700Bold',
      color: '#101828',
      marginRight: 10 * widthRef
    },
    tooltipBody: {
      fontSize: 10 * fontRef,
      color: '#475467',
      fontFamily: 'Overpass_400Regular',
      marginRight: 10 * widthRef
    },
    tooltipActions: {
      marginTop: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    skipButton: {
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginRight: 12,
    },
    skipButtonText: {
      color: '#475467',
      fontFamily: 'Overpass_500Medium',
    },
    primaryButton: {
      paddingHorizontal: 16 * widthRef,
      paddingVertical: 6 * heightRef,
      borderRadius: 20,
      backgroundColor: '#10998D',
    },
    primaryButtonText: {
      color: '#ffffff',
      fontFamily: 'Overpass_600SemiBold',
      fontSize: 10 * fontRef,
    },
  });
  
