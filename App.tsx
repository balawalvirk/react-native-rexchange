import { useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { Settings } from "react-native-fbsdk-next";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BackHandler, Keyboard, Platform } from "react-native";
import PromoCodeScreen from "./screens/PromoCode";
import {
  useFonts,
  Rajdhani_700Bold,
  Rajdhani_600SemiBold,
  Rajdhani_500Medium,
} from "@expo-google-fonts/rajdhani";
import {
  Overpass_600SemiBold,
  Overpass_500Medium,
  Overpass_400Regular,
  Overpass_700Bold,
} from "@expo-google-fonts/overpass";
import LoginScreen from "./screens/Login";
import app from "./firebase/config";
import SocialAuthScreen from "./screens/SocialAuth";
import GameScreen from "./screens/Game";
import { AuthProvider } from "./providers/authProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ScrollEnabledProvider } from "./providers/scrollEnabledProvider";
import HomeScreen from "./screens/Home";
import PropertyView from "./components/Property";
import OffMarketProperty from "./screens/OffMarketProperty";
import usePushNotifications from "./hooks/usePushNotifications";
import { PortfolioProvider } from "./providers/portfolioProvider";
import RegisterScreen from "./screens/Home/Register.tsx";
import SignUpScreen from "./screens/SignUp";
import UserDataScreen from "./screens/UserData";
import _ from "lodash";
import ProfileTab from "./screens/Home/ProfileTab";
import ForgotPasswordScreen from "./screens/ForgotPassword";
import OpenHouseForm from "./screens/OpenHouseForm";
import OpenHouseHomeTabs from "./screens/OpenHouseHomeTabs/OpenHouseHomeTabs";
import { View, Text } from "react-native";
import Gradient from "./lib/svg/Gradient";
import tw from "./lib/tailwind/tailwind";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Sentry from "@sentry/react-native";
import { SafeAreaView } from "react-native-safe-area-context";

Sentry.init({
  dsn: "https://3773fdc070c7f8eb426f2e9fa9b9a92f@o1221440.ingest.us.sentry.io/4506856629075968",
});

const Stack = createNativeStackNavigator();

const DefaultScreen = () => {
  return (
    <View style={tw`flex w-full h-full`}>
      <Gradient />
    </View>
  );
};

// Custom navigation container that handles back button properly
const AppNavigator = () => {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // Add navigation state listener to dismiss keyboard on Android
    const unsubscribe = navigationRef.current?.addListener("state", () => {
      if (Platform.OS === "android") {
        Keyboard.dismiss();
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const backAction = () => {
      const currentRoute = navigationRef.current?.getCurrentRoute();

      // Only exit the app when on the Game screen (property feed)
      if (currentRoute?.name === "game") {
        BackHandler.exitApp();
        return true; // Prevent default back action
      }

      // For all other screens, allow normal back navigation
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <AuthProvider>
        <PortfolioProvider>
          <ScrollEnabledProvider>
            <BottomSheetModalProvider>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                {/* Auth screens - these should not be in the back stack when logged in */}
                <Stack.Screen name="promo-code" component={PromoCodeScreen} />
                <Stack.Screen name="login" component={LoginScreen} />
                <Stack.Screen name="register" component={RegisterScreen} />
                <Stack.Screen name="sign-up" component={SignUpScreen} />
                <Stack.Screen
                  name="forgot-password"
                  component={ForgotPasswordScreen}
                />
                <Stack.Screen name="user-data" component={UserDataScreen} />
                <Stack.Screen name="social" component={SocialAuthScreen} />

                {/* Main app screens - these are the main navigation */}
                <Stack.Screen
                  name="home"
                  component={HomeScreen}
                  options={{
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="game"
                  component={GameScreen}
                  options={{
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="open-house-home"
                  component={OpenHouseHomeTabs}
                  options={{
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="for-sale-property"
                  component={PropertyView as any}
                  options={{
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="off-market-property"
                  component={OffMarketProperty as any}
                  options={{
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="profile"
                  component={ProfileTab}
                  options={{
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="open-house-form"
                  component={OpenHouseForm}
                  options={{
                    animation: "slide_from_bottom",
                  }}
                />
              </Stack.Navigator>
            </BottomSheetModalProvider>
          </ScrollEnabledProvider>
        </PortfolioProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};
export default function App() {
  let [fontsLoaded] = useFonts({
    Rajdhani_700Bold,
    Overpass_600SemiBold,
    Overpass_500Medium,
    Overpass_400Regular,
    Overpass_700Bold,
    Rajdhani_600SemiBold,
    Rajdhani_500Medium,
  });

  useEffect(() => {
    let firebase = app;

    // Initialize Facebook SDK
    Settings.setAppID("345762047270780");
    Settings.initializeSDK();
    console.log("Facebook SDK initialized");
  }, []);
  const pushNotification = usePushNotifications();

  const checkForAuth = async () => {
    const user = getAuth().currentUser;
    if (user) {
      return;
    }
  };

  if (!fontsLoaded) {
    return <></>;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
