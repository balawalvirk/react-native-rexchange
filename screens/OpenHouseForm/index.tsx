import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import { FloatingLabelInput } from 'react-native-floating-label-input';
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
import axios from 'axios';

interface OpenHouseFormProps {}

const OpenHouseForm: React.FC<OpenHouseFormProps> = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const address = (params as any).address;
  const [state, setState] = useState({
    error: false,
    errorMessage: '',
    successMessage: '',
    email: '',
    firstName: '',
    lastName: '',
    errorLocation: '',
  });
  const validateForm = () => {
    setState({ ...state, errorLocation: '', errorMessage: '' });
    if (!state.firstName) {
      setState({
        ...state,
        errorLocation: 'firstName',
        errorMessage: 'This field is required.',
      });
      return false;
    }
    if (!state.lastName) {
      setState({
        ...state,
        errorLocation: 'lastName',
        errorMessage: 'This field is required.',
      });
      return false;
    }
    if (!state.email) {
      setState({
        ...state,
        errorLocation: 'email',
        errorMessage: 'This field is required.',
      });
      return false;
    }
    if (
      !state?.email.match(
        new RegExp(
          /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
        ),
      )
    ) {
      setState({
        ...state,
        errorLocation: 'email',
        errorMessage: 'Please provide a valid email.',
      });
      return false;
    }

    return true;
  };
  const handlePress = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    axios
      .get(
        'https://us-central1-rexchange-bfb0a.cloudfunctions.net/sendOpenHouseEmail',
        {
          params: {
            firstName: state.firstName,
            lastName: state.lastName,
            address,
            to: state.email,
          },
        },
      )
      .then(() => {
        setState({
          ...state,
          successMessage: 'Thank you! Check your email :)',
        });
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      })
      .catch((err) => {
        setState({
          ...state,
          errorLocation: 'form',
          errorMessage: err.message,
        });
      });
  };

  const padding = isLarge ? 'p-20' : 'px-4 py-10';
  const headingTextSize = isLarge ? 'text-4xl' : 'text-2xl';
  const heading2TextSize = isLarge ? 'text-3xl' : 'text-xl';
  const buttonPadding = isLarge ? 'p-6' : 'p-4';
  const buttonTextSize = isLarge ? 'text-2xl' : 'text-xl';
  return (
    <View style={tw`flex items-center w-full h-full`}>
      <Gradient />
      <SafeAreaView style={tw`w-full`}>
        <View style={tw`${padding}`}>
          <View style={tw`flex flex-row items-center`}>
            <Text
              style={tw`${headingTextSize} text-white capitalize font-rajdhani700`}
            >
              Thanks for playing!
            </Text>
            <Pressable style={tw`ml-auto`} onPress={() => navigation.goBack()}>
              <Image
                resizeMode="contain"
                source={require('../../assets/times_white.png')}
              />
            </Pressable>
          </View>
          <View style={tw`relative w-full mt-8 text-white`}>
            <Text
              style={tw`py-4 ${heading2TextSize} text-white font-overpass600`}
            >
              Sign up for updates to see how close you are to the market and get
              instructions to download the app!
            </Text>

            {Boolean(state.errorLocation === 'form' && state.error) && (
              <Alert message={state.errorMessage} status={'error'} />
            )}
            {Boolean(state.successMessage) && (
              <Alert message={state.successMessage} status={'success'} />
            )}
            <View style={tw`relative my-4`}>
              <FloatingLabelInput
                label={'First Name'}
                value={state.firstName}
                onChangeText={(value) =>
                  setState({ ...state, firstName: value })
                }
                containerStyles={
                  state.errorLocation == 'firstName'
                    ? isLarge
                      ? largeDefaultContainerErrorStyles
                      : defaultContainerErrorStyles
                    : isLarge
                    ? largeCustomContainerStyles
                    : customContainerStyles
                }
                customLabelStyles={
                  isLarge ? largeLabelStyles : customLabelStyles
                }
                inputStyles={isLarge ? largeInputStyles : inputStyles}
                labelStyles={labelStyles}
              />
              {state.errorLocation === 'firstName' && (
                <Text style={tw`text-yellow font-overpass500 my-0.5`}>
                  {state.errorMessage}
                </Text>
              )}
            </View>
            <View style={tw`relative my-4`}>
              <FloatingLabelInput
                label={'Last Name'}
                value={state.lastName}
                onChangeText={(value) =>
                  setState({ ...state, lastName: value })
                }
                containerStyles={
                  state.errorLocation == 'lastName'
                    ? isLarge
                      ? largeDefaultContainerErrorStyles
                      : defaultContainerErrorStyles
                    : isLarge
                    ? largeCustomContainerStyles
                    : customContainerStyles
                }
                customLabelStyles={
                  isLarge ? largeLabelStyles : customLabelStyles
                }
                inputStyles={isLarge ? largeInputStyles : inputStyles}
                labelStyles={labelStyles}
              />
              {state.errorLocation === 'lastName' && (
                <Text style={tw`text-yellow font-overpass500 my-0.5`}>
                  {state.errorMessage}
                </Text>
              )}
            </View>
            <View style={tw`relative my-4`}>
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
                customLabelStyles={
                  isLarge ? largeLabelStyles : customLabelStyles
                }
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
                style={tw`flex items-center justify-center ${buttonPadding} w-full my-6 border-white border-solid rounded-lg border-1`}
              >
                <Text
                  style={tw`text-center ${buttonTextSize} text-white font-overpass500`}
                >
                  Submit
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default OpenHouseForm;
