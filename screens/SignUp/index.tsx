import { useNavigation } from '@react-navigation/native';
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
  ONE_LOWER,
  ONE_NUMBER,
  ONE_UPPER,
  ONE_SPECIAL,
} from '../../lib/forms/textInput';
import { isLarge } from '../../lib/helpers/dimensions';
import Gradient from '../../lib/svg/Gradient';
import tw from '../../lib/tailwind/tailwind';

interface SignUpProps {}
const defaultState = {
  error: '',
  email: '',
  password: '',
  errorLocation: '',
  errorMessage: '',
};
const SignUpScreen: React.FC<SignUpProps> = () => {
  const [state, setState] = useState(defaultState);
  const navigation = useNavigation();
  const handlePress = async () => {
    // Dismiss keyboard before validation
    Keyboard.dismiss();
    
    const isValid = validateForm();
    if (!isValid) return;
    
    // Navigate to user data collection with email and password
    console.log('🔍 SignUp - Navigating to user-data with params:', {
      email: state.email,
      password: state.password ? '***' : 'undefined'
    });
    
    // @ts-expect-error
    navigation.navigate('user-data', {
      email: state.email,
      password: state.password,
    });
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
    if (!state.password) {
      setState({
        ...state,
        errorLocation: 'password',
        errorMessage: 'This field is required.',
      });
      return false;
    }
    if (!ONE_LOWER.test(state.password)) {
      setState({
        ...state,
        errorLocation: 'password',
        errorMessage: 'Must contain one lower case letter.',
      });

      return false;
    }
    if (!ONE_UPPER.test(state.password)) {
      setState({
        ...state,
        errorLocation: 'password',
        errorMessage: 'Must contain one upper case letter.',
      });
      return false;
    }
    if (!ONE_NUMBER.test(state.password)) {
      setState({
        ...state,
        errorLocation: 'password',
        errorMessage: 'Must contain one number.',
      });
      return false;
    }
    if (!ONE_SPECIAL.test(state.password)) {
      setState({
        ...state,
        errorLocation: 'password',
        errorMessage: 'Must contain one special character.',
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
            Sign Up with Email
          </Text>
        </View>
        <View style={tw`relative w-full text-white`}>
          {Boolean(state.error) && (
            <Alert message={state.error} status={'error'} />
          )}
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
            customLabelStyles={customLabelStyles}
            inputStyles={isLarge ? largeInputStyles : inputStyles}
            labelStyles={labelStyles}
          />
          {state.errorLocation === 'email' && (
            <Text style={tw`text-yellow font-overpass500 my-0.5`}>
              {state.errorMessage}
            </Text>
          )}
          <View style={tw`relative`}>
            <FloatingLabelInput
              label={'Password'}
              value={state.password}
              onChangeText={(value) => setState({ ...state, password: value })}
              containerStyles={
                state.errorLocation == 'password'
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
              isPassword
            />
            {state.errorLocation === 'password' && (
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
                Create Account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SignUpScreen;
