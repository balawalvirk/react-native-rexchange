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

  // Compute dynamic positions using the measured target layout
  const { highlightStyle, tooltipPositionStyle, arrowDynamicStyle } = useMemo(() => {
    if (!targetLayout) {
      return {
        highlightStyle: undefined,
        tooltipPositionStyle: undefined,
        arrowDynamicStyle: undefined,
      } as any;
    }

    const padding = 6; // visual padding around the target highlight
    const highlight = {
      position: 'absolute' as const,
      top: Math.max(0, targetLayout.y - padding),
      left: Math.max(0, targetLayout.x - padding),
      width: Math.min(SCREEN_WIDTH, targetLayout.width + padding * 2),
      height: targetLayout.height + padding * 2,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#5d26c1',
      backgroundColor: 'transparent',
    };

    // Prefer placing tooltip below the target, otherwise above
    const placeBelow = targetLayout.y + targetLayout.height + 120 < SCREEN_HEIGHT; // heuristic
    const tooltipX = Math.min(
      Math.max(targetLayout.x + targetLayout.width / 2 - TOOLTIP_WIDTH / 2, 16),
      SCREEN_WIDTH - TOOLTIP_WIDTH - 16
    );
    const tooltipPosition = placeBelow
      ? { position: 'absolute' as const, top: targetLayout.y + targetLayout.height + 12, left: tooltipX }
      : { position: 'absolute' as const, top: Math.max(16, targetLayout.y - 120), left: tooltipX };

    const arrowLeft = targetLayout.x + targetLayout.width / 2 - tooltipX - 6; // 6 ~= half arrow size
    const arrow = placeBelow
      ? { position: 'absolute' as const, top: -6, left: Math.max(12, Math.min(TOOLTIP_WIDTH - 24, arrowLeft)) }
      : { position: 'absolute' as const, bottom: -6, left: Math.max(12, Math.min(TOOLTIP_WIDTH - 24, arrowLeft)) };

    return { highlightStyle: highlight, tooltipPositionStyle: tooltipPosition, arrowDynamicStyle: arrow };
  }, [targetLayout]);

  const handleAdvance = () => {
    dispatch(advanceWalkthrough());
  };

  const handleDismiss = () => {
    dispatch(dismissWalkthrough());
  };

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => { /* backdrop absorbs taps */ }} />

        {/* Highlight real target (no duplicate controls) */}
        {targetLayout && (
          <View pointerEvents="none" style={highlightStyle} />
        )}

        {/* Tooltip */}
        {targetLayout && (
        <View style={[styles.tooltipContainer, tooltipPositionStyle, { width: TOOLTIP_WIDTH }]}>        
          {/* Arrow pointer */}
          <View
            pointerEvents="none"
            style={[
              styles.arrowBase,
              arrowDynamicStyle,
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
        </View>)}
      </View>
    </Modal>
  );
};


export default WalkthroughOverlay;
