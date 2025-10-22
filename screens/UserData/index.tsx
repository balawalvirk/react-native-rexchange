import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Alert,
  TextInputKeyPressEventData,
  NativeSyntheticEvent,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import Gradient from '../../lib/svg/Gradient';
import tw from '../../lib/tailwind/tailwind';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { addUser } from '../../firebase/collections/users';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { RXCUser } from '../../lib/models/rxcUser';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../providers/authProvider';
import { Keyboard } from 'react-native';

interface UserDataScreenProps {}

const UserDataScreen: React.FC<UserDataScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { setUser } = useAuth();
  
  // Get email and password from route params
  const { email, password } = route.params as { email: string; password: string } || {};
  
  console.log('🔍 UserData - Route params:', { email, password });
  const [zip, setZip] = useState(['', '', '', '', '']);
  const [birthday, setBirthday] = useState<Date | undefined>();
  const [realEstate, setRealEstate] = useState<boolean | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const position = {
    transform: [
      {
        translateX: translateX,
      },
    ],
  };
  const zip0 = useRef<TextInput>(null);
  const zip1 = useRef<TextInput>(null);
  const zip2 = useRef<TextInput>(null);
  const zip3 = useRef<TextInput>(null);
  const zip4 = useRef<TextInput>(null);

  useEffect(() => {
    let isValid = true;
    zip.forEach((zip) => {
      if (zip === '' || zip === undefined) {
        isValid = false;
        return;
      }
    });
    if (isValid) {
      slideRight();
    }
  }, [zip]);

  const slideRight = () => {
    const newVal = Number((translateX as any)._value) - WINDOW_WIDTH;
    Animated.timing(translateX, {
      toValue: newVal,
      duration: 300,
      useNativeDriver: false,
    }).start();
    Keyboard.dismiss();
  };
  const slideLeft = () => {
    const newVal = Number((translateX as any)._value) + WINDOW_WIDTH;
    Animated.timing(translateX, {
      toValue: newVal,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleChange = (value: string, index: number) => {
    zip[index] = value[1] || value[0];
    setZip([...zip]);
    if (!value) return;
    if (index == 0) {
      zip1.current?.focus();
    }
    if (index === 1) {
      zip2.current?.focus();
    }
    if (index === 2) {
      zip3.current?.focus();
    }
    if (index === 3) {
      zip4.current?.focus();
    }
  };

  const createUser = async () => {
    // Dismiss keyboard before navigation
    Keyboard.dismiss();
    
    
    let fbUser = getAuth().currentUser;
    // console.log('🔍 UserData - Current fbUser:', fbUser);
    
    // If no Firebase user exists, create one with the provided email/password
    if (!fbUser && email && password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
        fbUser = userCredential.user;

        
        // Send email verification
        if (fbUser) {
          await sendEmailVerification(fbUser);
        }
      } catch (error: any) {
        console.log('❌ UserData - Error creating Firebase user:', error);
        Alert.alert('Error', error.message);
        return;
      }
    }
    
    if (!fbUser) {
      console.log('❌ UserData - No Firebase user found!');
      Alert.alert('Error', 'No user found. Please try signing up again.');
      return;
    }
    
    const [fn, ln] = fbUser.displayName?.split(' ') || ['', ''];
    const user = {
      emailAddress: fbUser?.email || '',
      firstName: fn || '',
      lastName: ln || '',
      authId: fbUser.uid,
      zipCode: zip.join(''),
      ...(birthday ? { birthday } : {}),
      isRealtor: realEstate,
      isSetUp: true,
      tutorialFinished: false,
      zipCodeOrder: [zip.join('')],
      totalEarnings: 0,
      totalEquity: 0,
      openPositions: 0,
      token: '',
      id: fbUser.uid,
    };
    
    console.log('🔍 UserData - Creating user object:', user);
    
    try {
      await addUser(user);
      console.log('✅ UserData - User created successfully:', user);
      setUser(user);
      // Small delay to ensure keyboard is dismissed before navigation
      setTimeout(() => {
        // @ts-expect-error
        navigation.navigate('game');
      }, 100);
    } catch (err: any) {
      console.log('❌ UserData - Error creating user:', err);
      Alert.alert('Error', err.message);
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    const { nativeEvent } = event;
    if (nativeEvent.key === 'Backspace') {
      if (index === 1 && !zip[1]) {
        zip0.current?.focus();
      }
      if (index === 2 && !zip[2]) {
        zip1.current?.focus();
      }
      if (index === 3 && !zip[3]) {
        zip2.current?.focus();
      }
      if (index == 4 && !zip[4]) {
        zip3.current?.focus();
      }
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Always close the modal
    if (event.type === 'set' && selectedDate) {
      setBirthday(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView style={tw`flex w-full h-full`} behavior="padding">
      <Gradient />
      <SafeAreaView>
        <Animated.View style={[tw`flex flex-row`, position]}>
          <View style={tw`w-full pt-32`}>
            <Text
              style={tw`w-full text-xl text-center text-white font-rajdhani700`}
            >
              Welcome to RexChange
            </Text>
            <Text
              style={tw`w-full text-xl text-center text-white font-rajdhani700`}
            >
              Where locals reign supreme.
            </Text>
            <Text
              style={tw`w-full py-4 text-base text-center text-white font-overpass500`}
            >
              Help us customise your game experience.
            </Text>
            <Text
              style={tw`w-full py-4 text-base text-center text-white font-overpass500`}
            >
              Enter zip code
            </Text>
            <View style={tw`flex flex-row justify-center my-10`}>
              <TextInput
                value={zip[0]}
                onChangeText={(value) => {
                  handleChange(value, 0);
                }}
                onKeyPress={(
                  event: NativeSyntheticEvent<TextInputKeyPressEventData>,
                ) => handleKeyPress(event, 0)}
                keyboardType="number-pad"
                ref={zip0}
                style={tw`w-10 mx-3 text-xl text-center text-white border-white border-solid border-b-1 font-rajdhani700`}
              />
              <TextInput
                value={zip[1]}
                onChangeText={(value) => {
                  handleChange(value, 1);
                }}
                onKeyPress={(
                  event: NativeSyntheticEvent<TextInputKeyPressEventData>,
                ) => handleKeyPress(event, 1)}
                keyboardType="number-pad"
                ref={zip1}
                style={tw`w-10 mx-3 text-xl text-center text-white border-white border-solid border-b-1 font-rajdhani700`}
              />
              <TextInput
                value={zip[2]}
                onChangeText={(value) => {
                  handleChange(value, 2);
                }}
                onKeyPress={(
                  event: NativeSyntheticEvent<TextInputKeyPressEventData>,
                ) => handleKeyPress(event, 2)}
                keyboardType="number-pad"
                ref={zip2}
                style={tw`w-10 mx-3 text-xl text-center text-white border-white border-solid border-b-1 font-rajdhani700`}
              />
              <TextInput
                value={zip[3]}
                onChangeText={(value) => {
                  handleChange(value, 3);
                }}
                onKeyPress={(
                  event: NativeSyntheticEvent<TextInputKeyPressEventData>,
                ) => handleKeyPress(event, 3)}
                keyboardType="number-pad"
                ref={zip3}
                style={tw`w-10 mx-3 text-xl text-center text-white border-white border-solid border-b-1 font-rajdhani700`}
              />
              <TextInput
                value={zip[4]}
                onChangeText={(value) => {
                  handleChange(value, 4);
                }}
                onKeyPress={(
                  event: NativeSyntheticEvent<TextInputKeyPressEventData>,
                ) => handleKeyPress(event, 4)}
                keyboardType="number-pad"
                ref={zip4}
                style={tw`w-10 mx-3 text-xl text-center text-white border-white border-solid border-b-1 font-rajdhani700`}
              />
            </View>
            <Pressable onPress={slideRight}>
              <Text
                style={tw`w-full text-lg text-center text-white font-rajdhani700`}
              >
                Skip
              </Text>
            </Pressable>
          </View>
          <View style={tw`w-full p-8`}>
            <View style={tw`flex flex-row items-center justify-between`}>
              <Pressable
                style={tw`flex flex-row items-center`}
                onPress={slideLeft}
              >
                <Image
                  source={require('../../assets/chevron_left_white.png')}
                />
                <Text style={tw`ml-4 text-lg text-white font-rajdhani700`}>
                  Back
                </Text>
              </Pressable>
              <Pressable onPress={slideRight}>
                <Text style={tw`ml-4 text-lg text-white font-rajdhani700`}>
                  Skip
                </Text>
              </Pressable>
            </View>
            <Text
              style={tw`w-full pt-10 text-base text-center text-white font-overpass500`}
            >
              Your birthday
            </Text>

            <Pressable
              style={tw`flex items-center justify-center p-4 my-10 border-white border-solid rounded-md border-1`}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={tw`text-lg text-white font-overpass500`}>
                {birthday ? birthday.toLocaleDateString() : 'Select Birthday'}
              </Text>
            </Pressable>
            
            {showDatePicker && (
              <RNDateTimePicker
                textColor="white"
                onChange={handleDateChange}
                style={tw`my-10`}
                display="default"
                value={birthday || new Date()}
                mode="date"
              />
            )}
            
            <Pressable
              style={[
                tw`flex items-center justify-center mr-1 border-solid rounded-md border-1 bg-green border-green h-15`,
              ]}
              onPress={slideRight}
            >
              <Text style={[tw`text-lg text-white font-overpass500`]}>
                Next
              </Text>
            </Pressable>
          </View>
          <View style={tw`flex w-full h-full p-8`}>
            <View style={tw`flex flex-row items-center justify-between`}>
              <Pressable
                style={tw`flex flex-row items-center`}
                onPress={slideLeft}
              >
                <Image
                  source={require('../../assets/chevron_left_white.png')}
                />
                <Text style={tw`ml-4 text-lg text-white font-rajdhani700`}>
                  Back
                </Text>
              </Pressable>
              <Pressable onPress={createUser}>
                <Text style={tw`ml-4 text-lg text-white font-rajdhani700`}>
                  Skip
                </Text>
              </Pressable>
            </View>
            <Text
              style={tw`w-full pt-10 text-base text-center text-white font-overpass500`}
            >
              Are you a real estate professional?
            </Text>

            <View style={tw`flex flex-row items-center py-10`}>
              <Pressable
                style={[
                  tw`flex items-center justify-center flex-1 mr-1 border-white border-solid rounded-md border-1 h-15`,
                  realEstate == false ? tw`bg-green border-green` : {},
                ]}
                onPress={() => setRealEstate(false)}
              >
                <Text style={[tw`text-lg text-white font-overpass500`]}>
                  No
                </Text>
              </Pressable>
              <Pressable
                style={[
                  tw`flex items-center justify-center flex-1 ml-1 border-white border-solid rounded-md border-1 h-15`,
                  realEstate == true ? tw`bg-green border-green` : {},
                ]}
                onPress={() => setRealEstate(true)}
              >
                <Text style={[tw`text-lg text-white font-overpass500`]}>
                  Yes
                </Text>
              </Pressable>
            </View>
            <TouchableOpacity
              style={[
                tw`flex items-center justify-center mt-auto ml-1 border-solid rounded-md border-1 bg-green border-green h-15`,
              ]}
              onPress={createUser}
            >
              <Text style={[tw`text-lg text-white font-overpass500`]}>
                Start Playing
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default UserDataScreen;