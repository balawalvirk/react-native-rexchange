import _ from 'lodash';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { formatMoney } from '../../lib/helpers/money';
import { Position } from '../../lib/models/positions';
import { RextimatePriceHistory } from '../../lib/models/rextimatePriceHistory';
import { createOpenAPositionStyles } from './openAPositionStyles';

interface OpenAPositionProps {
  positionSinceMidnight: Position | null;
  positions: Position[];
  currentRextimate: RextimatePriceHistory;
  onOpenAPositionInfoPress: (args: any) => any;
  selectedPosition: 0 | 1 | 2 | null;
  onPress: (args: any) => any;
  isOpenHouse?: boolean;
  rextimateUpdatedAfterSubmission?: boolean;
  isProcessingSubmission?: boolean;
  fixedPriceBid?: number;
}

const OpenAPosition: React.FC<OpenAPositionProps> = ({
  positions,
  positionSinceMidnight,
  currentRextimate,
  onOpenAPositionInfoPress,
  selectedPosition,
  onPress,
  isOpenHouse,
  rextimateUpdatedAfterSubmission = false,
  isProcessingSubmission = false,
  fixedPriceBid = 0,
}) => {
  const styles = createOpenAPositionStyles();
  // Removed hasJustRight logic since we don't show properties with existing bids
  const toggleSelectedPosition = (position: 0 | 1 | 2) => {
    if (selectedPosition == position) {
      onPress(null);
    } else {
      onPress(position);
    }
  };

  // Show loading indicator while processing submission
  if (isProcessingSubmission && !isOpenHouse) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>
          Processing your submission...
        </Text>
        <Text style={styles.loadingSubText}>
          Updating Rextimate
        </Text>
      </View>
    );
  }

  // Show "Thank You" message after successful submission
  if (positionSinceMidnight && rextimateUpdatedAfterSubmission && !isOpenHouse) {
    // Use fixedPriceBid (the amount user entered) if available, otherwise fall back to position's rextimate
    const bidAmount = fixedPriceBid > 0 ? fixedPriceBid : positionSinceMidnight.rextimate;
    return (
      <View style={styles.thankYouContainer}>
        <Text style={styles.thankYouText}>
          You bid {formatMoney(bidAmount)}.
        </Text>
        <Text style={styles.thankYouSubText}>
          Come back tomorrow to bid again.
        </Text>
      </View>
    );
  }


  if (positionSinceMidnight && !isOpenHouse) {
    return (
      <View style={styles.alreadyBidContainer}>
        <Text style={styles.alreadyBidText}>
          already bid.
        </Text>
        <Text style={styles.alreadyBidSubText}>
          You can bid again tomorrow.
        </Text>
      </View>
    );
  }
  return (
    <>
      <View style={styles.valuationContainer}>
        <Text style={styles.valuationText}>
          Submit valution: {formatMoney(currentRextimate.amount)} is
        </Text>
        <View style={styles.buttonRowContainer}>
          <Pressable onPress={() => toggleSelectedPosition(0)}>
            <View
              style={[
                styles.valuationButton,
                styles.valuationButtonMarginRight,
                styles.tooLowButton,
                selectedPosition === 0 ? styles.tooLowButtonSelected : {},
              ]}
            >
              <Text
                style={[
                  styles.tooLowButtonText,
                  selectedPosition === 0 ? styles.tooLowButtonTextSelected : {},
                ]}
              >
                Too Low
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={() => toggleSelectedPosition(1)}>
            <View
              style={[
                styles.valuationButton,
                styles.valuationButtonMarginLeft,
                styles.tooHighButton,
                selectedPosition === 1 ? styles.tooHighButtonSelected : {},
              ]}
            >
              <Text
                style={[
                  styles.tooHighButtonText,
                  selectedPosition === 1 ? styles.tooHighButtonTextSelected : {},
                ]}
              >
                Too High
              </Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.justRightButtonContainer}>
          <Pressable onPress={() => toggleSelectedPosition(2)}>
            <View
              style={[
                styles.valuationButton,
                styles.justRightButton,
                selectedPosition === 2 ? styles.justRightButtonSelected : {},
              ]}
            >
              <Text
                style={[
                  styles.justRightButtonText,
                  selectedPosition === 2
                    ? styles.justRightButtonTextSelected
                    : {},
                ]}
              >
                Just Right
              </Text>
            </View>
          </Pressable>
        </View>
    
        <Pressable
          onPress={onOpenAPositionInfoPress}
          style={styles.infoButton}
        >
          <Image source={require('../../assets/info_circle_purple.png')} />
        </Pressable>
      </View>
    </>
  );
};

export default OpenAPosition;
