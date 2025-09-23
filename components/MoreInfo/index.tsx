import { Text, ScrollView, View, Image, Pressable } from 'react-native';
import { getPricePerSquareFoot } from '../../lib/helpers/calculations';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { formatMoney } from '../../lib/helpers/money';
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
  return (
    <>
      <Text style={tw`p-4 ${moreInfoTextSize} text-center capitalize font-overpass600 text-purple`}>
        {property.fullListingAddress}
      </Text>
      {close && (
        <Pressable onPress={close}>
          <View style={tw`absolute w-8 h-8 -top-8 right-4`}>
            <Image
              style={tw`w-3 h-3`}
              source={require('../../assets/times_gray.png')}
            ></Image>
          </View>
        </Pressable>
      )}
      <HorizontalLine />
      <ScrollView>
        <View style={tw`px-10 py-4`}>
          <View style={tw`flex flex-row m-1 w-100`}>
            <Text style={tw`flex-1 font-overpass700 ${moreInfoTextSize}`}>List Price:</Text>
            <Text style={tw`flex-1 font-overpass500 mr-14 ${moreInfoTextSize}`}>
              {formatMoney(property.listPrice)}
            </Text>
          </View>
          <View style={tw`flex flex-row m-1 w-100`}>
            <Text style={tw`flex-1 font-overpass700 ${moreInfoTextSize}`}>
              List Price per Sqft:
            </Text>
            <Text style={tw`flex-1 font-overpass500 mr-14 ${moreInfoTextSize}`}>
              {getPricePerSquareFoot(property.listPrice, property.size)}
            </Text>
          </View>
          <View style={tw`flex flex-row m-1 w-100`}>
            <Text style={tw`flex-1 font-overpass700 ${moreInfoTextSize}`}>
              Rextimate Price per Sqft:
            </Text>
            <Text style={tw`flex-1 font-overpass500 mr-14 ${moreInfoTextSize}`}>
              {getPricePerSquareFoot(currentRextimate.amount, property.size)}
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
