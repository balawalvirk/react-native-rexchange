import {
  BottomSheetModal,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "@gorhom/bottom-sheet";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import Modal from "react-native-modal/dist/modal";
import CircleButton from "../../components/CircleButton";
import HorizontalLine from "../../components/HorizontalLine";
import MoreInfo from "../../components/MoreInfo";
import MyTotals from "../../components/MyTotals";
import Details from "../../components/Property/Details";
import ImageSlider from "../../components/Property/ImageSlider";
import ImageSliderModal from "../../components/Property/ImageSliderModal";
import PriceHistoryChart from "../../components/Property/PriceHistoryChart";
import { useEquity } from "../../firebase/equity";
import {
  getDateFromTimestamp,
  getDaysOnRexchange,
  getRextimateChange,
} from "../../lib/helpers/calculations";
import { TALL_SHEET } from "../../lib/helpers/dimensions";
import {
  getFixedPriceBidEquity,
  getPositionEquity,
} from "../../lib/helpers/calculations";
import { formatMoney } from "../../lib/helpers/money";
import { Property } from "../../lib/models/property";
import tw from "../../lib/tailwind/tailwind";

interface OffMarketPropertyProps {
  isOpenHouse: boolean;
}

const OffMarketProperty: React.FC<OffMarketPropertyProps> = ({
  isOpenHouse,
}) => {
  let property: Property | null = null;
  const route = useRoute();
  const [imageIndex, setImageIndex] = useState(1);
  const [showOverlay, setShowOverlay] = useState(false);

  const navigation = useNavigation();
  const [state, setState] = useState({
    show: false,
    index: 0,
    sheetIsOpen: false,
    moreInfoOpen: false,
    myTotalsOpen: false,
    chartIsOpen: false,
  });
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const disclaimerBottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["1%", "50%"], []);
  const myTotalsBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const myTotalsSnapPoints = useMemo(() => ["1%", "90%"], []);
  if (route.params) {
    const { property: paramProp } = route.params as any;
    property = paramProp as Property;
  }
  const {
    equity,
    currentRextimate,
    positions,
    positionSinceMidnight,
    fixedPriceBid: existingFixedPriceBid,
    numJustRight,
  } = useEquity(
    property?.id,
    property?.listPrice,
    property?.salePrice,
    isOpenHouse
  );
  const handleImagePress = (index: number) => {
    setState({ ...state, show: true, index });
  };
  const navigateHome = () => {
    // @ts-expect-error
    navigation.navigate("home");
  };
  const handleImageIndex = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const fullWidth = WINDOW_WIDTH * (property?.images?.length || 0);
    const currentPos = Math.round(
      (offset / fullWidth) * (property?.images?.length || 0) + 1
    );
    setImageIndex(currentPos);
  };

  const handleChange = (index: number) => {
    if (index == -1) {
      setShowOverlay(false);
    }
    if (index == 1) {
      setShowOverlay(true);
    }
  };
  const handleCloseDisclaimerSheet = () => {
    disclaimerBottomSheetRef.current?.dismiss();
  };
  const handleCloseModalPress = () => {
    bottomSheetModalRef.current?.dismiss();
  };
  const handleMyTotalsCloseModalPress = () => {
    myTotalsBottomSheetModalRef.current?.dismiss();
  };
  const handleAddressPress = () => {
    const encodedAddress = encodeURI(
      `${property?.address.deliveryLine} ${property?.address.city} ${property?.address.state} ${property?.zipCode}`
    );
    Linking.openURL(`https://maps.apple.com/?address=${encodedAddress}`);
  };

  const handlePresentModalPress = () => {
    setShowOverlay(true);
    bottomSheetModalRef.current?.present();
  };

  const handleMyTotalsPresentModalPress = () => {
    setShowOverlay(true);
    myTotalsBottomSheetModalRef.current?.present();
  };
  const handleDisclaimerPress = () => {
    setShowOverlay(true);
    disclaimerBottomSheetRef.current?.present();
  };
  const imageUrls = property?.images.map((image) => {
    return {
      url: `https://images.weserv.nl/?url=${encodeURIComponent(
        image
      )}&w=1200&h=800&fit=cover`,
    };
  });
  if (!property) {
    return <></>;
  }
  return (
    <View style={[{ height: WINDOW_HEIGHT }, tw`bg-white`]}>
      <View>
        <View style={tw`relative`}>
          <ImageSlider
            handleScrollPosition={handleImageIndex}
            onPress={handleImagePress}
            property={property}
            show={true}
            showThumbnail={true}
          />

          <View
            style={tw`absolute px-2 py-1 bg-white rounded-md bottom-4 left-4`}
          >
            <Text style={tw`text-xs text-green font-overpass600`}>
              List Price: {formatMoney(property.listPrice)}
            </Text>
          </View>
          <View style={tw`absolute top-20 right-8`}>
            <CircleButton
              style={tw`w-12 h-12 bg-purple`}
              imageStyle={tw`w-5 h-5`}
              imageURL={require("../../assets/home_logo_white.png")}
              onPress={navigateHome}
            />
          </View>
          <View style={tw`absolute top-36 right-8`}>
            <CircleButton
              style={tw`w-12 h-12 bg-black`}
              imageStyle={tw`h-7 w-7`}
              imageURL={require("../../assets/fullscreen.png")}
              onPress={() => handleImagePress(imageIndex - 1)}
            />
          </View>
          <View style={tw`absolute top-54 right-8`}>
            <CircleButton
              style={tw`w-12 h-12 bg-yellow`}
              imageStyle={tw`w-5 h-5`}
              imageURL={require("../../assets/chart_purple.png")}
              onPress={() => setState({ ...state, chartIsOpen: true })}
            />
          </View>
          <View
            style={tw`absolute px-2 py-1 text-xs rounded-md bg-purple bottom-4 right-6`}
          >
            <Text style={tw`text-white`}>
              {imageIndex} of {property.images.length}
            </Text>
          </View>
        </View>
        <Details
          property={property}
          final={true}
          onAddressPress={handleAddressPress}
          currentRextimate={currentRextimate}
          onMoreInfoPress={handlePresentModalPress}
        />
        <View style={tw`flex flex-row flex-wrap mb-2 -mt-2`}>
          {existingFixedPriceBid && (
            <>
              <View style={tw`pb-1 pl-4 pr-1 flex-50`}>
                <View
                  style={tw`flex items-center justify-center w-full p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
                >
                  <Text
                    style={tw`text-xs uppercase font-overpass700 text-darkGray`}
                  >
                    Your Guess
                  </Text>
                  <Text style={[tw`text-2xl font-rajdhani700`]}>
                    {formatMoney(existingFixedPriceBid.amount)}
                  </Text>
                </View>
              </View>
              <View style={tw`pb-1 pl-1 pr-4 flex-50`}>
                <View
                  style={tw`flex items-center justify-center w-full p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
                >
                  <Text
                    style={tw`text-xs uppercase font-overpass700 text-darkGray`}
                  >
                    Your Guess Bonus
                  </Text>
                  <Text style={tw`text-2xl font-rajdhani700`}>
                    {formatMoney(
                      getFixedPriceBidEquity(
                        existingFixedPriceBid,
                        property.salePrice,
                        numJustRight
                      )
                    )}
                  </Text>
                </View>
              </View>
            </>
          )}

          <View style={tw`pt-1 pl-4 pr-1 flex-50`}>
            <View
              style={tw`flex items-center justify-center p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
            >
              <Text
                style={tw`text-xs uppercase font-overpass700 text-darkGray`}
              >
                Your Valuations
              </Text>
              {positions.length > 0 ? (
                <Pressable onPress={handleMyTotalsPresentModalPress}>
                  <View
                    style={tw`flex items-center justify-center w-8 h-8 rounded-full border-1 border-borderGray`}
                  >
                    <Text style={tw`text-2xl font-rajdhani700`}>
                      {positions?.length || 0}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <Text style={tw`text-2xl font-rajdhani700`}>0</Text>
              )}
            </View>
          </View>
          <View style={tw`pt-1 pl-1 pr-4 flex-50`}>
            <View
              style={tw`flex items-center justify-center p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
            >
              <Text
                style={tw`text-xs uppercase font-overpass700 text-darkGray`}
              >
                Valuation Gains/Losses
              </Text>

              <Text
                style={[
                  equity < 0 ? tw`text-red` : tw`text-green`,
                  tw`text-2xl font-rajdhani700`,
                ]}
              >
                {formatMoney(getPositionEquity(positions))}
              </Text>
            </View>
          </View>
          <View style={tw`pt-1 pl-4 pr-1 flex-50`}>
            <View
              style={tw`flex items-center justify-center p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
            >
              <Text
                style={tw`text-xs uppercase font-overpass700 text-darkGray`}
              >
                Days on Rexchange
              </Text>

              <Text style={tw`text-2xl font-rajdhani700`}>
                {getDaysOnRexchange(property.dateCreated)}
              </Text>
            </View>
          </View>
          <View style={tw`pt-1 pl-1 pr-4 flex-50`}>
            <View
              style={tw`flex items-center justify-center p-2 border-solid rounded-md bg-light border-1 border-borderGray`}
            >
              <Text
                style={tw`text-xs uppercase font-overpass700 text-darkGray`}
              >
                Total Gains/Losses
              </Text>

              <Text
                style={[
                  equity < 0 ? tw`text-red` : tw`text-green`,
                  tw`text-2xl font-rajdhani700`,
                ]}
              >
                {formatMoney(getPositionEquity(positions))}
              </Text>
            </View>
          </View>
        </View>
        <Pressable onPress={handleDisclaimerPress}>
          <View style={tw`flex flex-row p-4`}>
            <Image
              style={tw`w-4 h-4 mr-2`}
              source={require("../../assets/gsrein_logo.png")}
            ></Image>
            <Text numberOfLines={1} style={tw`flex-1 text-xs`}>
              Information herein is deemed reliable but not guaranteed and is
              provided exclusively for consumers personal, non-commercial use,
              and may not be used for any purpose other than to identify
              prospective properties consumers may be interested in purchasing.
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Bottom Sheets */}
      {showOverlay && (
        <View style={tw`absolute inset-0 bg-black opacity-50`}></View>
      )}
      <BottomSheetModal
        ref={disclaimerBottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleChange}
      >
        <Text
          style={tw`p-4 text-center capitalize font-overpass600 text-purple`}
        >
          Terms and Conditions
        </Text>
        <Pressable onPress={handleCloseDisclaimerSheet}>
          <Image
            style={tw`absolute w-3 h-3 -top-8 right-4`}
            source={require("../../assets/times_gray.png")}
          ></Image>
        </Pressable>
        <HorizontalLine />
        <ScrollView style={tw`px-4 py-2`}>
          <Text style={tw`my-4 text-base font-overpass400`}>
            Information herein is deemed reliable but not guaranteed and is
            provided exclusively for consumers personal, non-commercial use, and
            may not be used for any purpose other than to identify prospective
            properties consumers may be interested in purchasing.
          </Text>
        </ScrollView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleChange}
      >
        <MoreInfo
          close={handleCloseModalPress}
          property={property}
          currentRextimate={currentRextimate}
        />
      </BottomSheetModal>

      <BottomSheetModal
        ref={myTotalsBottomSheetModalRef}
        index={1}
        snapPoints={myTotalsSnapPoints}
        onChange={handleChange}
      >
        <View style={[{ height: "100%", marginBottom: 100 }]}>
          <MyTotals property={property} />
          <View
            style={tw`absolute bottom-0 flex justify-start h-32 p-4 bg-white left-4 right-4`}
          >
            <Pressable onPress={handleMyTotalsCloseModalPress}>
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
        </View>
      </BottomSheetModal>
      <Modal
        isVisible={state.chartIsOpen}
        animationIn={"slideInDown"}
        animationInTiming={300}
        onSwipeComplete={() => {
          setState({ ...state, chartIsOpen: false });
        }}
        swipeDirection="up"
      >
        <View
          style={[
            tw`flex justify-end flex-1 pb-12 mb-32 -mx-5 -mt-32 bg-white rounded-md`,
            { width: WINDOW_WIDTH, height: TALL_SHEET },
          ]}
        >
          <Text
            style={tw`p-4 text-center capitalize font-overpass600 text-purple`}
          >
            Rextimate Price History
          </Text>
          <HorizontalLine />
          <View style={tw`mt-4`}>
            {state.chartIsOpen && (
              <PriceHistoryChart
                currentRextimate={currentRextimate}
                property={property}
                isOpenHouse={isOpenHouse}
              />
            )}
          </View>
          <Text style={tw`px-4 font-overpass500`}>
            Listed at: {formatMoney(property.listPrice)} on{" "}
            {getDateFromTimestamp(property.dateCreated)}
          </Text>
          <Text style={tw`px-4 font-overpass500`}>
            Final Rextimate: {formatMoney(currentRextimate.amount)}
          </Text>
          <Image
            style={tw`w-10 h-10 px-4 mx-auto mt-4`}
            source={require("../../assets/gsrein_logo.png")}
          ></Image>
        </View>
      </Modal>
      {/* IMAGE SLIDER */}
      {state.show && (
        <ImageSliderModal
          imageUrls={imageUrls}
          state={state}
          setState={setState}
          onClose={() => {}}
        ></ImageSliderModal>
      )}
    </View>
  );
};

export default OffMarketProperty;
