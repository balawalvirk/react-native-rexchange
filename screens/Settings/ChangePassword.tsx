import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import {
  customSettingsLabelStyles,
  ONE_LOWER,
  ONE_NUMBER,
  ONE_UPPER,
  ONE_SPECIAL,
  settingsContainerErrorStyles,
  settingsContainerStyles,
  settingsInputStyles,
  settingsLabelStyles,
} from '../../lib/forms/textInput';
import tw from '../../lib/tailwind/tailwind';
import { useAuth } from '../../providers/authProvider';

interface ChangePasswordProps {
  onBackPress: (args: any) => any;
}

const defaultError = {
  inputErrorLocation: '',
  inputErrorMessage: '',
  formError: '',
};
const ChangePassword: React.FC<ChangePasswordProps> = ({ onBackPress }) => {
  const { user } = useAuth();
  const [state, setState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState(defaultError);
  const [success, setSuccess] = useState(false);
  const [hasPassword, setHasPassword] = useState(true); // Default to true

  useEffect(() => {
    if (user?.providerData) {
      const passwordExists = _.some(
        user.providerData,
        (provider) => provider.providerId === 'password'
      );
      setHasPassword(passwordExists);
    } else {
      // If providerData is not available, assume they have a password
      // This is safer for password changes
      setHasPassword(true);
    }
  }, [user]);

  const handleSave = async () => {
    setSuccess(false);
    const isValid = validateForm();
    if (!isValid) return;

    if (!user?.email) {
      setError({
        inputErrorLocation: '',
        inputErrorMessage: '',
        formError: 'User email not found. Please log out and log back in.',
      });
      return;
    }

    try {
      setError(defaultError);
      const auth = getAuth();
      const credentials = await signInWithEmailAndPassword(
        auth,
        user.email,
        state.currentPassword,
      );

      await updatePassword(credentials.user, state.newPassword);
      setSuccess(true);
      setState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });

      setTimeout(() => {
        onBackPress();
      }, 2000);
    } catch (err: any) {
      const isWrongPassword = err?.code === 'auth/wrong-password';
      const message = isWrongPassword
        ? 'Current password is incorrect.'
        : err?.message || 'Unable to update password. Please try again.';

      setError({
        inputErrorLocation: isWrongPassword ? 'current' : '',
        inputErrorMessage: '',
        formError: message,
      });
    }
  };

  const handleResetPress = () => {
    setSuccess(false);
    setError(defaultError);
    
    // Check if user email exists
    if (!user?.email) {
      Alert.alert('Error!', 'User email not found. Please log out and log back in.');
      return;
    }
    
    sendPasswordResetEmail(getAuth(), user.email)
      .then(() => {
        Alert.alert('Success!', 'Check your email for further instructions.');
      })
      .catch((err) => Alert.alert('Error!', err.message));
  };
  const validateForm = (): boolean => {
    setError({ inputErrorLocation: '', inputErrorMessage: '', formError: '' });
    if (!state.currentPassword) {
      setError({
        ...error,
        inputErrorLocation: 'current',
        inputErrorMessage: 'This field is required.',
      });
      return false;
    }
    if (!state.newPassword) {
      setError({
        ...error,
        inputErrorLocation: 'new',
        inputErrorMessage: 'This field is required.',
      });
      return false;
    }

    if (state.newPassword.length < 8) {
      setError({
        ...error,
        inputErrorLocation: 'new',
        inputErrorMessage: 'Password must be a minimum of 8 characters.',
      });
      return false;
    }

    if (!ONE_LOWER.test(state.newPassword)) {
      setError({
        ...error,
        inputErrorLocation: 'new',
        inputErrorMessage: 'Must contain one lower case letter.',
      });
      return false;
    }
    if (!ONE_UPPER.test(state.newPassword)) {
      setError({
        ...error,
        inputErrorLocation: 'new',
        inputErrorMessage: 'Must contain one upper case letter.',
      });
      return false;
    }
    if (!ONE_NUMBER.test(state.newPassword)) {
      setError({
        ...error,
        inputErrorLocation: 'new',
        inputErrorMessage: 'Must contain one number.',
      });
      return false;
    }
    if (!ONE_SPECIAL.test(state.newPassword)) {
      setError({
        ...error,
        inputErrorLocation: 'new',
        inputErrorMessage: 'Must contain one special character.',
      });
      return false;
    }
    if (!state.confirmNewPassword) {
      setError({
        ...error,
        inputErrorLocation: 'confirm',
        inputErrorMessage: 'This field is required.',
      });
      return false;
    }

    if (state.newPassword != state.confirmNewPassword) {
      setError({
        ...error,
        inputErrorLocation: 'confirm',
        inputErrorMessage: 'Passwords must match.',
      });
      return false;
    }

    return true;
  };

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
              Change Password
            </Text>
          </View>
          <Pressable onPress={handleSave}>
            <Text style={tw`font-base font-overpass600 text-green`}>Save</Text>
          </Pressable>
        </View>
        {Boolean(error.formError) && (
          <View style={tw`p-2 my-2 bg-red/80`}>
            <Text style={tw`text-white font-overpass500`}>
              {error.formError}
            </Text>
          </View>
        )}
        {success && (
          <View style={tw`p-2 my-2 bg-green/80`}>
            <Text style={tw`text-white font-overpass500`}>
              Password successfully updated!
            </Text>
          </View>
        )}
      </Pressable>
      
      {/* Always show current password field */}
      <View style={tw`mt-4`}>
        <FloatingLabelInput
          label={'Current Password'}
          value={state.currentPassword}
          onChangeText={(value) =>
            setState({ ...state, currentPassword: value })
          }
          containerStyles={
            error.inputErrorLocation == 'current'
              ? settingsContainerErrorStyles
              : settingsContainerStyles
          }
          customLabelStyles={customSettingsLabelStyles}
          inputStyles={settingsInputStyles}
          labelStyles={settingsLabelStyles}
          isPassword
          eyeIconColor='#121212'

        />
        {error.inputErrorLocation == 'current' && (
          <Text style={tw`text-xs text-red font-overpass600 my-0.5`}>
            {error.inputErrorMessage}
          </Text>
        )}
      </View>

      <View style={tw`mt-4`}>
        <FloatingLabelInput
          label={'New Password'}
          value={state.newPassword}
          onChangeText={(value) => setState({ ...state, newPassword: value })}
          containerStyles={
            error.inputErrorLocation == 'new'
              ? settingsContainerErrorStyles
              : settingsContainerStyles
          }
          customLabelStyles={customSettingsLabelStyles}
          inputStyles={settingsInputStyles}
          labelStyles={settingsLabelStyles}
          isPassword
          eyeIconColor='#121212'

        />
        {error.inputErrorLocation == 'new' && (
          <Text style={tw`text-xs text-red font-overpass600 my-0.5`}>
            {error.inputErrorMessage}
          </Text>
        )}
      </View>

      <View style={tw`mt-4`}>
        <FloatingLabelInput
          label={'Confirm Password'}
          value={state.confirmNewPassword}
          onChangeText={(value) =>
            setState({ ...state, confirmNewPassword: value })
          }
          containerStyles={
            error.inputErrorLocation == 'confirm'
              ? settingsContainerErrorStyles
              : settingsContainerStyles
          }
          customLabelStyles={customSettingsLabelStyles}
          inputStyles={settingsInputStyles}
          labelStyles={settingsLabelStyles}
          isPassword
          eyeIconColor='#121212'

        />
        {error.inputErrorLocation == 'confirm' && (
          <Text style={tw`text-xs text-red font-overpass600 my-0.5`}>
            {error.inputErrorMessage}
          </Text>
        )}
      </View>

     
      
      {/* Reset Password Button */}
      <Pressable 
        onPress={handleSave}
        style={tw`w-full p-4 my-2 mt-6 bg-orange rounded-lg border border-orange`}
      >
        <Text style={tw`text-lg text-center text-white font-overpass600`}>
          Reset Password
        </Text>
      </Pressable>
      
      {/* Or Divider */}
      <View style={tw`flex flex-row items-center my-4`}>
        <View style={tw`flex-1 h-px bg-gray-300`}></View>
        <Text style={tw`px-4 text-sm text-darkGray font-overpass500`}>Or</Text>
        <View style={tw`flex-1 h-px bg-gray-300`}></View>
      </View>
      
      {/* Send Reset Link Button */}
     
      <Text
        style={tw`py-4 text-base leading-6 text-center text-darkGray font-overpass600`}
      >
        If you don't remember your current password, you can reset it online by
        tapping below. reset link will be sent to your email
      </Text>
      <Pressable 
        onPress={handleResetPress}
        style={tw`w-full p-4 my-2 bg-transparent rounded-lg border border-orange`}
      >
        <Text style={tw`text-lg text-center text-orange font-overpass600`}>
          Send Reset Link
        </Text>
      </Pressable>
    </View>
  );
};

export default ChangePassword;
