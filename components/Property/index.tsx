import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Text,
  View,
  PermissionsAndroid,
} from "react-native";
import Modal from "react-native-modal";
import { useEquity } from "../../firebase/equity";
import { TALL_SHEET, WINDOW_WIDTH } from "../../lib/helpers/dimensions";

import { useNavigation, useRoute } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { recordFixedPriceBid } from "../../firebase/collections/fixedPriceBids";
import { recordAPosition } from "../../firebase/collections/positions";
import { Skip } from "../../firebase/game";
import { getDateFromTimestamp } from "../../lib/helpers/calculations";
import { formatMoney } from "../../lib/helpers/money";
import { safeFormatMoney, validatePropertyBidData } from "../../lib/helpers/display";
import { Property } from "../../lib/models/property";
import tw from "../../lib/tailwind/tailwind";
import { useAuth } from "../../providers/authProvider";
import { useScrollEnabled } from "../../providers/scrollEnabledProvider";
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import CircleButton from "../CircleButton";
import HorizontalLine from "../HorizontalLine";
import ListingAgentInfo from "../ListingAgentInfo";
import MoreInfo from "../MoreInfo";
import MyTotals from "../MyTotals";
import ActivityGrid from "./ActivityGrid";
import Details from "./Details";
import EnterAGuess from "./EnterAGuess";
import ImageSlider from "./ImageSlider";
import ImageSliderModal from "./ImageSliderModal";
import OpenAPosition from "./OpenAPosition";
import PriceHistoryChart from "./PriceHistoryChart";
interface PropertyProps {
  property: Property;
  queueIndex: number;
  currentIndex: number;
  isOpenHouse: boolean;
  addSkip: (skip: Skip) => void;
  clearSkips: () => void;
  setPositionWasSet?: (args: any) => void;
  goToNextCard?: () => void;
}
const Backdrop: React.FC<any> = ({ animatedIndex, animatedPosition }) => {
  return <View style={tw`absolute inset-0 bg-black opacity-50`}></View>;
};

