import { useEffect, useRef } from "react";
import { auth } from "./firebase/config";
import { Settings } from "react-native-fbsdk-next";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BackHandler, Keyboard, Platform, ActivityIndicator } from "react-native";
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
import { AuthProvider, useAuth } from "./providers/authProvider";
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
import AsyncStorage from '@react-native-async-storage/async-storage';

Sentry.init({
  dsn: "https://3773fdc070c7f8eb426f2e9fa9b9a92f@o1221440.ingest.us.sentry.io/4506856629075968",
  profilesSampleRate: 0,     // disable transaction-based profiling
  platformProfilers: false,  // disable native profilers
});

// Clear all cache on app version change
const clearCacheOnVersionChange = async () => {
  try {
    const currentVersion = "3.1.19";
    const storedVersion = await AsyncStorage.getItem('appVersion');
    
    if (storedVersion !== currentVersion) {
      await AsyncStorage.clear(); // Clear ALL stored data
      await AsyncStorage.setItem('appVersion', currentVersion);
    }
  } catch (error) {
  }
};

clearCacheOnVersionChange();

const Stack = createNativeStackNavigator();

const LoadingScreen = () => {
  return (
    <View style={tw`flex w-full h-full items-center justify-center bg-white`}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={tw`mt-4 text-lg text-purple font-rajdhani700`}>Loading...</Text>
    </View>
  );
};

// Navigation content that uses auth state
const NavigationContent = () => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If user is logged in, show main app screens
  if (user) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={user.isOpenHouse ? 'open-house-home' : 'game'}
      >
        {/* Main app screens */}
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
          name="home"
          component={HomeScreen}
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
    );
  }

  // If no user, show auth screens
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="promo-code"
    >
      {/* Auth screens */}
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
    </Stack.Navigator>
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
              <NavigationContent />
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

    // Initialize Facebook SDK with error handling
    try {
      Settings.setAppID("345762047270780");
      Settings.initializeSDK();
    } catch (error) {
      // Continue app execution even if Facebook SDK fails
    }

  }, []);
  const pushNotification = usePushNotifications();

  const checkForAuth = async () => {
    const user = auth.currentUser;
    if (user) {
      return;
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading...</Text>
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
