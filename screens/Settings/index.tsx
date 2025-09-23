import { CommonActions, useNavigation } from '@react-navigation/native';
import { deleteUser, getAuth, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { deleteUserData } from '../../firebase/collections/users';
import {
  Pressable,
  View,
  Text,
  Image,
  Animated,
  ActionSheetIOS,
  Alert,
  Platform,
} from 'react-native';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import tw from '../../lib/tailwind/tailwind';
import { useAuth } from '../../providers/authProvider';
import { usePortfolio } from '../../providers/portfolioProvider';
import ChangePassword from './ChangePassword';
import HelpSupport from './HelpSupport';
import BrokerageInfo from './BrokerageInfo';

interface SettingsProps {
  onDonePress: (args?: any) => any;
}
type SettingsScreen = 'home' | 'change-password' | 'help' | 'brokerage';

const Settings: React.FC<SettingsProps> = ({ onDonePress }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [state, setState] = useState<SettingsScreen>('home');
  const settingsHomeAnimated = new Animated.Value(0);
  const position = {
    transform: [
      {
        translateX: settingsHomeAnimated as any,
      },
    ],
  };
  const { subscriptions } = usePortfolio();

  const slideRight = () => {
    Animated.timing(settingsHomeAnimated, {
      toValue: -WINDOW_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const slideLeft = () => {
    Animated.timing(settingsHomeAnimated, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (state != 'home') {
      slideRight();
    } else {
      slideLeft();
    }
  }, [state]);

  const handleDeleteAccountPress = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            
            try {
              // Get the current Firebase Auth user
              const currentUser = getAuth().currentUser;
              if (!currentUser) {
                Alert.alert('Error', 'No authenticated user found.');
                return;
              }
              
              // First delete user data from Firestore
              await deleteUserData(user.id, user.docId);
              
              // Then delete the Firebase Auth user (use currentUser instead of user)
              await deleteUser(currentUser);
              
              // Clean up and navigate
              onDonePress();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'promo-code' }],
                }),
              );
              subscriptions.forEach((sub) => sub());
              
              console.log('Account deleted successfully');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // const handleSignOutPress = () => {
  //   ActionSheetIOS.showActionSheetWithOptions(
  //     {
  //       options: ['Sign Out', 'Cancel'],
  //       destructiveButtonIndex: 0,
  //       cancelButtonIndex: 1,
  //       userInterfaceStyle: 'light',
  //       title: 'Are you sure you want to sign out?',
  //     },
  //     (buttonIndex) => {
  //       if (buttonIndex === 0) {
  //         onDonePress();
  //         navigation.dispatch(
  //           CommonActions.reset({
  //             index: 0,
  //             routes: [{ name: 'promo-code' }],
  //           }),
  //         );
  //         subscriptions.forEach((sub) => sub());
  //         signOut(getAuth());
  //       }
  //     },
  //   );
  // };
  const handleSignOutPress = () => {
    // Check if running on iOS
    if (Platform.OS === 'ios') {
      // Use ActionSheetIOS for iOS
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Sign Out', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          userInterfaceStyle: 'light',
          title: 'Are you sure you want to sign out?',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            onDonePress();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'promo-code' }],
              }),
            );
            subscriptions.forEach((sub) => sub());
            signOut(getAuth());
          }
        },
      );
    } else {
      // Use Alert for Android
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: () => {
              onDonePress();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'promo-code' }],
                }),
              );
              subscriptions.forEach((sub) => sub());
              signOut(getAuth());
            },
          },
        ],
        { cancelable: true }
      );
    }
  };
  return (
    <Animated.View style={[tw`flex flex-row`, position]}>
      <View style={[tw`w-full p-8 z-100`]}>
        <Pressable onPress={onDonePress}>
          <Text style={tw`ml-auto text-base text-darkGray font-overpass600`}>
            Done
          </Text>
        </Pressable>
        <View style={tw`py-8`}>
          <Text style={tw`text-2xl font-rajdhani700 text-darkGray`}>
            Settings
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setState('change-password');
          }}
        >
          <View style={tw`flex flex-row items-start w-full py-2`}>
            <Image source={require('../../assets/lock_dark_gray.png')} />
            <View
              style={tw`flex flex-row items-center justify-between flex-1 pb-2 ml-4 border-solid border-b-1 border-borderGray`}
            >
              <Text style={tw`text-base font-overpass500 text-darkGray`}>
                Change Password
              </Text>
              <Image
                style={tw`w-8`}
                resizeMode="contain"
                source={require('../../assets/chevron_left_dark_gray.png')}
              ></Image>
            </View>
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            setState('help');
          }}
        >
          <View style={tw`flex flex-row items-start w-full py-2`}>
            <Image
              source={require('../../assets/question_circle_dark_gray.png')}
            />
            <View
              style={tw`flex flex-row items-center justify-between flex-1 pb-2 ml-4 border-solid border-b-1 border-borderGray`}
            >
              <Text style={tw`text-base font-overpass500 text-darkGray`}>
                Help & Support
              </Text>
              <Image
                style={tw`w-8`}
                resizeMode="contain"
                source={require('../../assets/chevron_left_dark_gray.png')}
              ></Image>
            </View>
          </View>
        </Pressable>

        <Pressable onPress={handleDeleteAccountPress}>
          <View style={tw`flex flex-row items-start w-full py-2`}>
            <Image
              source={require('../../assets/delete_account_dark_gray.png')}
            />
            <View
              style={tw`flex flex-row items-center justify-between flex-1 pb-2 ml-4 border-solid border-b-1 border-borderGray`}
            >
              <Text style={tw`text-base font-overpass500 text-darkGray`}>
                Delete Account
              </Text>
              <Image
                style={tw`w-8`}
                resizeMode="contain"
                source={require('../../assets/chevron_left_dark_gray.png')}
              ></Image>
            </View>
          </View>
        </Pressable>

        <Pressable onPress={handleSignOutPress}>
          <View style={tw`flex flex-row items-start w-full py-2`}>
            <Image source={require('../../assets/sign_out_dark_gray.png')} />
            <View
              style={tw`flex flex-row items-center justify-between flex-1 pb-2 ml-4 border-solid border-b-1 border-borderGray`}
            >
              <Text style={tw`text-base font-overpass500 text-darkGray`}>
                Sign Out
              </Text>
              <Image
                style={tw`w-8`}
                resizeMode="contain"
                source={require('../../assets/chevron_left_dark_gray.png')}
              ></Image>
            </View>
          </View>
        </Pressable>
        <BrokerageInfo />
      </View>
      <View style={[tw`w-full`]}>
        {state === 'change-password' && (
          <ChangePassword
            onBackPress={() => {
              setState('home');
            }}
          />
        )}
        {state === 'help' && (
          <HelpSupport
            onBackPress={() => {
              setState('home');
            }}
          />
        )}
      </View>
    </Animated.View>
  );

  return <></>;
};

export default Settings;
