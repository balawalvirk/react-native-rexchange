import { View, Text, Pressable } from 'react-native';
import {
  getDaysOnRexchange,
  getRextimateChange,
} from '../../lib/helpers/calculations';
import { safeFormatRextimateChange } from '../../lib/helpers/display';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { formatMoney } from '../../lib/helpers/money';
import { Position } from '../../lib/models/positions';
import { Property } from '../../lib/models/property';
import { RextimatePriceHistory } from '../../lib/models/rextimatePriceHistory';
import { createActivityGridStyles } from './activityGridStyles';

interface ActivityGridProps {
  property: Property;
  currentRextimate: RextimatePriceHistory;
  positions: Position[];
  onMyPositionsPress: (args: any) => any;
  equity: number;
  isOpenHouse: boolean;
}

const ActivityGrid: React.FC<ActivityGridProps> = ({
  property,
  currentRextimate,
  positions,
  onMyPositionsPress,
  equity,
  isOpenHouse,
}) => {
  const styles = createActivityGridStyles(isOpenHouse);
  const isLarge = WINDOW_WIDTH > 600;

  return (
    <View style={styles.mainContainer}>
      <View style={styles.gridItemLeft}>
        <View style={styles.cardContainer}>
          <Text style={styles.rextimateInfoText}>
            Rextimate Change
          </Text>
          <Text
            style={[
              property.listPrice > currentRextimate.amount
                ? styles.textRed
                : styles.textGreen,
              styles.rextimateValueText,
            ]}
          >
            {safeFormatRextimateChange(property.listPrice, currentRextimate?.amount)}
          </Text>
        </View>
      </View>
      <View style={styles.gridItemRight}>
        <View style={styles.cardContainer}>
          <Text style={styles.rextimateInfoText}>
            Days on Rexchange
          </Text>
          <Text style={styles.rextimateValueText}>
            {getDaysOnRexchange(property.dateCreated)}
          </Text>
        </View>
      </View>
      {!isOpenHouse && (
        <>
          <View style={styles.gridItemLeftBottom}>
            <View style={styles.cardContainer}>
              <Text style={styles.rextimateInfoText}>
                Your Valuations
              </Text>
              {positions.length > 0 ? (
                <Pressable onPress={onMyPositionsPress}>
                  <View style={styles.buttonContainer}>
                    <Text style={styles.buttonText}>
                      {positions?.length || 0}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <Text style={styles.rextimateValueText}>
                  0
                </Text>
              )}
            </View>
          </View>
          <View style={styles.gridItemRightBottom}>
            <View style={styles.cardContainer}>
              <Text style={styles.rextimateInfoText}>
                Your Gains/Losses
              </Text>
              <Text
                style={[
                  equity < 0 ? styles.textRed : styles.textGreen,
                  styles.rextimateValueText,
                ]}
              >
                {formatMoney(equity)}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default ActivityGrid;
