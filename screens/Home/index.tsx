import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import HomeScreenTab from './HomeTab';
import ProfileTab from './ProfileTab';
import { Image, View } from 'react-native';
import tw from '../../lib/tailwind/tailwind';
import CircleButton from '../../components/CircleButton';
import { WINDOW_WIDTH } from '../../lib/helpers/dimensions';
interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const Tab = createBottomTabNavigator();
  const navigation = useNavigation();


  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            if (route.name == 'Home') {
              return focused ? (
                <Image
                  style={tw`mt-4`}
                  source={require('../../assets/house_yellow.png')}
                ></Image>
              ) : (
                <Image
                  style={tw`mt-4`}
                  source={require('../../assets/home_logo_white.png')}
                ></Image>
              );
            }
            if (route.name == 'Profile') {
              return focused ? (
                <Image
                  style={tw`mt-4`}
                  source={require('../../assets/profile_yellow.png')}
                ></Image>
              ) : (
                <Image
                  style={tw`mt-4`}
                  source={require('../../assets/profile_white.png')}
                ></Image>
              );
            }
            return <></>;
          },
          tabBarStyle: { 
            position: 'absolute', 
            bottom: 20,
            // Lower elevation than the button
            elevation: 1,
            zIndex: 1,
          },

          tabBarShowLabel: false,
          tabBarBackground: () => (
            <View style={tw`w-full h-full pb-40 bg-purple`}></View>
          ),
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreenTab} />
        <Tab.Screen name="Profile" component={ProfileTab} />
      </Tab.Navigator>

      <CircleButton
        style={[
          tw`absolute w-20 h-20 bg-green bottom-10`,
          { 
            left: WINDOW_WIDTH / 2 - 40,
            // Android layering fix
            elevation: 1000,
            zIndex: 9999,
          },
        ]}
        imageStyle={tw`w-10 h-10`}
        imageURL={require('../../assets/rxc_logo_white.png')}
        onPress={() => {
          console.log('Green RXC button pressed - returning to game');
          (navigation as any).reset({
            index: 0,
            routes: [{ name: 'game' }],
          });
        }}
      />
    </>
  );
};

export default HomeScreen;
