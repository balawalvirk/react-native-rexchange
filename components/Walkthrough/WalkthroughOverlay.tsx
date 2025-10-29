import React, { useMemo } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  advanceWalkthrough,
  skipWalkthrough,
} from '../../store/walkthroughSlice';
import CircleButton from '../CircleButton';
import { formatMoney } from '../../lib/helpers/money';
import { heightRef, widthRef } from '../../config/screenSizes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type WalkthroughOverlayProps = {
  isOpenHouse: boolean;
  currentRextimateAmount: number;
};

const TOOLTIP_WIDTH = Math.min(320, SCREEN_WIDTH - 32);

const WalkthroughOverlay: React.FC<WalkthroughOverlayProps> = ({
  isOpenHouse,
  currentRextimateAmount,
}) => {
  const dispatch = useAppDispatch();
  const walkthrough = useAppSelector((state: any) => state.walkthrough);
  const step = walkthrough?.steps?.[walkthrough.currentStepIndex];

  if (!walkthrough.isActive || !step) {
    return null;
  }

  // Debug: Log current step
  console.log(`Walkthrough step ${walkthrough.currentStepIndex + 1}/${walkthrough.steps.length}: ${step.targetId}`);

  // Get the actual button/component position from the registered targets
  const targetLayout = walkthrough.targets[step.targetId];
  
  // Log target positions for debugging
  if (targetLayout) {
    console.log(`Target layout for ${step.targetId}:`, targetLayout);
  }

  // Render the button based on the step
  const renderButton = () => {
    switch (step.targetId) {
      case 'home':
        return (
          <CircleButton
            style={styles.circleButtonPurple}
            imageStyle={styles.circleButtonImageSize}
            imageURL={require('../../assets/home_logo_white.png')}
            onPress={() => {}}
          />
        );
      case 'history':
        return (
          <CircleButton
            style={styles.circleButtonYellow}
            imageStyle={styles.circleButtonImageSizeFlex}
            imageURL={require('../../assets/chart_purple.png')}
            onPress={() => {}}
          />
        );
      case 'more-info':
        return (
          <Pressable>
            <View style={styles.moreInfoButton}>
              <Image
                style={styles.moreInfoIcon}
                source={require('../../assets/info_outline_purple.png')}
              />
              <Text style={styles.moreInfoText}>more info</Text>
            </View>
          </Pressable>
        );
      default:
        return null;
    }
  };

  const button = renderButton();

  const handleAdvance = () => {
    dispatch(advanceWalkthrough());
  };

  const handleSkip = () => {
    dispatch(skipWalkthrough());
  };

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleSkip} />

        {/* Render button at the same position as on the game screen */}
        {button && targetLayout && (
          <View
            pointerEvents="none"
            style={[
              styles.buttonContainer,
              step.targetId === 'more-info' && styles.moreInfoButtonContainer,
              step.targetId === 'home' && styles.homeButtonContainer,
              step.targetId === 'history' && styles.historyButtonContainer,
            ]}
          >
            <View style={styles.buttonHighlightShadow} />
            <View style={styles.buttonHighlightContent}>{button}</View>
          </View>
        )}

        {/* Tooltip */}
        <View
          style={[
            styles.tooltipContainer,
            step.targetId === 'more-info' && styles.moreInfoTooltipContainer,
            step.targetId === 'home' && styles.homeTooltipContainer,
            step.targetId === 'history' && styles.historyTooltipContainer,
          ]}
        >
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipProgress}>
              {walkthrough.currentStepIndex + 1}/{walkthrough.steps.length}
            </Text>
            <Pressable onPress={handleSkip} hitSlop={8}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.tooltipTitle}>{step.title}</Text>
          <Text style={styles.tooltipBody}>{step.description}</Text>
          <View style={styles.tooltipActions}>
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
            <Pressable onPress={handleAdvance} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 1, 1, 0.4)',
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
    right: 24,
    top: 80,
    width: 48,
    height: 48,
  },
  historyButtonContainer: {
    right: 24,
    top: 216,
    width: 48,
    height: 48,
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
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
    width: TOOLTIP_WIDTH,
  },
  moreInfoTooltipContainer: {
    left: 16,
    top: Platform.OS === 'android' ? 520 : 480,
  },
  homeTooltipContainer: {
    left: 16,
    top: 100,
  },
  historyTooltipContainer: {
    left: 16,
    top: 150,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tooltipProgress: {
    fontSize: 14,
    color: '#5d26c1',
    fontFamily: 'Overpass_600SemiBold',
  },
  closeText: {
    fontSize: 18,
    color: '#575757',
  },
  tooltipTitle: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: 'Rajdhani_700Bold',
    color: '#101828',
  },
  tooltipBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#475467',
    fontFamily: 'Overpass_400Regular',
  },
  tooltipActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#5d26c1',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontFamily: 'Overpass_600SemiBold',
    fontSize: 14,
  },
});

export default WalkthroughOverlay;
