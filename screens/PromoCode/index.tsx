import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
  ToastAndroid,
  Platform,
  StatusBar,
} from "react-native";
import tw from "../../lib/tailwind/tailwind";
import Gradient from "../../lib/svg/Gradient";
import { FloatingLabelInput } from "react-native-floating-label-input";
import React, { useState } from "react";
import { Rajdhani_700Bold, useFonts } from "@expo-google-fonts/rajdhani";
import { Overpass_600SemiBold } from "@expo-google-fonts/overpass";
import {
  customLabelStyles,
  inputStyles,
  labelStyles,
  largeInputStyles,
  largeLabelStyles,
} from "../../lib/forms/textInput";
import Alert from "../../components/Alert";
import { validatePromoCode } from "../../firebase/collections/promoCode";
import { TouchableOpacity } from "react-native-gesture-handler";
import { isLarge } from "../../lib/helpers/dimensions";

interface PromoCodeScreenProps {
  navigation: any;
}

const PromoCodeScreen: React.FC<PromoCodeScreenProps> = ({ navigation }) => {
  let [fontsLoaded] = useFonts({
    Rajdhani_700Bold,
    Overpass_600SemiBold,
  });
  const [state, setState] = useState({ promoCode: "", error: false });

  const showToast = () => {
    if (Platform.OS === "android") {
      ToastAndroid.show("Coming Soon", ToastAndroid.SHORT);
    } else {
      <Alert status="success" message="Coming Soon" />;
    }
  };

  const handlePress = async () => {
    // Dismiss keyboard before navigation
    Keyboard.dismiss();

    // TODO: Implement promo code validation
    // Temporarily commented out for development
    // navigation.navigate('login');

    // Original promo code validation logic (commented out):
    setState({ ...state, error: false });
    const isValid = await validatePromoCode(state.promoCode);
    if (isValid) {
      // Small delay to ensure keyboard is dismissed before navigation
      setTimeout(() => {
        navigation.navigate("login");
      }, 100);
      return;
    }
    setState({ ...state, error: true });
  };
  return (
    <View style={tw`flex items-center justify-center h-full`}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <Gradient />

      <KeyboardAvoidingView
        keyboardVerticalOffset={100}
        behavior="position"
        enabled
        style={tw`flex`}
      >
        <Text
          style={tw`px-20 text-2xl text-center text-white font-rajdhani700`}
        >
          Enter Invite Code to Begin Playing!
        </Text>
        <View
          style={tw`relative mx-auto max-w-[600px] w-full h-32 p-4 text-white`}
        >
          {state.error && <Alert status="error" message="Invalid code" />}
          <FloatingLabelInput
            label={"Promo Code"}
            value={state.promoCode}
            onChangeText={(value) => setState({ ...state, promoCode: value })}
            containerStyles={{
              borderBottomColor: "white",
              borderBottomWidth: 1,
              paddingTop: isLarge ? 60 : 30,
              paddingBottom: 10,
            }}
            customLabelStyles={isLarge ? largeLabelStyles : customLabelStyles}
            inputStyles={isLarge ? largeInputStyles : inputStyles}
            labelStyles={labelStyles}
          />
          <TouchableOpacity onPress={handlePress}>
            <View
              style={tw`flex items-center justify-center w-full p-4 my-4 border-white border-solid rounded-lg border-1`}
            >
              <Text style={tw`text-lg text-center text-white font-overpass500`}>
                Submit
              </Text>
            </View>
          </TouchableOpacity>

          <Pressable onPress={showToast}>
            <Text
              style={tw`my-8 text-lg text-center text-white font-overpass600 opacity-50`}
            >
              Need an invite? Click here.
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PromoCodeScreen;
