import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { getOpenHouseProperties } from "../../firebase/collections/properties";
import { WINDOW_WIDTH } from "../../lib/helpers/dimensions";
import { Property } from "../../lib/models/property";
import tw from "../../lib/tailwind/tailwind";
import PropertyView from "../Home/HomeTab/PropertyView";

interface OpenHouseHomeProps {}

const OpenHouseHome: React.FC<OpenHouseHomeProps> = () => {
  const isLarge = WINDOW_WIDTH >= 600;
  const columnClass = isLarge ? "w-1/2 p-4" : "";

  const [properties, setProperties] = useState([] as Property[]);
  useEffect(() => {
    loadOpenHouseProperties();
  }, []);

  const loadOpenHouseProperties = async () => {
    const properties = await getOpenHouseProperties();
    setProperties(properties);
  };

  const renderProperty: React.FC<{ item: Property; index: number }> = ({
    item,
    index,
  }) => {
    return (
      <View style={tw`${columnClass}`}>
        {/* <PropertyView
          isEnd={index == (properties?.length || 0) - 1}
          property={item}
          isOpenHouse={true}
        /> */}
      </View>
    );
  };
  const numberOfCols = isLarge ? 2 : 1;
  return (
    <SafeAreaView style={tw`w-full bg-white`}>
      <View
        style={tw`flex flex-row items-center justify-center px-10 h-28 bg-purple`}
      >
        <Text style={tw`my-2 text-xl text-center text-white font-rajdhani700`}>
          Open House Properties
        </Text>
      </View>
      <View style={tw`w-full px-4 pt-8 pb-44`}>
        <FlatList
          data={properties}
          renderItem={renderProperty as any}
          keyExtractor={(item) => `${item.id}-openHousePropertyHome`}
          numColumns={numberOfCols}
          horizontal={false}
        ></FlatList>
      </View>

      {Boolean(!properties?.length) && (
        <View style={tw`flex items-center justify-start w-full h-full`}>
          <Text style={tw`font-overpass500 text-darkGray`}>
            You have not selected any open house properties.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OpenHouseHome;
