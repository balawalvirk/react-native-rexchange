import { Text, ScrollView, View, Image, Pressable, BackHandler } from 'react-native';
import { useEffect } from 'react';
import { getPricePerSquareFoot } from '../../lib/helpers/calculations';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { formatMoney } from '../../lib/helpers/money';
import { safeFormatMoney, safeFormatPricePerSqft } from '../../lib/helpers/display';
import { Property } from '../../lib/models/property';
import { RextimatePriceHistory } from '../../lib/models/rextimatePriceHistory';
import tw from '../../lib/tailwind/tailwind';
import HorizontalLine from '../HorizontalLine';
interface MoreInfoProps {
  property: Property;
  currentRextimate: RextimatePriceHistory;
  close?: () => void;
}

const MoreInfo: React.FC<MoreInfoProps> = ({
  property,
  currentRextimate,
  close,
}) => {
  const isLarge = WINDOW_WIDTH > 600;
  const moreInfoTextSize = isLarge ? 'text-lg' : 'text-sm'

  // Handle Android back button to close modal
  useEffect(() => {
    const backAction = () => {
      if (close) {
        close();
        return true; // Prevent default back action
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [close]);

  return (
    <>
      {/* Swipe indicator */}
      <View style={tw`flex items-center`}>
        <Text style={tw`text-xs text-gray-500`}>Swipe down to close more info</Text>
      </View>
      <Text style={tw`p-4 ${moreInfoTextSize} text-center capitalize font-overpass600 text-purple`}>
        {property.fullListingAddress}
      </Text>
      {close && (
        <Pressable>
          <Pressable onPress={close}  style={tw`absolute w-8 h-8 -top-16 right-4`}>
            <Image
              style={tw`w-3 h-3`}
              source={require('../../assets/times_gray.png')}
            ></Image>
          </Pressable>
        </Pressable>
      )}
      <HorizontalLine />
      <ScrollView>
        <View style={tw`px-10 py-4`}>
          <View style={tw`flex flex-row m-1 w-100`}>
            <Text style={tw`flex-1 font-overpass700 ${moreInfoTextSize}`}>List Price:</Text>
            <Text style={tw`flex-1 font-overpass500 mr-14 ${moreInfoTextSize}`}>
              {safeFormatMoney(property.listPrice, 'List price not available')}
            </Text>
          </View>
          <View style={tw`flex flex-row m-1 w-100`}>
            <Text style={tw`flex-1 font-overpass700 ${moreInfoTextSize}`}>
              List Price per Sqft:
            </Text>
            <Text style={tw`flex-1 font-overpass500 mr-14 ${moreInfoTextSize}`}>
              {safeFormatPricePerSqft(property.listPrice, property.size, 'Price per sqft not available', 'Size not available')}
            </Text>
          </View>
          <View style={tw`flex flex-row m-1 w-100`}>
            <Text style={tw`flex-1 font-overpass700 ${moreInfoTextSize}`}>
              Rextimate Price per Sqft:
            </Text>
            <Text style={tw`flex-1 font-overpass500 mr-14 ${moreInfoTextSize}`}>
              {safeFormatPricePerSqft(currentRextimate?.amount, property.size, 'Rextimate per sqft not available', 'Size not available')}
            </Text>
          </View>
          <View style={tw`flex flex-row m-1 w-100`}>
            <Text style={tw`flex-1 font-overpass700 ${moreInfoTextSize}`}>Condition:</Text>

            <View style={tw`flex-1 mr-14`}>
              {property.xf_propertycondition && Array.isArray(property.xf_propertycondition) && property.xf_propertycondition.length > 0 ? (
                property.xf_propertycondition.map((condition: string) => (
                  <View key={`${property.id}-${condition}`}>
                    <Text style={tw`font-overpass500 break-all ${moreInfoTextSize}`}>{condition}</Text>
                  </View>
                ))
              ) : (
                <Text style={tw`font-overpass500 ${moreInfoTextSize}`}>No condition data available</Text>
              )}
            </View>
          </View>
          {property.features?.Lot && (
            <View style={tw`flex flex-row px-2 my-1 w-100`}>
              <Text style={tw`flex-1 font-overpass700 ${moreInfoTextSize}`}>Lot:</Text>

              <View style={tw`flex-1 mr-14`}>
                {property.features.Lot.map((lot: string) => (
                  <View
                    key={`${property.id}-${lot}`}
                    style={tw`flex flex-wrap`}
                  >
                    <Text style={tw`font-overpass500 break-all ${moreInfoTextSize}`}>{lot}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <Image
            resizeMode="contain"
            style={tw`w-20 mx-auto`}
            source={require('../../assets/gsrein_logo.png')}
          ></Image>
        </View>
      </ScrollView>
    </>
  );
};

export default MoreInfo;
