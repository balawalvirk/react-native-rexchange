import { DocumentSnapshot, QuerySnapshot } from "@google-cloud/firestore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { Unsubscribe } from "firebase/firestore";
import _ from "lodash";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import HorizontalLine from "../../components/HorizontalLine";
import PropertyView from "../../components/Property";
import { updateUser } from "../../firebase/collections/users";
import { positionsSinceMidnightSnapshot } from "../../firebase/collections/positions";
import { WINDOW_HEIGHT } from "../../lib/helpers/dimensions";
import { Position } from "../../lib/models/positions";
import { Property } from "../../lib/models/property";
import tw from "../../lib/tailwind/tailwind";
import { useAuth } from "../../providers/authProvider";
import { useScrollEnabled } from "../../providers/scrollEnabledProvider";
import { Skip, getQueuedProperties } from "../../firebase/game";

interface GameScreenProps {}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const GameScreen: React.FC<GameScreenProps> = () => {
  const [properties, setProperties] = useState<Property[] | null>(null);
  const { scrollEnabled, setScrollEnabled } = useScrollEnabled();
  const { user, setUser } = useAuth();

  const [mlsIdsSinceMidnight, setMLSIdsSinceMidnight] = useState(
    [] as string[]
  );
  const [propertyFeed, setPropertyFeed] = useState<Property[] | null>(null);
  const [queueIsLoaded, setQueueIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mlsIdsLoaded, setMLSIdsLoaded] = useState(false);
  const [skips, setSkips] = useState([] as Skip[]);
  const [consecutiveSkipCount, setConsecutiveSkipCount] = useState(0);
  const [positionWasSet, setPositionWasSet] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const naviation = useNavigation();
  const tutorialBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const myTotalsSnapPoints = useMemo(() => ["1%", "90%"], []);
  const flatListRef = useRef<FlatList<any>>(null);

  const handleChange = (index: number) => {
    if (index == -1) {
      setScrollEnabled(true);
    } else {
      setScrollEnabled(false);
    }
  };

