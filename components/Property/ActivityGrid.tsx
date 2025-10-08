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
import tw from '../../lib/tailwind/tailwind';

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
  const isLarge = WINDOW_WIDTH > 600;
  const rextimateInfoTextSize = isLarge ? 'text-xl py-2' : 'text-xs';
  const rextimateValueText =
    isLarge && isOpenHouse
      ? 'text-3xl py-2'
      : isLarge
      ? 'text-3xl'
      : 'text-2xl';

  return (
    <View style={tw`flex flex-row flex-wrap mb-2 -mt-2`}>
      <View style={tw`pb-1 pl-4 pr-1 flex-50`}>
        <View
          style={tw`flex items-center justify-center w-full p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
        >
          <Text
            style={tw`${rextimateInfoTextSize} uppercase font-overpass700 text-darkGray`}
          >
            Rextimate Change
          </Text>
          <Text
            style={[
              property.listPrice > currentRextimate.amount
                ? tw`text-red`
                : tw`text-green`,
              tw`${rextimateValueText} font-rajdhani700`,
            ]}
          >
            {safeFormatRextimateChange(property.listPrice, currentRextimate?.amount)}
          </Text>
        </View>
      </View>
      <View style={tw`pb-1 pl-1 pr-4 flex-50`}>
        <View
          style={tw`flex items-center justify-center w-full p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
        >
          <Text
            style={tw`${rextimateInfoTextSize} uppercase font-overpass700 text-darkGray`}
          >
            Days on Rexchange
          </Text>
          <Text style={tw`${rextimateValueText} font-rajdhani700`}>
            {getDaysOnRexchange(property.dateCreated)}
          </Text>
        </View>
      </View>
      {!isOpenHouse && (
        <>
          <View style={tw`pt-1 pl-4 pr-1 flex-50`}>
            <View
              style={tw`flex items-center justify-center p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
            >
              <Text
                style={tw`${rextimateInfoTextSize} uppercase font-overpass700 text-darkGray`}
              >
                Your Valuations
              </Text>
              {positions.length > 0 ? (
                <Pressable onPress={onMyPositionsPress}>
                  <View
                    style={[
                      tw`flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md border-1 border-borderGray`,
                      {
                        shadowColor: 'black',
                        shadowRadius: 4,
                        shadowOffset: {
                          width: 0,
                          height: 0,
                        },
                        shadowOpacity: 0.1,
                      },
                    ]}
                  >
                    <Text style={tw`${rextimateValueText} font-rajdhani700`}>
                      {positions?.length || 0}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <Text style={tw`${rextimateValueText} font-rajdhani700`}>
                  0
                </Text>
              )}
            </View>
          </View>
          <View style={tw`pt-1 pl-1 pr-4 flex-50`}>
            <View
              style={tw`flex items-center justify-center p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
            >
              <Text
                style={tw`${rextimateInfoTextSize} uppercase font-overpass700 text-darkGray`}
              >
                Your Gains/Losses
              </Text>

              <Text
                style={[
                  equity < 0 ? tw`text-red` : tw`text-green`,
                  tw`${rextimateValueText} font-rajdhani700`,
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
