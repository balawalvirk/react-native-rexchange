import { View, Image, Text } from 'react-native';
import tw from '../../lib/tailwind/tailwind';

interface BrokerageInfoProps {}

const BrokerageInfo: React.FC<BrokerageInfoProps> = () => {
  return (
    <View style={tw`p-8`}>
      <View style={tw`p-10`}>
        <Text style={tw`text-darkGray font-overpass500 text-center py-0.5`}>
          Louisiana Licensed Broker{' '}
        </Text>
        <Text style={tw`text-darkGray font-overpass500 text-center py-0.5`}>
          kcb@rexchange.app
        </Text>
      </View>
      <Image
        style={tw`-my-4 h-1/3`}
        resizeMode="contain"
        source={{
          uri: 'https://res.cloudinary.com/wherewego/image/upload/v1681161434/sqanhxdu73hk7woh3jwq.png',
        }}
      ></Image>
    </View>
  );
};

export default BrokerageInfo;