  useEffect(() => {
    let unsubscribe: Unsubscribe;
    if (user && !mlsIdsLoaded) {
      unsubscribe = positionsSinceMidnightSnapshot(
        user?.id || "",
        (querySnapshot: QuerySnapshot) => {
          const mlsIds = querySnapshot.docs.map(
            (doc: DocumentSnapshot) => (doc.data() as Position).mlsId
          );
          setMLSIdsSinceMidnight(mlsIds);
          setMLSIdsLoaded(true);
        }
      );
    }

    () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user && !user.tutorialFinished && queueIsLoaded && properties?.length) {
      tutorialBottomSheetModalRef.current?.present();
    }
  }, [user, queueIsLoaded, properties]);
  useEffect(() => {
    if (mlsIdsLoaded) {
      loadProperties();
    }
  }, [mlsIdsLoaded]);

  useEffect(() => {
    if (queueIsLoaded) {
      addProperties();
    }
  }, [queueIsLoaded]);

  useEffect(() => {
    if (!positionWasSet && consecutiveSkipCount == 1) {
      queueSkips();
    }
  }, [consecutiveSkipCount]);

  useEffect(() => {
    if (
      positionWasSet &&
      (consecutiveSkipCount == 2 || consecutiveSkipCount == 1)
    ) {
      undoSkips();
    }
  }, [positionWasSet]);

  const addProperties = () => {
    if (!propertyFeed) return;
    setProperties(propertyFeed);
  };

  const loadProperties = async () => {
    const queue = await getQueuedProperties(mlsIdsSinceMidnight);
    setPropertyFeed(queue);
    setQueueIsLoaded(true);
  };

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    const currentPos = Math.round(offset / WINDOW_HEIGHT);
    if (currentPos != currentIndex) {
      // we only want to call this once per scroll index change
      setCurrentIndex(currentPos);
      throttleScroll();
    }
  };

  const addSkip = (skip: Skip) => {
    const propAlreaydSkipped =
      skips.findIndex((s) => s.mlsId === skip.mlsId) != -1;
    if (propAlreaydSkipped) return;
    if (
      skips[skips.length - 1]?.zipCode == skips[skips.length - 2]?.zipCode &&
      skip.zipCode == skips[skips.length - 1]?.zipCode &&
      consecutiveSkipCount == 2
    ) {
      setConsecutiveSkipCount(3);
    } else if (
      skips[skips.length - 1]?.zipCode === skip.zipCode &&
      consecutiveSkipCount == 1
    ) {
      setConsecutiveSkipCount(2);
    } else {
      setConsecutiveSkipCount(1);
    }

    setSkips([...skips, skip]);
  };

  // update zip code order on dismount? or at interval?
  const queueSkips = () => {
    if (!properties) return;
    const zipCode = skips[skips.length - 1].zipCode;
    const propertiesToRemove = properties
      .slice(currentIndex + 2)
      .filter((prop) => prop.zipCode === zipCode);
    if (!propertiesToRemove.length) {
      setConsecutiveSkipCount(0);
      return;
    }
    const propertiesToKeep = properties
      .slice(currentIndex + 2)
      .filter((prop) => prop.zipCode != zipCode);
    setProperties([
      ...properties.slice(0, currentIndex + 2),
      ...propertiesToKeep,
      ...propertiesToRemove,
    ]);
  };

  const undoSkips = () => {
    if (!properties) return;
    const lastSkip = _.last(skips);
    if (!lastSkip) return;
    const propertiesToAddBack = properties
      .slice(currentIndex + 2)
      .filter((prop) => prop.zipCode === lastSkip.zipCode);
    if (!propertiesToAddBack?.length) return;
    const propertiesToKeep = properties.slice(0, currentIndex + 2);
    const restOfProperties = properties
      .slice(currentIndex)
      .filter((prop) => prop.zipCode != lastSkip.zipCode);
    setProperties([
      ...propertiesToKeep,
      ...propertiesToAddBack,
      ...restOfProperties,
    ]);
    setIsSkipping(false);
  };

  const throttleScroll = () => {
    setScrollEnabled(false);
    setTimeout(() => {
      setScrollEnabled(true);
    }, 5);
  };

  const refresh = () => {
    setQueueIsLoaded(false);
    setProperties(null);
    setSkips([]);
    loadProperties();
  };

  const navigateHome = () => {
    // @ts-expect-error
    naviation.navigate("home");
  };

  const goToNextCard = () => {
    if (currentIndex < (properties?.length || 0) - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  // FlatList render function
  const renderProperty = ({
    item,
    index,
  }: {
    item: Property;
    index: number;
  }) => {
    return (
      <View style={{ height: WINDOW_HEIGHT }}>
        {/* 👈 full screen height */}
        <PropertyView
          key={item.id}
          property={item}
          queueIndex={index}
          currentIndex={index}
          addSkip={addSkip}
          clearSkips={() => setConsecutiveSkipCount(0)}
          setPositionWasSet={setPositionWasSet}
          isOpenHouse={false}
          goToNextCard={goToNextCard}
        />
      </View>
    );
  };

  // Footer component for "Way to go!" section
  const renderFooter = () => {
    return (
      <View
        style={[
          tw`flex items-center justify-center p-4`,
          { height: WINDOW_HEIGHT },
        ]}
      >
        <Text style={tw`text-xl text-darkGray font-rajdhani700`}>
          Way to go!
        </Text>
        <Text
          style={tw`px-10 my-4 leading-6 text-center text-darkGray font-overpass500`}
        >
          You've seen all available properties today. Would you like to refresh
          and see the ones you skipped?
        </Text>
        <Pressable
          onPress={refresh}
          style={tw`flex items-center justify-center w-full p-4 m-4 border-solid rounded-lg border-1 border-green bg-green`}
        >
          <Text style={tw`text-base text-white font-overpass500`}>Refresh</Text>
        </Pressable>
        <Pressable
          onPress={navigateHome}
          style={tw`flex items-center justify-center w-full p-4 mx-4 border-solid rounded-lg border-1 border-green bg-green`}
        >
          <Text style={tw`text-base text-white font-overpass500`}>Home</Text>
        </Pressable>
      </View>
    );
  };

  if (!queueIsLoaded || !properties) {
    return (
      <View style={tw`flex items-center justify-center h-full`}>
        <Text style={tw`my-4 text-lg font-rajdhani700 text-purple`}>
          Loading properties...
        </Text>
        <Image
          style={tw`-my-4 h-1/3`}
          resizeMode="contain"
          source={require("../../assets/dino-logo.png")}
        ></Image>
        <ActivityIndicator />
      </View>
    );
  }
  if (queueIsLoaded && properties && !properties?.length) {
    return (
      <View style={tw`flex items-center justify-center h-full p-4`}>
        <Text
          style={tw`mx-4 text-lg text-center font-overpass500 text-darkGray`}
        >
          You've bid on all properties for today. Please come back tomorrow and
          bid again.
        </Text>
        <Pressable
          onPress={navigateHome}
          style={tw`flex items-center justify-center w-full p-4 my-4 border-solid rounded-lg border-1 border-green bg-green`}
        >
          <Text style={tw`text-base text-white font-overpass500`}>Home</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={tw`flex-1`}>
      <FlatList
        ref={flatListRef}
        data={properties || []}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={true}
        maxToRenderPerBatch={1}
        windowSize={3}
        initialNumToRender={1}
        getItemLayout={(data, index) => ({
          length: WINDOW_HEIGHT,
          offset: WINDOW_HEIGHT * index,
          index,
        })}
        ListFooterComponent={renderFooter}
        // 👇 important for "one card at a time"
        pagingEnabled // makes swipe snap to each item
        decelerationRate={Platform.OS === "android" ? "normal" : "fast"} // normal on Android, fast on iOS
        snapToInterval={WINDOW_HEIGHT} // snap distance
        snapToAlignment="start"
        disableIntervalMomentum={Platform.OS === "android"} // disable momentum on Android only
      />
      {isSkipping && (
        <View
          style={tw`absolute inset-0 flex items-center justify-center w-full h-full bg-overlay z-100`}
        >
          <ActivityIndicator />
        </View>
      )}
      <BottomSheetModal
        ref={tutorialBottomSheetModalRef}
        index={1}
        snapPoints={myTotalsSnapPoints}
        onChange={handleChange}
        onDismiss={() => {
          updateUser(user?.docId, { tutorialFinished: true });
          setUser({ ...user, tutorialFinished: true });
        }}
      >
        <View style={[{ height: "100%", marginBottom: 100 }]}>
          <ScrollView style={tw`px-4 pb-8`}>
            <Text
              style={tw`p-4 text-center capitalize font-overpass600 text-purple`}
            >
              Welcome to Rexchange!
            </Text>
            <Pressable
              onPress={() => tutorialBottomSheetModalRef.current?.dismiss()}
            >
              <Image
                style={tw`absolute w-3 h-3 -top-8 right-4`}
                source={require("../../assets/times_gray.png")}
              ></Image>
            </Pressable>
            <HorizontalLine />
            <Text style={tw`my-4 text-base font-overpass400`}>
              Who knows how much a house is worth? At Rexchange, we believe that
              locals know their neighborhoods better than anyone else. Our{" "}
              <Text style={tw`italic`}>Rextimate</Text> is set through a
              real-time price guessing game.
            </Text>
            <Text style={tw`my-4 text-base font-overpass400`}>
              In a moment, you will see some homes{" "}
              <Text style={tw`font-overpass500`}>
                that are actually on the market,
              </Text>{" "}
              and your job is to guess whether our Rextimate is close to the
              price the house will really sell for.
            </Text>
            <Text style={tw`my-4 text-base font-overpass400`}>
              The best part is that your{" "}
              <Text style={tw`font-overpass500`}>
                guess will actually change our Rextimate in real time.
              </Text>{" "}
              The closer you get to the right price, the more equity you get!
              Get the most equity, win the game!
            </Text>
            <View
              style={tw`flex justify-start w-full h-32 p-4 mx-auto mt-auto bg-white `}
            >
              <Pressable
                onPress={() => tutorialBottomSheetModalRef.current?.dismiss()}
              >
                <View
                  style={tw`flex items-center justify-center rounded-md bg-green h-15 `}
                >
                  <Text
                    style={tw`text-lg text-center text-white font-overpass500`}
                  >
                    Ok
                  </Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default GameScreen;
