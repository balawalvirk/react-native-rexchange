import { Text, ScrollView, View, Image, Pressable } from 'react-native';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { Property } from '../../lib/models/property';
import tw from '../../lib/tailwind/tailwind';
import HorizontalLine from '../HorizontalLine';
interface ListingAgentInfoProps {
  property: Property;
  close?: () => void;
}

const ListingAgentInfo: React.FC<ListingAgentInfoProps> = ({
  property,
  close,
}) => {
  const isLarge = WINDOW_WIDTH > 600;
  const ListingAgentInfoTextSize = isLarge ? 'text-lg' : 'text-sm';
  return (
    <>
      <Text
        style={tw`p-4 ${ListingAgentInfoTextSize} text-center capitalize font-overpass600 text-purple`}
      >
        Courtesy of {property.listingOffice.name}
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
          <View style={tw`grid grid-cols-2 my-10 w-100`}>
            <Text
              style={tw`w-1/2 font-overpass700 ${ListingAgentInfoTextSize}`}
            >
              Listing Agent:
            </Text>
            <View>
              <Text
                style={tw`font-overpass500 break-all ${ListingAgentInfoTextSize}`}
              >
                {property.listingAgent.name}
              </Text>
              <Text
                style={tw`font-overpass500 break-all ${ListingAgentInfoTextSize}`}
              >
                {property.listingAgent.email ||
                  (property.listingAgent as any)?.phone ||
                  'Contact not provided'}
              </Text>
            </View>
          </View>
          <View>
            <Text style={tw`font-overpass700 ${ListingAgentInfoTextSize}`}>
              Listing Office
            </Text>
            <View>
              <Text
                style={tw`font-overpass500 break-all ${ListingAgentInfoTextSize}`}
              >
                {property.listingOffice.name}
              </Text>
              <Text
                style={tw`font-overpass500 break-all ${ListingAgentInfoTextSize}`}
              >
                {property.listingOffice?.phone ||
                  (property.listingOffice as any)?.email ||
                  'Contact not provided'}
              </Text>
            </View>
          </View>

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

export default ListingAgentInfo;
