import { useNavigation } from '@react-navigation/native';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useState } from 'react';
import { View, Image, Text, Pressable, TouchableOpacity, Keyboard, StatusBar } from 'react-native';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { SafeAreaView } from 'react-native-safe-area-context';
import Alert from '../../components/Alert';
import {
  customContainerStyles,
  customLabelStyles,
  defaultContainerErrorStyles,
  inputStyles,
  labelStyles,
  largeCustomContainerStyles,
  largeDefaultContainerErrorStyles,
  largeInputStyles,
  largeLabelStyles,
} from '../../lib/forms/textInput';
import { isLarge } from '../../lib/helpers/dimensions';
import Gradient from '../../lib/svg/Gradient';
import tw from '../../lib/tailwind/tailwind';

interface SignUpProps {}
const defaultState = {
  error: '',
  success: '',
  email: '',
  errorLocation: '',
  errorMessage: '',
};
const ForgotPasswordScreen: React.FC<SignUpProps> = () => {
  const [state, setState] = useState(defaultState);
  const navigation = useNavigation();
  const handlePress = async () => {
    // Dismiss keyboard before sending email
    Keyboard.dismiss();
    
    const isValid = validateForm();
    if (!isValid) return;
    try {
      await sendPasswordResetEmail(getAuth(), state.email);
      setState({
        ...state,
        success:
          'Email successfully sent! Please check your email for further instruction',
        error: '',
      });
    } catch (err: any) {
      setState({ ...state, error: err.message });
    }
  };

  const validateForm = () => {
    setState({ ...state, errorLocation: '', errorMessage: '' });
    if (!state.email) {
      setState({
        ...state,
        errorLocation: 'email',
        errorMessage: 'This field is required.',
      });
      return false;
    }

    return true;
  };
  return (
    <View style={tw`flex w-full h-full`}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      <Gradient />
      <SafeAreaView style={tw`p-8 max-w-[600px] mx-auto w-full`}>
        <View style={tw`flex flex-row items-center`}>
          <Pressable onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              navigation.goBack();
            }, 100);
          }}>
            <Image
              resizeMode="contain"
              source={require('../../assets/times_white.png')}
            />
          </Pressable>

          <Text style={tw`ml-4 text-2xl text-white font-rajdhani700`}>
            Forgot Password
          </Text>
        </View>
        <View style={tw`relative w-full text-white`}>
          {Boolean(state.error) && (
            <Alert status="error" message={state.error} />
          )}
          {Boolean(state.success) && (
            <Alert status="success" message={state.success} />
          )}
          <View>
            <Text style={tw`my-4 text-lg text-white font-overpass500`}>
              Forgot your password? Enter the email you used to sign up and
              we'll send you instructions on how to reset.
            </Text>
          </View>
          {state.errorLocation === 'email' && (
            <Text style={tw`text-yellow font-overpass500 my-0.5`}>
              {state.errorMessage}
            </Text>
          )}
          <View style={tw`relative`}>
            <FloatingLabelInput
              label={'Email'}
              value={state.email}
              onChangeText={(value) => setState({ ...state, email: value })}
              containerStyles={
                state.errorLocation == 'email'
                  ? isLarge
                    ? largeDefaultContainerErrorStyles
                    : defaultContainerErrorStyles
                  : isLarge
                  ? largeCustomContainerStyles
                  : customContainerStyles
              }
              customLabelStyles={isLarge ? largeLabelStyles : customLabelStyles}
              inputStyles={isLarge ? largeInputStyles : inputStyles}
              labelStyles={labelStyles}
            />
            {state.errorLocation === 'email' && (
              <Text style={tw`text-yellow font-overpass500 my-0.5`}>
                {state.errorMessage}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={handlePress}>
            <View
              style={tw`flex items-center justify-center w-full p-4 my-4 border-white border-solid rounded-lg border-1`}
            >
              <Text style={tw`text-lg text-center text-white font-overpass500`}>
                Reset Password{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ForgotPasswordScreen;
