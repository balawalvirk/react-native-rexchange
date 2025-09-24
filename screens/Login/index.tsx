import {
  View,
  Text,
  Image,
  Pressable,
  KeyboardAvoidingView,
  SafeAreaView,
  Keyboard,
  ScrollView,
} from 'react-native';
import tw from '../../lib/tailwind/tailwind';
import Gradient from '../../lib/svg/Gradient';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { useState } from 'react';
import {
  customContainerStyles,
  customLabelStyles,
  inputStyles,
  labelStyles,
  largeCustomContainerStyles,
  largeInputStyles,
  largeLabelStyles,
} from '../../lib/forms/textInput';
import Alert from '../../components/Alert';
import * as auth from 'firebase/auth';
import { getUser } from '../../firebase/collections/users';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { isLarge } from '../../lib/helpers/dimensions';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [state, setState] = useState({
    email: '',
    password: '',
    error: false,
  });

  const handlePress = async () => {
    // Dismiss keyboard before authentication
    Keyboard.dismiss();
    
    setState({ ...state, error: false });
    auth
      .signInWithEmailAndPassword(auth.getAuth(), state.email, state.password)
      .then(async (res) => {
        const rxcUser = await getUser(res.user.uid);
        // bring to game screen
      })
      .catch((err) => setState({ ...state, error: true }));
  };
  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1 w-full h-full`}>
        <Gradient />
        <ScrollView 
          contentContainerStyle={tw`flex-grow`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={tw`flex-1`}
        >
          <View style={tw`flex-1 relative flex items-center justify-center max-w-full w-[600px] min-h-full`}>
            <Image
              resizeMode="contain"
              style={tw`h-48`}
              source={require('../../assets/white_logo.png')}
            ></Image>
            <View style={tw`relative w-full p-4 text-white`}>
          {state.error && (
            <Alert message="Incorrect email or password" status={'error'} />
          )}
          <FloatingLabelInput
            label={'Login'}
            value={state.email}
            onChangeText={(value) => setState({ ...state, email: value })}
            containerStyles={
              isLarge ? largeCustomContainerStyles : customContainerStyles
            }
            customLabelStyles={isLarge ? largeLabelStyles : customLabelStyles}
            inputStyles={isLarge ? largeInputStyles : inputStyles}
            labelStyles={labelStyles}
          />
          <View style={tw`relative h-16`}>
            <FloatingLabelInput
              label={'Password'}
              value={state.password}
              onChangeText={(value) => setState({ ...state, password: value })}
              containerStyles={
                isLarge ? largeCustomContainerStyles : customContainerStyles
              }
              customLabelStyles={isLarge ? largeLabelStyles : customLabelStyles}
              inputStyles={isLarge ? largeInputStyles : inputStyles}
              labelStyles={labelStyles}
              isPassword
            />
            <Pressable 
            // onPress={() => navigation.navigate('forgot-password')}
            // onPress={() => console.log('forgot password')}
            >
              <Text
            // onPress={() => console.log('forgot password')}
            onPress={() => {
              Keyboard.dismiss();
              setTimeout(() => {
                navigation.navigate('forgot-password');
              }, 100);
            }}
              
                style={tw`absolute text-base font-bold text-white right-9 bottom-2 font-overpass600`}
              >
                Forgot?
              </Text>
            </Pressable>
          </View>
          <TouchableOpacity onPress={handlePress}>
            <View
              style={tw`flex items-center justify-center w-full p-4 my-4 border-white border-solid rounded-lg border-1`}
            >
              <Text style={tw`text-lg text-center text-white font-overpass500`}>
                Login
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              navigation.navigate('social');
            }, 100);
          }}>
            <View
              style={tw`flex items-center justify-center w-full p-4 my-1 border-solid rounded-lg border-1 border-green bg-green`}
            >
              <Text style={tw`text-lg text-center text-white font-overpass500`}>
                Login with Facebook, Google, or Apple
              </Text>
            </View>
          </TouchableOpacity>
          <Pressable onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              navigation.navigate('register');
            }, 100);
          }}>
            <Text style={tw`my-8 text-lg text-center text-white `}>
              <Text style={tw`font-overpass400`}>New to Rexchange?</Text>{' '}
              <Text style={tw`font-bold font-overpass600`}>Sign Up.</Text>
            </Text>
          </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
