import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View, Image, Text, Pressable, FlatList, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatMoney } from "../../../lib/helpers/money";
import tw from "../../../lib/tailwind/tailwind";
import { usePortfolio } from "../../../providers/portfolioProvider";
import Settings from "../../Settings";

interface ProfileTabProps {}

const ProfileTab: React.FC<ProfileTabProps> = () => {
  const [state, setState] = useState({
    showClosedValuations: false,
    showOpenValuations: false,
    showSettings: false,
  });
  const navigation = useNavigation();

  const ListViewItem: React.FC<{ item: any; index: number }> = ({
    item,
    index,
  }) => {
    const openProperty = () => {
      if (item.status == "Sold" || item.status == "Pending") {
        // @ts-expect-error
        navigation.navigate("off-market-property", {
          property: item.property,
        });
      } else {
        // @ts-expect-error
        navigation.navigate("for-sale-property", {
          property: item.property,
        });
      }
    };
    return (
      <Pressable onPress={openProperty}>
        <View
          style={[
            tw`flex flex-row items-center justify-between py-2 ${
              index % 2 == 0 ? "bg-borderGray" : ""
            }`,
          ]}
        >
          <Text style={tw`capitalize font-overpass400`}>{item.address}</Text>
          {item.status === "Pending" && (
            <View style={tw`rounded-md bg-yellow/50`}>
              <Text style={tw`px-2 py-1 italic text-darkGray`}>pending</Text>
            </View>
          )}
          <Text
            style={tw`font-overpass400 capitalize ${
              item.equity > 0 ? "text-green" : "text-red"
            }`}
          >
            {formatMoney(item.equity)}
          </Text>
        </View>
      </Pressable>
    );
  };

  const {
    totalGainsLosses,
    closedGainsLosses,
    openGainsLosses,
    portfolioLineItems,
    refresh,
    isRefreshing,
  } = usePortfolio();
  const data = usePortfolio();
  
  // console.log('Portfolio Screen: Full portfolio data:', data);
  // console.log('Portfolio Screen: Portfolio line items:', portfolioLineItems);
  // console.log('Portfolio Screen: Total gains/losses:', totalGainsLosses);
  // console.log('Portfolio Screen: Open gains/losses:', openGainsLosses);
  // console.log('Portfolio Screen: Closed gains/losses:', closedGainsLosses);
  // console.log('Portfolio Screen: Is refreshing:', isRefreshing);

  useEffect(() => {
    refresh();
  }, []);
  return (
    <SafeAreaView style={tw`flex-1`}>
      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`flex items-center justify-center pt-10 pb-20`}
        showsVerticalScrollIndicator={true}
      >
        <Pressable
          style={tw`w-full`}
          onPress={() => setState({ ...state, showSettings: true })}
        >
          <Image
            style={tw`ml-auto mr-8`}
            resizeMode="contain"
            source={require("../../../assets/settings_light_gray.png")}
          />
        </Pressable>
        <View
          style={tw`flex items-center justify-center mx-auto rounded-full bg-lightGreen h-28 w-28`}
        >
          <Image source={require("../../../assets/profile_icon_green.png")} />
          <Text style={tw`mt-1 text-green font-overpass500`}>Portfolio</Text>
        </View>
        <View style={tw`w-full p-8`}>
        <Pressable
          onPress={() =>
            setState({
              ...state,
              showClosedValuations: !state.showClosedValuations,
            })
          }
        >
          <View
            style={tw`flex flex-row items-center justify-between w-full pb-1 my-2 border-solid border-b-1 border-borderGray`}
          >
            <View style={tw`flex flex-row items-center`}>
              <Image source={require("../../../assets/wallet_green.png")} />
              <Text style={tw`ml-2 text-base text-darkGray font-rajdhani700`}>
                Closed Valuations
              </Text>
            </View>
            <View style={tw`flex flex-row items-center`}>
              <Text style={tw`text-base text-darkGray font-rajdhani500`}>
                {formatMoney(closedGainsLosses)}
              </Text>
              {state.showClosedValuations ? (
                <Image
                  style={tw`w-8 h-8`}
                  source={require("../../../assets/chevron_up_dark-gray.png")}
                />
              ) : (
                <Image
                  style={tw`w-8 h-8`}
                  source={require("../../../assets/chevron_down_dark-gray.png")}
                />
              )}
            </View>
          </View>
        </Pressable>
        {state.showClosedValuations && (
          <FlatList
            data={portfolioLineItems.filter((item) => item.status === "Sold")}
            renderItem={ListViewItem as any}
            keyExtractor={(item) => `pli-${item.mlsId}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          ></FlatList>
        )}
        <Pressable
          onPress={() =>
            setState({
              ...state,
              showOpenValuations: !state.showOpenValuations,
            })
          }
        >
          <View
            style={tw`flex flex-row items-center justify-between w-full pb-1 my-2 border-solid border-b-1 border-borderGray`}
          >
            <View style={tw`flex flex-row items-center`}>
              <Image
                source={require("../../../assets/house_dollarsign_green_solid.png")}
              />
              <Text style={tw`ml-2 text-base text-darkGray font-rajdhani700`}>
                Open Valuations
              </Text>
            </View>
            <View style={tw`flex flex-row items-center`}>
              <Text style={tw`text-base text-darkGray font-rajdhani500`}>
                {formatMoney(openGainsLosses)}
              </Text>
              {state.showOpenValuations ? (
                <Image
                  style={tw`w-8 h-8`}
                  source={require("../../../assets/chevron_up_dark-gray.png")}
                />
              ) : (
                <Image
                  style={tw`w-8 h-8`}
                  source={require("../../../assets/chevron_down_dark-gray.png")}
                />
              )}
            </View>
          </View>
        </Pressable>
        {state.showOpenValuations && (
          <FlatList
            data={portfolioLineItems.filter((item) => item.status !== "Sold")}
            renderItem={ListViewItem as any}
            keyExtractor={(item) => `pli-${item.mlsId}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            refreshing={isRefreshing}
            onRefresh={refresh}
          ></FlatList>
        )}
        <View
          style={tw`flex flex-row items-center justify-between w-full pb-1 my-2 border-solid border-b-1 border-borderGray`}
        >
          <View style={tw`flex flex-row items-center`}>
            <Image source={require("../../../assets/balance_green.png")} />
            <Text style={tw`ml-2 text-base text-darkGray font-rajdhani700`}>
              Total Gains/Losses
            </Text>
          </View>
          <View style={tw`flex flex-row items-center`}>
            <Text style={tw`text-base text-darkGray font-rajdhani500`}>
              {formatMoney(totalGainsLosses)}
            </Text>
          </View>
        </View>

        <View style={tw`w-full mt-4`}>
          <Text style={tw`text-lg font-rajdhani700 mb-2`}>
            All Portfolio Records
          </Text>
          {isRefreshing ? (
            <View style={tw`flex items-center justify-center py-8`}>
              <Text style={tw`text-purple font-rajdhani700 text-lg`}>Loading portfolio data...</Text>
              <Text style={tw`text-darkGray font-overpass400 text-sm mt-2`}>Loading portfolio... This can take up to 10 seconds</Text>
            </View>
          ) : portfolioLineItems.length === 0 ? (
            <View style={tw`flex items-center justify-center py-8`}>
              <Text style={tw`text-gray-500`}>No portfolio records found</Text>
              <Text style={tw`text-sm text-gray-400 mt-2`}>
                Place some bids to see your portfolio
              </Text>
            </View>
          ) : (
            <FlatList
              data={portfolioLineItems}
              keyExtractor={(item, index) => `pli-${item.mlsId}-${index}`}
              renderItem={({ item, index }) => {
                return (
                  <View
                    style={tw`flex flex-row justify-between items-center border-b border-borderGray py-2`}
                  >
                    <View>
                      <Text style={tw`font-overpass500`}>{item.address}</Text>
                      <Text style={tw`text-sm text-darkGray italic`}>
                        Status: {item.status}
                      </Text>
                    </View>
                    <Text
                      style={tw`font-rajdhani600 ${
                        item.equity > 0 ? "text-green" : "text-red"
                      }`}
                    >
                      {formatMoney(item.equity)}
                    </Text>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
      </ScrollView>
      <Modal
        visible={state.showSettings}
        presentationStyle="pageSheet"
        animationType="slide"
      >
        <Settings
          onDonePress={() => setState({ ...state, showSettings: false })}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileTab;
