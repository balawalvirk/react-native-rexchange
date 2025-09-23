import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View } from 'react-native';
import { isLarge } from '../../../lib/helpers/dimensions';
import tw from '../../../lib/tailwind/tailwind';
import ProfileTab from '../../Home/ProfileTab';
import OpenHouseHome from '../../OpenHouseHome';

interface OpenHouseHomeTabsProps {}

const OpenHouseHomeTabs: React.FC<OpenHouseHomeTabsProps> = () => {
  const Tab = createBottomTabNavigator();


  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            if (route.name == 'Home') {
              return focused ? (
                <Image
                  style={tw`mt-4`}
                  source={require('../../../assets/house_yellow.png')}
                ></Image>
              ) : (
                <Image
                  style={tw`mt-4`}
                  source={require('../../../assets/home_logo_white.png')}
                ></Image>
              );
            }
            if (route.name == 'Profile') {
              return focused ? (
                <Image
                  style={tw`mt-4`}
                  source={require('../../../assets/profile_yellow.png')}
                ></Image>
              ) : (
                <Image
                  style={tw`mt-4`}
                  source={require('../../../assets/profile_white.png')}
                ></Image>
              );
            }
            return <></>;
          },
          tabBarShowLabel: false,
          tabBarBackground: () => (
            <View
              style={tw`relative w-full h-full pb-40 ${
                isLarge ? '-top-8' : ''
              } bg-purple`}
            ></View>
          ),
          tabBarStyle: { position: 'absolute', bottom: isLarge ? 35 : 0 },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={OpenHouseHome} />
        <Tab.Screen name="Profile" component={ProfileTab} />
      </Tab.Navigator>
    </>
  );
};

export default OpenHouseHomeTabs;
