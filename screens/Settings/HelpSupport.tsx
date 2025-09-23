import { Pressable, View, Image, Text } from 'react-native';
import tw from '../../lib/tailwind/tailwind';

interface HelpSupportProps {
  onBackPress: (args: any) => any;
}

const HelpSupport: React.FC<HelpSupportProps> = ({ onBackPress }) => {
  return (
    <View style={tw`p-8`}>
      <Pressable onPress={onBackPress}>
        <View style={tw`flex flex-row items-center justify-between`}>
          <View style={tw`flex flex-row items-center`}>
            <Image
              style={tw`h-4`}
              resizeMode="contain"
              source={require('../../assets/chevron_right_dark_gray.png')}
            />
            <Text style={tw`ml-4 text-lg font-rajdhani700 text-darkGray`}>
              Help & Support
            </Text>
          </View>
        </View>
      </Pressable>
      <View style={tw`p-10`}>
        <Text
          style={tw`text-lg leading-6 text-center text-purple font-rajdhani700`}
        >
          Need help? Contact us at:
        </Text>
        <View style={tw`py-4`}>
          <Text style={tw`text-darkGray font-overpass500 text-center py-0.5`}>
            Rexchange, LLC
          </Text>
          <Text style={tw`text-darkGray font-overpass500 text-center py-0.5`}>
            504-226-5575
          </Text>
          <Text style={tw`text-darkGray font-overpass500 text-center py-0.5`}>
            info@rexchange.app
          </Text>
        </View>
        <View style={tw`py-4`}>
          <Text style={tw`text-darkGray font-overpass500 text-center py-0.5`}>
            1207 N Galvez St.
          </Text>
          <Text style={tw`text-darkGray font-overpass500 text-center py-0.5`}>
            New Orleans, LA 70119
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HelpSupport;
