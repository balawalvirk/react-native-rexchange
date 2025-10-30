import React, { useMemo } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  advanceWalkthrough,
  dismissWalkthrough,
} from '../../store/walkthroughSlice';
import CircleButton from '../CircleButton';
import { formatMoney } from '../../lib/helpers/money';
import { fontRef, heightRef, widthRef } from '../../config/screenSizes';
import { styles } from './styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type WalkthroughOverlayProps = {
  isOpenHouse: boolean;
  currentRextimateAmount: number;
};


// const TOOLTIP_WIDTH = Math.min(320, SCREEN_WIDTH - 32);
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
      case 'too-low':
        return (
          <View style={styles.tooLowDemoButton}>
            <Text style={styles.tooLowDemoButtonText}>Too Low</Text>
          </View>
        );
      case 'too-high':
        return (
          <View style={styles.tooHighwDemoButton}>
          <Text style={styles.tooHighDemoButtonText}>Too High</Text>
        </View>
        );
      case 'just-right':
        return (
          <View style={styles.JustRightDemoButton}>
          <Text style={styles.JustRightDemoButtonText}>Just Right</Text>
        </View>
        );
      case 'enter-amount':
        return (
          <View style={styles.EnterAmountDemoButton}>
            <Text style={styles.EnterAmountDemoButtonText}>Enter Full Amount</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const button = renderButton();

  const handleAdvance = () => {
    dispatch(advanceWalkthrough());
  };

  const handleDismiss = () => {
    dispatch(dismissWalkthrough());
  };

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={StyleSheet.absoluteFill} />

        {/* Render button at the same position as on the game screen */}
        {button && (
          <View
            pointerEvents="none"
            style={[
              styles.buttonContainer,
              step.targetId === 'more-info' && styles.moreInfoButtonContainer,
              step.targetId === 'home' && styles.homeButtonContainer,
              step.targetId === 'history' && styles.historyButtonContainer,
              step.targetId === 'too-low' && styles.tooLowButtonContainer,
              step.targetId === 'too-high' && styles.tooHighButtonContainer,
              step.targetId === 'just-right' && styles.justRightButtonContainer,
              step.targetId === 'enter-amount' && styles.enterAmountButtonContainer,
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
            step.targetId === 'too-low' && styles.tooLowTooltipContainer,
            step.targetId === 'too-high' && styles.tooHighTooltipContainer,
            step.targetId === 'just-right' && styles.justRightTooltipContainer,
            step.targetId === 'enter-amount' && styles.enterAmountTooltipContainer,
          ]}
        >
          {/* Arrow pointer */}
          <View
            pointerEvents="none"
            style={[
              styles.arrowBase,
              step.targetId === 'more-info' && styles.moreInfoArrow,
              step.targetId === 'home' && styles.homeArrow,
              step.targetId === 'history' && styles.historyArrow,
              step.targetId === 'too-low' && styles.tooLowArrow,
              step.targetId === 'too-high' && styles.tooHighArrow,
              step.targetId === 'just-right' && styles.justRightArrow,
              step.targetId === 'enter-amount' && styles.enterAmountArrow,
            ]}
          />
          <View style={styles.tooltipHeader}>
        
          <Text style={styles.tooltipTitle}>{step.title}</Text>
          <Pressable onPress={handleDismiss} hitSlop={8}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          
          <Text style={styles.tooltipBody}>{step.description}</Text>
          <View style={styles.tooltipActions}>
          <Text style={styles.tooltipProgress}>
              {walkthrough.currentStepIndex + 1}/{walkthrough.steps.length}
            </Text>
            <Pressable onPress={handleAdvance} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};


export default WalkthroughOverlay;
