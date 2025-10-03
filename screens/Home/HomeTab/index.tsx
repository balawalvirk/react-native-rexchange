import { useEffect, useRef, useState } from "react";
import { Pressable, View, Text, Animated, FlatList, Image } from "react-native";
import { getProperties } from "../../../firebase/collections/properties";
import {
  getUniqMLSIdsForClosedPositions,
  getUniqMLSIdsForOpenPositions,
} from "../../../firebase/collections/positions";
import { Property } from "../../../lib/models/property";
import tw from "../../../lib/tailwind/tailwind";
import { useAuth } from "../../../providers/authProvider";
import PropertyView from "./PropertyView";
import { SafeAreaView } from "react-native-safe-area-context";
import _ from "lodash";

const NUMBER_TO_PULL = 2;

interface HomeTabProps {}

const HomeTab: React.FC<HomeTabProps> = () => {
  const [openProperties, setOpenProperties] = useState<Property[] | null>(null);
  const [openPropertyMLSIds, setOpenPropertyMLSIds] = useState<string[] | null>(
    null
  );
  const [closedProperties, setClosedProperties] = useState<Property[] | null>(
    null
  );
  const [closedPropertyMLSIds, setClosedPropertyMLSIds] = useState<
    string[] | null
  >(null);
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth();
  const left = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    loadOpenProperties();
    loadClosedProperties();
  }, []);

  useEffect(() => {
    if (openPropertyMLSIds) {
      loadNextOpenProperties();
    }
  }, [openPropertyMLSIds]);
  useEffect(() => {
    if (closedPropertyMLSIds) {
      loadNextClosedProperties();
    }
  }, [closedPropertyMLSIds]);

  const loadOpenProperties = async () => {
    const openPropertyMLSIds = await getUniqMLSIdsForOpenPositions(user?.id);
    setOpenPropertyMLSIds(openPropertyMLSIds);
  };

  const loadClosedProperties = async () => {
    const closedPropertyMLSIds = await getUniqMLSIdsForClosedPositions(
      user?.id
    );
    setClosedPropertyMLSIds(closedPropertyMLSIds);
  };

  const loadNextClosedProperties = async () => {
    const startIndex = closedProperties?.length ? closedProperties.length : 0;
    const mlsIdsToGet = closedPropertyMLSIds?.slice(
      startIndex,
      startIndex + NUMBER_TO_PULL
    );
    if (!mlsIdsToGet?.length) return;
    const nextProperties = await getProperties(mlsIdsToGet);
    
    // Filter Closed to include Pending (Under Contract) and Sold only
    const filteredNext = nextProperties.filter((p) =>
      ["Pending", "Sold"].includes(p.status)
    );
    const nextPropertiesOrdered = _.sortBy(nextProperties, function (obj) {
      return _.indexOf(mlsIdsToGet, obj.id);
    });
    const nextOrderedFiltered = nextPropertiesOrdered.filter((p) =>
      filteredNext.some((f) => f.id === p.id)
    );
    const updatedClosed = [
      ...(closedProperties ? closedProperties : []),
      ...nextOrderedFiltered,
    ];
    
    setClosedProperties(updatedClosed);
  };

  const loadNextClosedPropertiesDebounced = _.debounce(
    loadNextClosedProperties,
    500
  );

  const loadNextOpenProperties = async () => {
    const startIndex = openProperties?.length ? openProperties.length : 0;
    const mlsIdsToGet = openPropertyMLSIds?.slice(
      startIndex,
      startIndex + NUMBER_TO_PULL
    );

    if (!mlsIdsToGet?.length) return;
    const nextProperties = await getProperties(mlsIdsToGet);
    
    // Filter Open to include Active only
    const filteredNext = nextProperties.filter((p) => p.status === "Active");
    const nextPropertiesOrdered = _.sortBy(nextProperties, function (obj) {
      return _.indexOf(mlsIdsToGet, obj.id);
    });
    const nextOrderedFiltered = nextPropertiesOrdered.filter((p) =>
      filteredNext.some((f) => f.id === p.id)
    );
    const updatedOpen = [
      ...(openProperties ? openProperties : []),
      ...nextOrderedFiltered,
    ];
    
    setOpenProperties(updatedOpen);
  };
  const loadNextOpenPropertiesDebounced = _.debounce(
    loadNextOpenProperties,
    500
  );

  const slideToOpen = () => {
    Animated.timing(left, {
      toValue: 4,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const slideToClosed = () => {
    Animated.timing(left, {
      toValue: 136,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderOpenItem: React.FC<{ item: Property; index: number }> = ({
    item,
    index,
  }) => {
    return (
      <PropertyView
        isEnd={index == (openProperties?.length || 0) - 1}
        property={item}
        isOpenHouse={false}
      />
    );
  };

  const renderClosedItem: React.FC<{ item: Property; index: number }> = ({
    item,
    index,
  }) => {
    return (
      <PropertyView
        isEnd={index == (closedProperties?.length || 0) - 1}
        property={item}
      />
    );
  };

  return (
    <SafeAreaView style={tw`bg-white pb-50`}>
      <View style={tw`flex items-center justify-center h-28 bg-purple`}>
        <Text style={tw`my-2 text-xl text-center text-white font-rajdhani700`}>
          Valuations
        </Text>
        <View
          style={tw`flex flex-row items-center px-4 py-3 mx-6 mx-auto bg-white rounded-full w-62`}
        >
          <Animated.View
            style={[
              tw`absolute w-1/2 h-full px-8 py-4 rounded-full bg-purple`,
              { left: left },
            ]}
          ></Animated.View>
          <Pressable
            style={tw`flex-1`}
            onPress={() => {
              setIsOpen(true);
              slideToOpen();
              
            }}
          >
            <Text
              style={tw`${
                isOpen ? "text-white" : "text-darkGray"
              } uppercase ml-5 `}
            >
              Open
            </Text>
          </Pressable>
          <Pressable
            style={tw`flex-1 `}
            onPress={() => {
              setIsOpen(false);
              slideToClosed();
              
            }}
          >
            <Text
              style={tw`${
                !isOpen ? "text-white" : "text-darkGray"
              }  uppercase ml-10`}
            >
              Closed
            </Text>
          </Pressable>
        </View>
      </View>
      {isOpen && (
        <View style={tw`p-4`}>
          <FlatList
            data={openProperties}
            renderItem={renderOpenItem as any}
            keyExtractor={(item) => `${item.id}-openPropertyHome`}
            onEndReached={loadNextOpenPropertiesDebounced}
          ></FlatList>
        </View>
      )}

      {!isOpen && (
        <View style={tw`p-4`}>
          <FlatList
            data={closedProperties}
            renderItem={renderClosedItem as any}
            keyExtractor={(item) => `${item.id}-closedPropertyHome`}
            onEndReached={loadNextClosedPropertiesDebounced}
          ></FlatList>
        </View>
      )}
      {Boolean(isOpen && !openProperties?.length) && (
        <View style={tw`flex items-center justify-start w-full h-full`}>
          <Text style={tw`font-overpass500 text-darkGray`}>
            You have not bid on any open properties.
          </Text>
        </View>
      )}
      {Boolean(!isOpen && !closedProperties?.length) && (
        <View style={tw`flex items-center justify-start w-full h-full`}>
          <Text style={tw`font-overpass500 text-darkGray`}>
            You have not bid on any closed properties.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default HomeTab;
