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
import { createPropertyStyles } from "./propertyStyles";

import { useNavigation, useRoute } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { recordFixedPriceBid } from "../../firebase/collections/fixedPriceBids";
import { recordAPosition } from "../../firebase/collections/positions";
import { Skip } from "../../firebase/game";
import { getDateFromTimestamp } from "../../lib/helpers/calculations";
import { formatMoney } from "../../lib/helpers/money";
import { safeFormatMoney, validatePropertyBidData } from "../../lib/helpers/display";
import { Property } from "../../lib/models/property";
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
import { heightRef } from "../../config/screenSizes";
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
  const styles = createPropertyStyles();
  return <View style={styles.backdrop}></View>;
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
  const styles = createPropertyStyles();
  
  // Validate property bid data on component mount
  useEffect(() => {
    if (property) {
      
      // Log first few image URLs for debugging
      if (property.images && property.images.length > 0) {
      } else {
      }
      
      // Check for specific problematic addresses
      if (property.fullListingAddress?.includes('2633 Dumaine') || 
          property.fullListingAddress?.includes('2322 Esplanade') ||
          property.fullListingAddress?.includes('3322 Esplanade')) {
      }
      
      validatePropertyBidData(property);
    }
  }, [property]);

  // Request photo library permissions when user enters property screen
  useEffect(() => {
    const requestPhotoPermissions = async () => {
      try {
        
        if (Platform.OS === 'ios') {
          // iOS permission request
          const permission = await CameraRoll.getPhotos({ first: 1 });
        } else {
          // Android explicit permission request
          
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
          
          const readGranted = granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
          const writeGranted = granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
          
          if (readGranted && writeGranted) {
          } else {
          }
        }
      } catch (error) {
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
    // Reset image index to 1 when property changes
    setImageIndex(1);
  }, [property.id]);

  // Listen for rextimate changes after submission
  useEffect(() => {
    if (submissionInitialRextimate !== null && isProcessingSubmission) {
      if (currentRextimate.amount !== submissionInitialRextimate) {
        setRextimateUpdatedAfterSubmission(true);
        setIsProcessingSubmission(false);
        setSubmissionInitialRextimate(null);
      }
    }
  }, [currentRextimate.amount, submissionInitialRextimate, isProcessingSubmission]);

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
      setScrollEnabled(true);
    }
    if (index == 0) {
      // Modal is open/presented
      setScrollEnabled(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedPosition == null) {
      Sentry.captureException("no selectedPosition");
      return;
    }
    
    // Ensure we have a valid user
    if (!user?.id) {
      return;
    }
    
    setStep(1);
    setIsProcessingSubmission(true);
    
    
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
    
    // Store the current values before clearing them
    const currentSelectedPosition = selectedPosition;
    const currentFixedPriceBid = fixedPriceBid;
    
    setSelectedPosition(null);
    setFixedPriceBid(0);

    try {
      // Use user's entered amount if available, otherwise use current rextimate
      // For "Just Right" positions, always use current rextimate
      const bidAmount = (currentSelectedPosition === 2 || !currentFixedPriceBid || currentFixedPriceBid <= 0) 
        ? currentRextimate.amount 
        : currentFixedPriceBid;
      
      await recordAPosition(
        currentSelectedPosition,
        user,
        bidAmount,
        property.id,
        isOpenHouse
      );
    } catch (error) {
      console.error('Error recording position:', error);
      Sentry.captureException(error, {
        tags: { userId: user?.id, function: 'recordAPosition' },
      });
    }
    
    // Only record fixed price bid if user entered a custom amount
    if (currentFixedPriceBid && currentFixedPriceBid > 0) {
      try {
        await recordFixedPriceBid(currentFixedPriceBid, user, property.id, isOpenHouse);
      } catch (error) {
        console.error('Error recording fixed price bid:', error);
        Sentry.captureException(error, {
          tags: { userId: user?.id, function: 'recordFixedPriceBid' },
        });
      }
    }

    // For "Just Right" positions or when no custom amount is entered, rextimate doesn't change
    const hasCustomAmount = currentFixedPriceBid && currentFixedPriceBid > 0;
    
    if (currentSelectedPosition === 2 || !hasCustomAmount) {
      setRextimateUpdatedAfterSubmission(true);
      setIsProcessingSubmission(false);
      setSubmissionInitialRextimate(null);
    } else {
      // For "Too High" and "Too Low" with custom amounts, monitor rextimate changes
      const initialRextimate = currentRextimate.amount;
      
      // Set the initial rextimate for monitoring
      setSubmissionInitialRextimate(initialRextimate);
      
      // Fallback timeout in case the useEffect doesn't catch the change
      setTimeout(() => {
        if (isProcessingSubmission) {
          setRextimateUpdatedAfterSubmission(true);
          setIsProcessingSubmission(false);
          setSubmissionInitialRextimate(null);
          
          // User should manually swipe to next property
          // Auto-navigation removed per client request
        }
      }, 3000);
    }
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
    
    // Calculate position with better precision for Android
    let currentPos;
    if (Platform.OS === 'android') {
      // On Android, add a small buffer to handle floating point precision issues
      const buffer = 0.1;
      currentPos = Math.floor((offset + buffer) / WINDOW_WIDTH) + 1;
    } else {
      // On iOS, use Math.floor as before
      currentPos = Math.floor(offset / WINDOW_WIDTH) + 1;
    }
    
    const clampedPos = Math.min(Math.max(currentPos, 1), property.images.length);
    
    // Only update if the position actually changed to prevent unnecessary re-renders
    if (clampedPos !== imageIndex) {
      setImageIndex(clampedPos);
    }
  };

  // Styles are now handled by the createPropertyStyles function from propertyStyles.ts
  
  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>....</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView behavior="position">
        <View style={styles.relativeContainer}>
          {showImage && (
            <ImageSlider
              handleScrollPosition={handleImageIndex}
              onPress={handleImagePress}
              property={property}
              show={true}
              showThumbnail={Math.abs(queueIndex - currentIndex) <= 3}
            />
          )}

          <View style={styles.listPriceContainer}>
            <Text style={styles.listPriceText}>
              List Price: {safeFormatMoney(property.listPrice, 'List price not available')}
            </Text>
          </View>
          <View style={styles.homeButtonContainer}>
            <CircleButton
              style={styles.circleButtonPurple}
              imageStyle={styles.circleButtonImageSize}
              imageURL={require("../../assets/home_logo_white.png")}
              onPress={navigateHome}
            />
          </View>
          <View style={styles.fullScreenButtonContainer}>
            <CircleButton
              style={styles.circleButtonBlack}
              imageStyle={styles.circleButtonImageSize}
              imageURL={require("../../assets/fullscreen.png")}
              onPress={() => handleImagePress(imageIndex - 1)}
            />
          </View>
          <View style={styles.graphButtonContainer}>
            <CircleButton
              style={styles.circleButtonYellow}
              imageStyle={styles.circleButtonImageSizeFlex}
              imageURL={require("../../assets/chart_purple.png")}
              onPress={() => setState({ ...state, chartIsOpen: true })}
            />
          </View>
          <View style={styles.imageCountContainer}>
            <Text style={styles.imageIndexText}>
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
              <View style={styles.disclaimerContainer}>
                <Image
                  style={styles.disclaimerIcon}
                  source={require("../../assets/gsrein_logo.png")}
                ></Image>
                <Text numberOfLines={1} style={styles.disclaimerText}>
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
            currentRextimate={currentRextimate}
          />
        )}
      </KeyboardAvoidingView>

      {/* Bottom Sheets */}
      {/* {showOverlay && (
        <View style={styles.backdrop}></View>
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
        style={styles.bottomSheetShadow}
      >
        <Text style={styles.termsConditionTitle}>
          Terms and Conditions
        </Text>
        <Pressable onPress={handleCloseDisclaimerSheet}>
          <Image
            style={styles.termsConditionCloseIcon}
            source={require("../../assets/times_gray.png")}
          ></Image>
        </Pressable>
        <HorizontalLine />
        <View style={styles.termsConditionContent}>
          <Text style={styles.termsConditionText}>
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
        style={styles.bottomSheetShadow}
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
        style={[styles.bottomSheetShadow, styles.bottomSheetMarginTop]}
      >
        <View style={styles.openPositionInfoContainer}>
          <Text style={styles.termsConditionText}>
            <Text style={styles.termsConditionBoldText}>
              Important:{" "}
            </Text>
            Your valuations and guesses made on properties are not real offers
            or bids to purchase those properties.
          </Text>
          <Text style={styles.termsConditionText}>
            Submitting a Valuation is how you can earn the most Rexbucks on
            Rexchange.
          </Text>
          <Text style={styles.termsConditionText}>
            Look at the current price and decide whether the Rextimate is 'Too
            High', 'Too Low', or 'Just Right'. For example, if you think the
            house will sell for more than the current Rextimate, you should pick
            'Too Low' because you are saying that the current price is TOO LOW.
          </Text>
          <Text style={styles.termsConditionText}>
            If the position is in line with the majority of players, then you
            will gain Rexbucks. If it goes against the majority of players, then
            you'll lose Rexbucks. Your gains/losses are determined by the change
            in the Rextimate.
          </Text>
          <Text style={styles.termsConditionText}>
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
        style={styles.bottomSheetShadow}
      >
        <View style={styles.myTotalsContainer}>
          <MyTotals property={property} />
          <View style={styles.myTotalsButtonContainer}>
            <Pressable onPress={handleMyTotalsCloseModalPress}>
              <View style={styles.myTotalsButton}>
                <Text style={styles.myTotalsButtonText}>
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
        style={[styles.bottomSheetShadow, styles.bottomSheetMarginTop]}
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
            styles.chartModalContainer,
            { width: WINDOW_WIDTH, height: TALL_SHEET },
          ]}
        >
          <Text style={styles.chartTitle}>
            Rextimate Price History
          </Text>
          {/* <Pressable
            style={styles.chartCloseButton}
            onPress={() => setState({ ...state, chartIsOpen: false })}
          >
            <Image
              style={styles.chartCloseIcon}
              source={require("../../assets/times_gray.png")}
            />
          </Pressable> */}
          <HorizontalLine />
          <View style={styles.chartContent}>
            {state.chartIsOpen && (
              <PriceHistoryChart
                currentRextimate={currentRextimate}
                property={property}
                isOpenHouse={isOpenHouse}
              />
            )}
          </View>
          <Text style={styles.chartInfoText}>
            Listed at: {safeFormatMoney(property.listPrice, 'List price not available')} on{" "}
            {getDateFromTimestamp(property.dateCreated)}
          </Text>
          <Text style={styles.chartInfoText}>
            Current Rextimate: {formatMoney(currentRextimate.amount)}
          </Text>
          <Image
            style={styles.chartLogo}
            resizeMode="contain"
            source={require("../../assets/gsrein_logo.png")}
          ></Image>
        <Text style={styles.chartSwipeText}>
        Swipe up to close rextimate price history
        </Text>
<View style={styles.chartSwipeIndicator} />

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
