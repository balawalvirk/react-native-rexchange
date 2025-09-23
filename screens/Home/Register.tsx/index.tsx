import { useNavigation } from '@react-navigation/native';
import { View, Image, Text, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SSOButtons from '../../../components/SSOButtons';
import Gradient from '../../../lib/svg/Gradient';
import tw from '../../../lib/tailwind/tailwind';

interface RegisterProps {}

const RegisterScreen: React.FC<RegisterProps> = () => {
  const navigation = useNavigation();
  return (
    <View style={tw`flex w-full h-full`}>
      <Gradient />
      <SafeAreaView style={tw`p-8 max-w-[600px] w-full mx-auto`}>
        <View style={tw`flex flex-row items-center `}>
          <Pressable onPress={() => navigation.goBack()}>
            <Image
              resizeMode="contain"
              source={require('../../../assets/time_white.png')}
            />
          </Pressable>

          <Text style={tw`ml-4 text-2xl text-white font-rajdhani700`}>
            Sign Up
          </Text>
        </View>
        {/* @ts-expect-error */}
        <TouchableOpacity onPress={() => navigation.navigate('sign-up')}>
          <View
            style={tw`flex items-center justify-center w-full p-4 my-4 border-white border-solid rounded-lg border-1`}
          >
            <Text style={tw`text-base text-center text-white font-overpass500`}>
              Sign up with email
            </Text>
          </View>
        </TouchableOpacity>
        <SSOButtons />
      </SafeAreaView>
    </View>
  );
};

export default RegisterScreen;
