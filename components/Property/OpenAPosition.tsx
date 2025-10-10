import _ from "lodash";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { WINDOW_WIDTH } from "../../lib/helpers/dimensions";
import { formatMoney } from "../../lib/helpers/money";
import { Position } from "../../lib/models/positions";
import { RextimatePriceHistory } from "../../lib/models/rextimatePriceHistory";
import tw from "../../lib/tailwind/tailwind";

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
  const hasJustRight = Boolean(_.some(positions, (pos) => pos.type == 2));
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
      <View style={tw` mt-4 flex items-center justify-center`}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={tw`p-4 text-lg text-center text-purple font-rajdhani700`}>
          Processing your submission...
        </Text>
        <Text style={tw`text-sm text-center text-darkGray font-overpass400`}>
          Updating Rextimate
        </Text>
      </View>
    );
  }

  // Show "Thank You" message after successful submission
  if (
    positionSinceMidnight &&
    rextimateUpdatedAfterSubmission &&
    !isOpenHouse
  ) {
    const bidAmount = fixedPriceBid || positionSinceMidnight.rextimate;
    return (
      <View style={tw`flex items-center justify-center`}>
        <Text style={tw`p-10 text-xl text-center text-green font-rajdhani700`}>
          You bid {formatMoney(bidAmount)}.
        </Text>
        <Text style={tw`text-sm text-center text-darkGray font-overpass400`}>
          Come back tomorrow to bid again.
        </Text>
      </View>
    );
  }

  if (positionSinceMidnight && !isOpenHouse) {
    return (
      <View style={tw`flex items-center justify-center`}>
        <Text style={tw`p-10 text-xl text-center text-purple font-rajdhani700`}>
          already bid.
        </Text>
        <Text style={tw`text-sm text-center text-darkGray font-overpass400`}>
          You can bid again tomorrow.
        </Text>
      </View>
    );
  }
  const isLarge = WINDOW_WIDTH > 600;
  const valuationTextSize =
    isLarge && isOpenHouse ? "text-3xl pt-8" : isLarge ? "text-2xl" : "text-lg";
  const valuationButtonTextSize =
    isLarge && isOpenHouse ? "text-2xl" : isLarge ? "text-xl" : "text-base";
  const valuationButton =
    isLarge && isOpenHouse
      ? "py-1 px-2 m-3"
      : isLarge
      ? "py-1 px-2 m-1"
      : "px-4 py-0.5";
  const valuationInfo =
    isLarge && isOpenHouse ? "h-[250px]" : isLarge ? "h-[175px]" : "";
  return (
    <>
      <View
        style={tw`relative ${valuationInfo} p-4 mx-4 border-1 border-borderGray flex items-center justify-center`}
      >
        <Text
          style={tw`${valuationTextSize} text-center font-rajdhani600 text-black my-0.5`}
        >
          Submit valution: {formatMoney(currentRextimate.amount)} is
        </Text>
        <View style={[tw`flex flex-row items-center justify-center`]}>
          <Pressable onPress={() => toggleSelectedPosition(0)}>
            <View
              style={[
                tw`${valuationButton} mr-1 border-2 rounded-lg text-purple border-purple`,
                selectedPosition === 0
                  ? tw`text-white rounded-lg bg-purple`
                  : {},
              ]}
            >
              <Text
                style={[
                  tw`${valuationButtonTextSize}`,
                  selectedPosition === 0 ? tw`text-white` : tw`text-purple`,
                ]}
              >
                Too Low
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={() => toggleSelectedPosition(1)}>
            <View
              style={[
                tw`text-orange border-2 border-orange rounded-lg ml-1 ${valuationButton}`,
                selectedPosition === 1
                  ? tw`text-white rounded-lg bg-orange`
                  : {},
              ]}
            >
              <Text
                style={[
                  tw`${valuationButtonTextSize}`,
                  selectedPosition === 1 ? tw`text-white` : tw`text-orange`,
                ]}
              >
                Too High
              </Text>
            </View>
          </Pressable>
        </View>
        <View style={tw`flex items-center justify-center my-1`}>
          <Pressable
            onPress={() =>
              !hasJustRight || isOpenHouse ? toggleSelectedPosition(2) : null
            }
          >
            <View
              style={[
                tw`border-2 border-green rounded-lg ${valuationButton}`,
                selectedPosition === 2
                  ? tw`text-white border-2 rounded-lg bg-green border-green`
                  : hasJustRight && !isOpenHouse
                  ? tw`border-borderGray`
                  : {},
              ]}
            >
              <Text
                style={[
                  tw`${valuationButtonTextSize}`,
                  selectedPosition === 2
                    ? tw`text-white`
                    : hasJustRight && !isOpenHouse
                    ? tw`text-borderGray`
                    : tw`text-green`,
                ]}
              >
                Just Right
              </Text>
            </View>
          </Pressable>
        </View>

        <Pressable
          onPress={onOpenAPositionInfoPress}
          style={tw`absolute top-2 right-2`}
        >
          <Image source={require("../../assets/info_circle_purple.png")} />
        </Pressable>
      </View>
    </>
  );
};

export default OpenAPosition;
