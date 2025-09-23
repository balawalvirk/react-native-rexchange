import { View, Text, Pressable, Image } from 'react-native';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';

import { formatMoney } from '../../lib/helpers/money';
import { Property } from '../../lib/models/property';
import { RextimatePriceHistory } from '../../lib/models/rextimatePriceHistory';
import tw from '../../lib/tailwind/tailwind';
import CircleButton from '../CircleButton';
import HorizontalLine from '../HorizontalLine';

interface DetailsProps {
  property: Property;
  onAddressPress: (args: any) => any;
  currentRextimate: RextimatePriceHistory;
  onMoreInfoPress: (args?: any) => any;
  onListingAgentPress: (args?: any) => any;
  isOpenHouse?: boolean;
  final?: boolean;
}

const Details: React.FC<DetailsProps> = ({
  property,
  onAddressPress,
  currentRextimate,
  onMoreInfoPress,
  onListingAgentPress,
  final,
  isOpenHouse,
}) => {
  const isLarge = WINDOW_WIDTH > 600;
  const textSize =
    isLarge && isOpenHouse
      ? 'text-lg -mt-2'
      : isLarge
      ? 'text-xl -mt-2'
      : 'text-xs -mt-2 mb-0.5';
  const addressTextSize = isLarge ? 'text-2xl' : 'text-sm';
  const rextimateTextSize =
    isLarge && isOpenHouse
      ? 'text-4xl py-2'
      : isLarge
      ? 'text-5xl py-4'
      : 'text-3xl';
  const currentTextSize = isLarge ? 'text-2xl' : 'text-lg';
  const circleButtonSize = isLarge ? 'w-16 h-16' : 'w-6 h-6';
  const circleButtonText = isLarge ? 'ml-4 text-lg' : 'ml-1 text-xs';
  const moreInfoText = isLarge ? 'text-lg' : 'text-xs';
  const detailsMargin =
    isLarge && isOpenHouse ? '-mt-2 mb-1' : isLarge ? '-mt-4' : '';
  return (
    <View style={tw`p-4`}>
      <Pressable onPress={onListingAgentPress}>
        <Text style={tw`text-black font-overpass400 underline ${textSize}`}>
          Courtesy of {property.listingOffice.name}
        </Text>
      </Pressable>
      <Pressable onPress={onAddressPress}>
        <Text
          style={tw`underline capitalize font-overpass400 ${addressTextSize}`}
        >
          {property.fullListingAddress}
        </Text>
      </Pressable>
      <View style={tw`flex flex-row items-center justify-between`}>
        <Text style={tw`${rextimateTextSize} text-purple font-rajdhani700`}>
          {formatMoney(currentRextimate.amount)}
        </Text>
        <View style={tw`flex flex-row items-center`}>
          <Image source={require('../../assets/crown_gold.png')}></Image>
          <Text
            style={tw`ml-1 ${currentTextSize} uppercase text-purple font-rajdhani700`}
          >
            {final ? 'Final' : 'Current'} Rextimate
          </Text>
        </View>
      </View>
      {final && (
        <Text style={tw`text-darkGray font-overpass600 `}>
          Sale Price:{' '}
          {property.salePrice ? formatMoney(property.salePrice) : 'PENDING'}
        </Text>
      )}
      <View
        style={tw`flex flex-row items-center justify-between ${detailsMargin}`}
      >
        <View style={tw`flex flex-row items-center`}>
          <CircleButton
            style={tw`${circleButtonSize} border-1 border-borderGray bg-light`}
            imageURL={require('../../assets/bed_purple.png')}
          />
          <Text style={tw`${circleButtonText} font-overpass500 text-darkGray`}>
            {property.beds} beds
          </Text>
        </View>
        <View style={tw`flex flex-row items-center`}>
          <CircleButton
            style={tw`${circleButtonSize} ml-1 shadow-sm border-1 border-borderGray bg-light`}
            imageURL={require('../../assets/bath_purple.png')}
          />
          <Text style={tw`${circleButtonText} font-overpass500 text-darkGray`}>
            {property.baths.total} baths
          </Text>
        </View>
        <View style={tw`flex flex-row items-center`}>
          <CircleButton
            style={tw`${circleButtonSize} ml-1 shadow-sm border-1 border-borderGray bg-light`}
            imageURL={require('../../assets/ruler_triangle_purple.png')}
          />
          <Text style={tw`${circleButtonText} font-overpass500 text-darkGray`}>
            {property.size} sqft
          </Text>
        </View>
        <Pressable onPress={onMoreInfoPress}>
          <View
            style={tw`flex flex-row items-center p-1 mx-1 rounded-md border-1 border-purple`}
          >
            <Image
              style={tw`mr-1`}
              source={require('../../assets/info_outline_purple.png')}
            ></Image>

            <Text style={tw`${moreInfoText} text-purple font-overpass600`}>
              more info
            </Text>
          </View>
        </Pressable>
      </View>
      <View style={tw`my-1`}>
        <HorizontalLine />
      </View>
    </View>
  );
};

export default Details;
