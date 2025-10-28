import { getAuth, OAuthProvider, signInWithCredential } from 'firebase/auth';
import { Pressable, View, Image, Text, Alert, Platform } from 'react-native';
import tw from '../../lib/tailwind/tailwind';
import * as auth from 'firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';
import {
  AppleAuthenticationScope,
  signInAsync,
} from 'expo-apple-authentication';
import { CryptoDigestAlgorithm } from 'expo-crypto';

interface SSOButtonsProps {}

const SSOButtons: React.FC<SSOButtonsProps> = () => {
  const appleProvider = new auth.OAuthProvider('apple.com');
  const googleProvider = new auth.OAuthProvider('google.com');
  const navigation = useNavigation();
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '546177265088-kre07ao0v1h91ln5hn7e1v64rd0bp8o4.apps.googleusercontent.com',
    iosClientId: '546177265088-ll93f5utg5cb7v6ltcrpj69pi5ms3k6i.apps.googleusercontent.com',
    androidClientId: '546177265088-dttrm4b9ssdvdur0460e8rd024if2tk6.apps.googleusercontent.com', 
  });

  useEffect(() => {
    if (response?.type) {
      console.log('Google Auth Response:', response);
      if (response.type === 'success') {
        const credential = auth.GoogleAuthProvider.credential(
          response.authentication?.idToken,
        );
        auth
          .signInWithCredential(auth.getAuth(), credential)
          .then((user) => {
            // @ts-expect-error
            navigation.navigate('game');
          })
          .catch((error) => {
            console.log('Error occurred ', error);
            Alert.alert(error.message);
          });
      } else if (response.type === 'cancel') {
        // User canceled the OAuth flow - don't show error
        console.log('Google Auth canceled by user');
      } else {
        console.log('Google Auth failed with type:', response.type);
        console.log('Google Auth error:', response.error);
        Alert.alert('Error authenticating with Google.');
      }
    }
  }, [response]);
  const handleFacebook = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        console.log('Facebook login cancelled');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      
      if (data) {
        const credential = auth.FacebookAuthProvider.credential(data.accessToken);
        auth
          .signInWithCredential(auth.getAuth(), credential)
          .then((user) => {
            // @ts-expect-error
            navigation.navigate('game');
          })
          .catch((error) => {
            console.log('Error occurred ', error);
            Alert.alert(error.message);
          });
      }
    } catch ({ message }: any) {
      Alert.alert(message as string);
    }
  };

  const handleApple = async () => {
    const state = Math.random().toString(36).substring(2, 15);
    const rawNonce = Math.random().toString(36).substring(2, 10);
    const requestedScopes = [
      AppleAuthenticationScope.FULL_NAME,
      AppleAuthenticationScope.EMAIL,
    ];

    try {
      const nonce = await Crypto.digestStringAsync(
        CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const appleCredential = await signInAsync({
        requestedScopes,
        state,
        nonce,
      });

      const { identityToken } = appleCredential;

      if (!identityToken) {
        throw new Error('No identity token provided.');
      }

      const provider = new OAuthProvider('apple.com');

      provider.addScope('email');
      provider.addScope('fullName');

      const credential = provider.credential({
        idToken: identityToken,
        rawNonce,
      });
      return signInWithCredential(getAuth(), credential).catch((err) =>
        Alert.alert(err.message),
      );
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };
  return (
    <View>
      <Pressable onPress={handleFacebook}>
        <View
          style={tw`flex flex-row items-center p-4 my-4 rounded-md bg-facebookBlue`}
        >
          <Image source={require('../../assets/facebook_logo.png')}></Image>
          <Text
            style={tw`w-5/6 text-center text-white font-overpass500 text-md`}
          >
            Continue with Facebook
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={() => promptAsync()}>
        <View
          style={tw`flex flex-row items-center p-4 my-4 bg-white rounded-md`}
        >
          <Image source={require('../../assets/google_logo.png')}></Image>

          <Text
            style={tw`w-5/6 text-center text-black font-overpass500 text-md`}
          >
            Continue with Google
          </Text>
        </View>
      </Pressable>
      {Platform.OS === 'ios' && 
      <Pressable onPress={handleApple}>
        <View
          style={tw`flex flex-row items-center p-4 my-4 bg-black rounded-md`}
        >
          <Image
            resizeMode="contain"
            style={tw`w-8 h-10`}
            source={require('../../assets/apple_logo.png')}
          ></Image>

          <Text
            style={tw`w-5/6 text-center text-white font-overpass500 text-md`}
          >
            Continue with Apple
          </Text>
        </View>
      </Pressable>
      }
    </View>
  );
};

export default SSOButtons;