const PropertyView: React.FC<PropertyProps> = ({
  property,
  queueIndex,
  goToNextCard,
  currentIndex,
  isOpenHouse,
  addSkip,
  clearSkips,
  setPositionWasSet,
}) => {
  const route = useRoute();
  
  // Validate property bid data on component mount
  useEffect(() => {
    if (property) {
      validatePropertyBidData(property);
    }
  }, [property]);

  // Request photo library permissions when user enters property screen
  useEffect(() => {
    const requestPhotoPermissions = async () => {
      try {
        console.log('📸 Property screen: Requesting photo library permissions...');
        
        if (Platform.OS === 'ios') {
          // iOS permission request
          const permission = await CameraRoll.getPhotos({ first: 1 });
          console.log('✅ iOS photo library permission granted on property screen');
        } else {
          // Android explicit permission request
          console.log('📱 Requesting Android storage permissions on property screen...');
          
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
          
          const readGranted = granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
          const writeGranted = granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
          
          if (readGranted && writeGranted) {
            console.log('✅ Android storage permissions granted on property screen');
          } else {
            console.log('⚠️ Android storage permissions not fully granted on property screen:', { readGranted, writeGranted });
          }
        }
      } catch (error) {
        console.log('⚠️ Photo library permission not granted on property screen:', error);
        // This is normal - user can grant permission later when saving images
      }
    };

    // Request permissions after a short delay to ensure component is fully loaded
    setTimeout(requestPhotoPermissions, 1000);
  }, []);

  if (route.params) {
    const {
      property: paramProp,
      currentIndex: paramCurrentIndex,
      queueIndex: paramQueueIndex,
      isOpenHouse: paramIsOpenHouse,
    } = route.params as any;
    property = paramProp;
    currentIndex = paramCurrentIndex || 0;
    queueIndex = paramQueueIndex || 0;
    isOpenHouse = paramIsOpenHouse || false;
  }


  const [state, setState] = useState({
    show: false,
    index: 0,
    sheetIsOpen: false,
    moreInfoOpen: false,
    myTotalsOpen: false,
    chartIsOpen: false,
  });
  const [selectedPosition, setSelectedPosition] = useState<0 | 1 | 2 | null>(
    null
  );
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [fixedPriceBid, setFixedPriceBid] = useState(0);
  const [rextimateUpdatedAfterSubmission, setRextimateUpdatedAfterSubmission] = useState(false);
  const [isProcessingSubmission, setIsProcessingSubmission] = useState(false);
  const [submissionInitialRextimate, setSubmissionInitialRextimate] = useState<number | null>(null);

  const { setScrollEnabled } = useScrollEnabled();
  const {
    equity,
    currentRextimate,
    positions,
    positionSinceMidnight,
    fixedPriceBid: existingFixedPriceBid,
  } = useEquity(
    property?.id || '', 
    property?.listPrice || 0, 
    undefined, 
    isOpenHouse
  );

  const [showImage, setShowImage] = useState(true);
  const [imageIndex, setImageIndex] = useState(1);

  // Memoize image URLs with optimized caching and sizes
  const imageUrls = useMemo(() => {
    if (!property?.images) return [];
    return property.images.map((image, index) => {
      // Use different quality based on position for faster initial loading
      const quality = index < 3 ? 90 : 75; // Higher quality for first 3 images
      const width = index < 3 ? 1200 : 800; // Larger size for first 3 images
      const height = index < 3 ? 800 : 600;
      
      return {
        url: `https://images.weserv.nl/?url=${encodeURIComponent(
          image
        )}&w=${width}&h=${height}&fit=cover&q=${quality}`,
        // Add cache headers for better caching
        headers: {
          'Cache-Control': 'public, max-age=31536000', // 1 year cache
        }
      };
    });
  }, [property.images]);

  useEffect(() => {
    if (selectedPosition != null) {
      setStep(2);
    }
    if (selectedPosition != null && setPositionWasSet) {
      setPositionWasSet(true);
      if (selectedPosition === 2 && !fixedPriceBid) {
        setFixedPriceBid(currentRextimate.amount);
      }
    }
  }, [selectedPosition, setPositionWasSet, fixedPriceBid, currentRextimate.amount]);

  // Ensure scrolling is re-enabled when component unmounts
  useEffect(() => {
    return () => {
      setScrollEnabled(true);
    };
  }, [setScrollEnabled]);

  // Ensure scrolling is enabled when component mounts (no modals open initially)
  useEffect(() => {
    setScrollEnabled(true);
  }, [setScrollEnabled]);

  // Reset the rextimate updated flag and processing state when property changes
  useEffect(() => {
    setRextimateUpdatedAfterSubmission(false);
    setIsProcessingSubmission(false);
    setSubmissionInitialRextimate(null);
    setSelectedPosition(null);
    setStep(1);
    setFixedPriceBid(0);
  }, [property.id]);

  // Listen for rextimate changes after submission
  useEffect(() => {
    if (submissionInitialRextimate !== null && isProcessingSubmission) {
      if (currentRextimate.amount !== submissionInitialRextimate) {
        console.log('Rextimate change detected via useEffect:', {
          initial: submissionInitialRextimate,
          current: currentRextimate.amount
        });
        setRextimateUpdatedAfterSubmission(true);
        setIsProcessingSubmission(false);
        setSubmissionInitialRextimate(null);
        
        // User should manually swipe to next property
        // Auto-navigation removed per client request
      }
    }
  }, [currentRextimate.amount, submissionInitialRextimate, isProcessingSubmission]);

  // Enhanced preloading strategy for better performance
  useEffect(() => {
    const preloadImages = async () => {
      try {
        if (!property?.images || property.images.length === 0) return;
        
        // Preload images in batches for better performance
        const batchSize = 2;
        const totalImages = property.images.length;
        
        // Preload first batch immediately (higher priority)
        const firstBatch = property.images.slice(0, batchSize);
        await Promise.all(
          firstBatch.map((image, index) => {
            return new Promise((resolve) => {
              const img = new (global as any).Image();
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
              // Use optimized URL from imageUrls
              img.src = imageUrls[index]?.url || '';
            });
          })
        );
        
        // Preload remaining images in background with delay
        setTimeout(async () => {
          const remainingImages = property.images.slice(batchSize, totalImages);
          const chunks: string[][] = [];
          for (let i = 0; i < remainingImages.length; i += batchSize) {
            chunks.push(remainingImages.slice(i, i + batchSize));
          }
          
          for (const chunk of chunks) {
            await Promise.all(
              chunk.map((image, chunkIndex) => {
                const actualIndex = batchSize + chunks.indexOf(chunk) * batchSize + chunkIndex;
                return new Promise((resolve) => {
                  const img = new (global as any).Image();
                  img.onload = () => resolve(true);
                  img.onerror = () => resolve(false);
                  img.src = imageUrls[actualIndex]?.url || '';
                });
              })
            );
            // Small delay between batches to not overwhelm the network
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }, 500);
        
      } catch (error) {
        // Silently fail - preloading is optional
        console.log('Preloading failed:', error);
      }
    };

    preloadImages();
  }, [property.images, imageUrls]);

  useEffect(() => {
    if (step === 2) {
      setScrollEnabled(false);
    } else {
      setScrollEnabled(true);
    }
    () => setScrollEnabled(true);
  }, [step]);

  useEffect(() => {
    if (currentIndex === queueIndex + 1) {
      handleSwipe();
    }
  }, [currentIndex, queueIndex]);

  const handleSwipe = () => {
    if (selectedPosition == null) {
      const newSkip = { zipCode: property.zipCode, mlsId: property.id };
      addSkip(newSkip);
    } else if (!positionSinceMidnight) {
      clearSkips();
      handleSubmit();
    }
  };

  const handleImagePress = (index: number) => {
    setState({ ...state, show: true, index });
    setScrollEnabled(false);
  };

  const handleAddressPress = () => {
    // Use fullListingAddress as primary source since address object may be corrupted
    let addressToUse;
    
    if (property.fullListingAddress && property.fullListingAddress !== 'No address available') {
      addressToUse = property.fullListingAddress;
    } else {
      addressToUse = `${property.address.deliveryLine} ${property.address.city} ${property.address.state} ${property.zipCode}`;
    }
    
    const encodedAddress = encodeURI(addressToUse);
    Linking.openURL(`https://maps.apple.com/?address=${encodedAddress}`);
  };

  const navigation = useNavigation();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const listingAgentInfoBottomSheetRef = useRef<BottomSheetModal>(null);
  const disclaimerBottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const myTotalsBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const myTotalsSnapPoints = useMemo(() => ["90%"], []);
  const openAPositionBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleShowListingAgentInfoPress = () => {
    listingAgentInfoBottomSheetRef.current?.present();
  };
  const handleCloseModalPress = () => {
    bottomSheetModalRef.current?.dismiss();
  };
  const handleMyTotalsPresentModalPress = () => {
    myTotalsBottomSheetModalRef.current?.present();
  };
  const handleMyTotalsCloseModalPress = () => {
    myTotalsBottomSheetModalRef.current?.dismiss();
  };
  const handleDisclaimerPress = () => {
    disclaimerBottomSheetRef.current?.present();
  };
  const handleOpenAPositionPress = () => {
    openAPositionBottomSheetModalRef.current?.present();
  };

  const handleCloseDisclaimerSheet = () => {
    disclaimerBottomSheetRef.current?.dismiss();
  };
  const handleChange = (index: number) => {
    if (index == -1) {
      // Modal is closed/dismissed
      console.log('Modal closed - enabling scroll');
      setScrollEnabled(true);
    }
    if (index == 0) {
      // Modal is open/presented
      console.log('Modal opened - disabling scroll');
      setScrollEnabled(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedPosition == null) {
      Sentry.captureException("no selectedPosition");
      return;
    }
    setStep(1);
    setIsProcessingSubmission(true);
    
    console.log('Bid submission started:', {
      selectedPosition,
      currentRextimate: currentRextimate.amount,
      propertyId: property.id,
      isOpenHouse,
      fixedPriceBid
    });
    
    if (isOpenHouse) {
      // @ts-expect-error
      navigation.navigate("open-house-form", {
        address: property.address.deliveryLine,
      });
      setShowImage(false);
      setTimeout(() => {
        setShowImage(true);
      }, 100);
    }
    if (setPositionWasSet) {
      setPositionWasSet(false);
    }
    setSelectedPosition(null);
    setFixedPriceBid(0);

    try {
      await recordAPosition(
        selectedPosition,
        user,
        currentRextimate.amount,
        property.id,
        isOpenHouse
      );
      console.log('Position recorded successfully');
    } catch (error) {
      console.error('Error recording position:', error);
    }
    
    if (fixedPriceBid) {
      try {
        await recordFixedPriceBid(fixedPriceBid, user, property.id, isOpenHouse);
        console.log('Fixed price bid recorded successfully');
      } catch (error) {
        console.error('Error recording fixed price bid:', error);
      }
    }

    const initialRextimate = currentRextimate.amount;
    console.log('Setting up rextimate monitoring for submission:', initialRextimate);
    
    // Set the initial rextimate for monitoring
    setSubmissionInitialRextimate(initialRextimate);
    
    // Fallback timeout in case the useEffect doesn't catch the change
    setTimeout(() => {
      if (isProcessingSubmission) {
        console.log('Rextimate update timeout - no change detected after 3 seconds');
        setRextimateUpdatedAfterSubmission(true);
        setIsProcessingSubmission(false);
        setSubmissionInitialRextimate(null);
        
        // User should manually swipe to next property
        // Auto-navigation removed per client request
      }
    }, 3000);
  };

  const onPress = (position: any) => {
    if (position) {
      setStep(2);
    }
    setSelectedPosition(position);
  };
  const navigateHome = () => {
    if (isOpenHouse) {
      (navigation as any).navigate("open-house-home");
    } else {
      (navigation as any).navigate("home");
    }
  };

  const handleImageIndex = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const currentPos = Math.floor(offset / WINDOW_WIDTH) + 1;
    const clampedPos = Math.min(Math.max(currentPos, 1), property.images.length);
    setImageIndex(clampedPos);
  };

  const isLarge = WINDOW_WIDTH > 600;
  const listPriceText = isLarge ? "text-lg" : "text-xs";
  const circleButtonSize = "w-12 h-12";
  const circleButtonImageSize = "w-5 h-5";
  const homeButtonPosition = Platform.OS === 'android' ? "top-16 right-6" : "top-20 right-6";
  const fullScreenButtonPosition = Platform.OS === 'android' ? "top-32 right-6" : "top-36 right-6";
  const graphButtonPosition = Platform.OS === 'android' ? "top-48 right-6" : "top-54 right-6";
  const imageIndexText = isLarge ? "text-lg" : "text-xs";
  const termsConditionIcon = isLarge ? "w-8 h-8" : "w-3 h-3";
  const termsConditionInfo = isLarge ? "text-2xl" : "text-base";
  const chartMargin = isLarge ? "-mx-12 -top-16" : "-mx-5 -mt-32";
  const chartTitle = isLarge ? "text-2xl" : "text-base";
  const imageCount = "bottom-4 right-6";
  
  if (!property) {
    return (
      <View style={tw`bg-white flex-1 items-center justify-center`}>
        <Text style={tw`text-lg text-gray-500`}>....</Text>
      </View>
    );
  }
  
  return (
    <View style={[tw`bg-white`]}>
      <KeyboardAvoidingView behavior="position">
        <View style={tw`relative`}>
          {showImage && (
            <ImageSlider
              handleScrollPosition={handleImageIndex}
              onPress={handleImagePress}
              property={property}
              show={true}
              showThumbnail={Math.abs(queueIndex - currentIndex) <= 3}
            />
          )}

          <View
            style={tw`absolute px-2 py-1 bg-white rounded-md bottom-4 left-4`}
          >
            <Text style={tw`${listPriceText} text-green font-overpass600`}>
              List Price: {safeFormatMoney(property.listPrice, 'List price not available')}
            </Text>
          </View>
          <View style={tw`absolute ${homeButtonPosition} right-6`}>
            <CircleButton
              style={tw`${circleButtonSize} bg-purple`}
              imageStyle={tw`${circleButtonImageSize}`}
              imageURL={require("../../assets/home_logo_white.png")}
              onPress={navigateHome}
            />
          </View>
          <View style={tw`absolute ${fullScreenButtonPosition} right-6`}>
            <CircleButton
              style={tw`${circleButtonSize} bg-black`}
              imageStyle={tw`${circleButtonImageSize}`}
              imageURL={require("../../assets/fullscreen.png")}
              onPress={() => handleImagePress(imageIndex - 1)}
            />
          </View>
          <View style={tw`absolute ${graphButtonPosition} right-6`}>
            <CircleButton
              style={tw`${circleButtonSize} bg-yellow`}
              imageStyle={tw`${circleButtonImageSize} flex-1`}
              imageURL={require("../../assets/chart_purple.png")}
              onPress={() => setState({ ...state, chartIsOpen: true })}
            />
          </View>
          <View
            style={tw`absolute px-2 py-1 rounded-md bg-purple ${imageCount}`}
          >
            <Text style={tw`text-white ${imageIndexText}`}>
              {Math.min(Math.max(imageIndex, 1), property.images.length)} of {property.images.length}
            </Text>
          </View>
        </View>
        <Details
          key={`details-${property.id}-${property.fullListingAddress}`}
          onListingAgentPress={handleShowListingAgentInfoPress}
          property={property}
          onAddressPress={handleAddressPress}
          onMoreInfoPress={handlePresentModalPress}
          currentRextimate={currentRextimate}
          isOpenHouse={isOpenHouse}
        />
        {step == 1 ? (
          <>
            <ActivityGrid
              property={property}
              onMyPositionsPress={handleMyTotalsPresentModalPress}
              currentRextimate={currentRextimate}
              equity={equity}
              positions={positions}
              isOpenHouse={isOpenHouse}
            />
            <OpenAPosition
              positions={positions}
              positionSinceMidnight={positionSinceMidnight}
              currentRextimate={currentRextimate}
              onOpenAPositionInfoPress={handleOpenAPositionPress}
              selectedPosition={selectedPosition}
              onPress={onPress}
              isOpenHouse={isOpenHouse}
              rextimateUpdatedAfterSubmission={rextimateUpdatedAfterSubmission}
              isProcessingSubmission={isProcessingSubmission}
              fixedPriceBid={fixedPriceBid}
            />
            <Pressable onPress={handleDisclaimerPress}>
              <View style={tw`flex flex-row p-4`}>
                <Image
                  style={tw`${termsConditionIcon} mr-2`}
                  source={require("../../assets/gsrein_logo.png")}
                ></Image>
                <Text numberOfLines={1} style={tw`flex-1 ${imageIndexText}`}>
                  Information herein is deemed reliable but not guaranteed and
                  is provided exclusively for consumers personal, non-commercial
                  use, and may not be used for any purpose other than to
                  identify prospective properties consumers may be interested in
                  purchasing.
                </Text>
              </View>
            </Pressable>
          </>
        ) : (
          <EnterAGuess
            setStep={setStep}
            existingFixedPriceBid={existingFixedPriceBid}
            setFixedPriceBid={setFixedPriceBid}
            onSubmit={handleSubmit}
            setSelectedPosition={setSelectedPosition}
            setPositionWasSet={(positionWasSet) =>
              setPositionWasSet ? setPositionWasSet(positionWasSet) : null
            }
            fixedPriceBid={fixedPriceBid}
            selectedPosition={selectedPosition}
            listPrice={property.listPrice}
          />
        )}
      </KeyboardAvoidingView>

      {/* Bottom Sheets */}
      {/* {showOverlay && (
        <View style={tw`absolute inset-0 bg-black opacity-50`}></View>
      )} */}
      <BottomSheetModal
        ref={disclaimerBottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleChange}
        onDismiss={() => {
          setScrollEnabled(true);
        }}
        onAnimate={handleChange}
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: 0.58,
          shadowRadius: 16.0,

          elevation: 24,
        }}
      >
        <Text
          style={tw`p-4  ${termsConditionInfo} text-center capitalize font-overpass600 text-purple`}
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
        <View style={tw`px-4 py-2`}>
          <Text style={tw`my-2  ${termsConditionInfo} font-overpass400`}>
            Information herein is deemed reliable but not guaranteed and is
            provided exclusively for consumers personal, non-commercial use, and
            may not be used for any purpose other than to identify prospective
            properties consumers may be interested in purchasing.
          </Text>
        </View>
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleChange}
        onDismiss={() => {
          setScrollEnabled(true);
        }}
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: 0.58,
          shadowRadius: 16.0,

          elevation: 24,
        }}
      >
        <MoreInfo
          close={handleCloseModalPress}
          property={property}
          currentRextimate={currentRextimate}
        />
      </BottomSheetModal>
      <BottomSheetModal
        ref={openAPositionBottomSheetModalRef}
        index={0}
        snapPoints={myTotalsSnapPoints}
        onChange={handleChange}
        onDismiss={() => {
          setScrollEnabled(true);
        }}
        style={[
          {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 0.58,
            shadowRadius: 16.0,

            elevation: 24,
          },
          tw`mt-10`,
        ]}
      >
        <View style={tw`px-4 py-8`}>
          <Text style={tw`my-2 font-overpass400 ${termsConditionInfo}`}>
            <Text style={tw`font-bold font-overpass700 ${termsConditionInfo}`}>
              Important:{" "}
            </Text>
            Your valuations and guesses made on properties are not real offers
            or bids to purchase those properties.
          </Text>
          <Text style={tw`my-2  ${termsConditionInfo} font-overpass400`}>
            Submitting a Valuation is how you can earn the most Rexbucks on
            Rexchange.
          </Text>
          <Text style={tw`my-2  ${termsConditionInfo} font-overpass400`}>
            Look at the current price and decide whether the Rextimate is 'Too
            High', 'Too Low', or 'Just Right'. For example, if you think the
            house will sell for more than the current Rextimate, you should pick
            'Too Low' because you are saying that the current price is TOO LOW.
          </Text>
          <Text style={tw`my-2  ${termsConditionInfo} font-overpass400`}>
            If the position is in line with the majority of players, then you
            will gain Rexbucks. If it goes against the majority of players, then
            you'll lose Rexbucks. Your gains/losses are determined by the change
            in the Rextimate.
          </Text>
          <Text style={tw`my-2  ${termsConditionInfo} font-overpass400`}>
            Once the house goes under contract, you will not be able to submit
            new valuations, and total gains and losses will be calculated based
            on the actual sale price once the house officially sells.
          </Text>
        </View>
      </BottomSheetModal>
      <BottomSheetModal
        ref={myTotalsBottomSheetModalRef}
        index={0}
        snapPoints={myTotalsSnapPoints}
        onChange={handleChange}
        onDismiss={() => {
          setScrollEnabled(true);
        }}
        style={[
          {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 0.58,
            shadowRadius: 16.0,

            elevation: 24,
          },
        ]}
      >
        <View style={[{ height: "100%" }]}>
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
      <BottomSheetModal
        ref={listingAgentInfoBottomSheetRef}
        index={0}
        snapPoints={myTotalsSnapPoints}
        onChange={handleChange}
        onDismiss={() => {
          setScrollEnabled(true);
        }}
        style={[
          {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 0.58,
            shadowRadius: 16.0,

            elevation: 24,
          },
          tw`mt-10`,
        ]}
      >
        <ListingAgentInfo property={property} />
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
            tw`flex justify-end flex-1 pb-2 mb-32 ${chartMargin} bg-white rounded-md`,
            { width: WINDOW_WIDTH, height: TALL_SHEET },
          ]}
        >
          <Text
            style={tw`p-4 text-center capitalize font-overpass600 text-purple ${chartTitle}`}
          >
            Rextimate Price History
          </Text>
          {/* <Pressable
            style={tw`absolute -top-8 right-4 w-8 h-8 items-center justify-center`}
            onPress={() => setState({ ...state, chartIsOpen: false })}
          >
            <Image
              style={tw`w-3 h-3`}
              source={require("../../assets/times_gray.png")}
            />
          </Pressable> */}
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
          <Text style={tw`px-4 font-overpass500 ${listPriceText}`}>
            Listed at: {safeFormatMoney(property.listPrice, 'List price not available')} on{" "}
            {getDateFromTimestamp(property.dateCreated)}
          </Text>
          <Text style={tw`px-4 font-overpass500 ${listPriceText}`}>
            Current Rextimate: {formatMoney(currentRextimate.amount)}
          </Text>
          <Image
            style={tw`w-16 h-16 px-4 mx-auto mt-4`}
            resizeMode="contain"
            source={require("../../assets/gsrein_logo.png")}
          ></Image>
        <Text
        style={tw`pt-4 px-4  ${listPriceText} text-center    `}
        >Swipe up to close rextimate price history
        </Text>
<View style={tw`h-10 bg-gray-400 h-1 w-10 self-center mt-2 rounded-full ` } />

        </View>
      </Modal>
      {/* IMAGE SLIDER */}
      {state.show && (
        <ImageSliderModal
          imageUrls={imageUrls}
          state={state}
          setState={setState}
          onClose={() => setScrollEnabled(true)}
        ></ImageSliderModal>
      )}
    </View>
  );
};

export default PropertyView;
