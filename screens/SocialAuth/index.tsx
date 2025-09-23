import { View, Image, Pressable, Text } from 'react-native';
import Gradient from '../../lib/svg/Gradient';
import tw from '../../lib/tailwind/tailwind';
import * as WebBrowser from 'expo-web-browser';
import SSOButtons from '../../components/SSOButtons';

WebBrowser.maybeCompleteAuthSession();

interface SocialAuthProps {
  navigation: any;
}

const SocialAuthScreen: React.FC<SocialAuthProps> = ({ navigation }) => {
  return (
    <View style={tw`w-full h-full`}>
      <Gradient />
      <View style={tw`flex flex-row items-center p-4 mt-20`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            width={30}
            source={require('../../assets/chevron_left_white.png')}
          ></Image>
        </Pressable>
        <Text
          style={tw`ml-10 text-2xl text-center text-white font-rajdhani700`}
        >
          Social Login
        </Text>
      </View>
      <View style={tw`p-4`}>
        <SSOButtons />
      </View>
    </View>
  );
};

export default SocialAuthScreen;
