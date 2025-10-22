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
import { useAuth } from "../../providers/authProvider";
import { useScrollEnabled } from "../../providers/scrollEnabledProvider";
import { Skip, getQueuedProperties } from "../../firebase/game";
import { createGameStyles } from "./gameStyles";

interface GameScreenProps {}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const GameScreen: React.FC<GameScreenProps> = () => {
  const styles = createGameStyles();
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
      <View style={styles.propertyItemContainer}>
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
      <View style={styles.footerContainer}>
        <Text style={styles.footerTitle}>
          Way to go!
        </Text>
        <Text style={styles.footerDescription}>
          You've seen all available properties today. Would you like to refresh
          and see the ones you skipped?
        </Text>
        <Pressable
          onPress={refresh}
          style={styles.footerButton}
        >
          <Text style={styles.footerButtonText}>Refresh</Text>
        </Pressable>
        <Pressable
          onPress={navigateHome}
          style={styles.footerButtonWithMargin}
        >
          <Text style={styles.footerButtonText}>Home</Text>
        </Pressable>
      </View>
    );
  };

  if (!queueIsLoaded || !properties) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading properties...
        </Text>
        <Image
          style={styles.loadingImage}
          resizeMode="contain"
          source={require("../../assets/dino-logo.png")}
        />
        <ActivityIndicator />
      </View>
    );
  }
  if (queueIsLoaded && properties && !properties?.length) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>
          You've bid on all properties for today. Please come back tomorrow and
          bid again.
        </Text>
        <Pressable
          onPress={navigateHome}
          style={styles.emptyStateButton}
        >
          <Text style={styles.emptyStateButtonText}>Home</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.mainContainer}>
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
        <View style={styles.skippingOverlay}>
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
        <View style={styles.bottomSheetContainer}>
          <ScrollView style={styles.bottomSheetScrollView}>
            <Text style={styles.bottomSheetTitle}>
              Welcome to Rexchange!
            </Text>
            <Pressable
              onPress={() => tutorialBottomSheetModalRef.current?.dismiss()}
            >
              <Image
                style={styles.bottomSheetCloseButton}
                source={require("../../assets/times_gray.png")}
              />
            </Pressable>
            <HorizontalLine />
            <Text style={styles.bottomSheetText}>
              Who knows how much a house is worth? At Rexchange, we believe that
              locals know their neighborhoods better than anyone else. Our{" "}
              <Text style={styles.bottomSheetItalicText}>Rextimate</Text> is set through a
              real-time price guessing game.
            </Text>
            <Text style={styles.bottomSheetText}>
              In a moment, you will see some homes{" "}
              <Text style={styles.bottomSheetBoldText}>
                that are actually on the market,
              </Text>{" "}
              and your job is to guess whether our Rextimate is close to the
              price the house will really sell for.
            </Text>
            <Text style={styles.bottomSheetText}>
              The best part is that your{" "}
              <Text style={styles.bottomSheetBoldText}>
                guess will actually change our Rextimate in real time.
              </Text>{" "}
              The closer you get to the right price, the more equity you get!
              Get the most equity, win the game!
            </Text>
            <View style={styles.bottomSheetButtonContainer}>
              <Pressable
                onPress={() => tutorialBottomSheetModalRef.current?.dismiss()}
              >
                <View style={styles.bottomSheetButton}>
                  <Text style={styles.bottomSheetButtonText}>
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
