import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import CircleButton from "../../../components/CircleButton";
import LazyLoadedImage from "../../../components/LazyLoadedImage";
import MyTotals from "../../../components/MyTotals";
import { useEquity } from "../../../firebase/equity";
import { formatMoney } from "../../../lib/helpers/money";
import { safeFormatMoney } from "../../../lib/helpers/display";
import { Property } from "../../../lib/models/property";
import tw from "../../../lib/tailwind/tailwind";

interface PropertyViewProps {
  property: Property;
  isEnd?: boolean;
  isOpenHouse?: boolean;
}

const PropertyView: React.FC<PropertyViewProps> = ({
  property,
  isEnd,
  isOpenHouse,
}) => {
  const {
    positionSinceMidnight,
    equity,
    currentRextimate,
    positions,
    fixedPriceBid,
  } = useEquity(
    property.id,
    property.listPrice,
    property.salePrice,
    isOpenHouse
  );
  
  // Debug logging for PropertyView in valuations list (commented out to reduce log noise)
  // console.log(`🏘️ PropertyView in valuations list: ${property.fullListingAddress}`);
  // console.log(`   Property ID: ${property.id}`);
  // console.log(`   Positions count: ${positions.length}`);
  // console.log(`   Fixed Price Bid: ${fixedPriceBid ? `$${fixedPriceBid.amount}` : 'None'}`);
  // console.log(`   Equity: $${equity || 0}`);
  // console.log(`   Position since midnight: ${positionSinceMidnight ? 'Yes' : 'No'}`);
  // console.log(`   Status: ${property.status}`);
  // console.log(`   Current Rextimate: $${currentRextimate?.amount || 'N/A'}`);

  const myTotalsBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const myTotalsSnapPoints = useMemo(() => ["1%", "90%"], []);
  const [_showOverlay, setShowOverlay] = useState(false);
  const navigation = useNavigation();

  const handleChange = (index: number) => {
    if (index == -1) {
      setShowOverlay(false);
    }
    if (index == 1) {
      setShowOverlay(true);
    }
  };

  const navigateToProperty = () => {
    if (property.status === "Active") {
      // @ts-expect-error
      navigation.navigate("for-sale-property", {
        property,
        currentIndex: 0,
        queueIndex: 0,
        isOpenHouse,
      });
    } else {
      // @ts-expect-error
      navigation.navigate("off-market-property", {
        property,
      });
    }
  };
  return (
    <View style={tw`relative mb-4`}>
      <Pressable onPress={navigateToProperty}>
        <View style={tw`relative h-56`}>
          <LazyLoadedImage
            image={`${property.images[0]}`}
            thumbnail={`${property.images[0]}?width=100`}
            show={true}
            width="100%"
            height="100%"
            style={tw`rounded-lg`}
            imageWidth="500"
            showThumbnail={true}
          ></LazyLoadedImage>
          <View style={tw`absolute inset-0 rounded-lg bg-overlay`}></View>
          {Boolean(
            property.status === "Active" &&
              (!positionSinceMidnight || isOpenHouse)
          ) ? (
            <View
              style={tw`absolute px-4 py-2 rounded-full top-4 left-4 bg-green/80`}
            >
              <Text style={tw`text-white font-overpass500`}>
                Submit a valuation
              </Text>
            </View>
          ) : property.status === "Active" ? (
            <View
              style={tw`absolute px-4 py-2 rounded-full top-4 left-4 bg-red/80`}
            >
              <Text style={tw`text-white font-overpass500`}>
                Submit a valuation tomorrow
              </Text>
            </View>
          ) : property.status === "Pending" ? (
            <View
              style={tw`absolute px-4 py-2 rounded-full top-4 left-4 bg-yellow/50`}
            >
              <Text style={tw`text-white font-overpass500`}>Pending</Text>
            </View>
          ) : (
            <View
              style={tw`absolute px-4 py-2 rounded-full top-4 left-4 bg-red/80`}
            >
              <Text style={tw`text-white font-overpass500`}>Sold</Text>
            </View>
          )}
          <View style={tw`absolute bottom-4 left-4`}>
            <Text style={tw`text-base text-white capitalize font-overpass600`}>
              {property.address.deliveryLine}
            </Text>
            <Text style={tw`text-base text-white font-overpass600`}>
              {property.address.city}, {property.address.state}
              {property.address.zip}
            </Text>
          </View>
        </View>

        <Text style={tw`font-overpass500 text-xs mt-0.5 w-3/4`}>
          Courtesy of {property.listingOffice.name}
        </Text>
        <View style={tw`flex flex-row items-center`}>
          <Image source={require("../../../assets/crown_gold.png")}></Image>
          <Text style={tw`ml-1 text-xl uppercase text-purple font-rajdhani700`}>
            Rextimate: {safeFormatMoney(currentRextimate?.amount, '0')}
          </Text>
        </View>
        <Text style={tw`text-darkGray font-overpass600`}>
          List: {safeFormatMoney(property.listPrice, 'List price not available')}
        </Text>
        {property.salePrice && (
          <Text style={tw`text-darkGray font-overpass600`}>
            Sale Price: {safeFormatMoney(property.salePrice, 'Sale price not available')}
          </Text>
        )}
        {!isOpenHouse && (
          <View
            style={tw`flex flex-row flex-wrap items-start p-1 rounded-md bg-lightGreen items-center`}
          >
            <Image
              style={tw`h-2 w-2 mx-1 mt-1.5`}
              source={require("../../../assets/user_green.png")}
            ></Image>

            <View style={tw`flex flex-row flex-wrap items-center flex-1`}>
              {Boolean(fixedPriceBid) && (
                <>
                  <Text style={[tw`text-xs text-green font-overpass600`]}>
                    Estimate: {formatMoney(fixedPriceBid?.amount || 0)}
                  </Text>
                  <View style={tw`h-3.5 w-0.3 bg-green mx-1`}></View>
                </>
              )}
              {Boolean(positions.length) && (
                <>
                  <Text style={[tw`text-xs text-green font-overpass600 `]}>
                    {positions.length}{" "}
                    {positions.length > 1 ? "valuations" : "valuation"}
                  </Text>
                  <View style={tw`h-3.5 w-0.3 bg-green mx-1`}></View>
                </>
              )}
              <Text style={[tw`my-1 text-xs text-green font-overpass600 `]}>
                Gains/Losses: {formatMoney(equity)}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
      {!isOpenHouse && (
        <View style={tw`absolute right-2 top-45 items-center`}>
          <CircleButton
            style={tw`w-20 h-20 bg-white border-solid shadow-md border-1 border-borderGray z-100`}
            imageURL={require("../../../assets/house_dollarsign_green.png")}
            onPress={() => myTotalsBottomSheetModalRef.current?.present()}
          />
          <Text style={tw`text-xs text-green font-overpass500 mt-1`}>
            Your Valuations
          </Text>
        </View>
      )}
      {isEnd && (
        <Image
          style={tw`w-20 mx-auto`}
          resizeMode="contain"
          source={require("../../../assets/gsrein_logo.png")}
        ></Image>
      )}
      {/* Bottom Sheets */}

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
            <Pressable
              onPress={() => myTotalsBottomSheetModalRef.current?.dismiss()}
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
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default PropertyView;
