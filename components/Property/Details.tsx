import { View, Text, Pressable, Image } from "react-native";
import { WINDOW_WIDTH } from "../../lib/helpers/dimensions";

import { formatMoney } from "../../lib/helpers/money";
import { safeFormatMoney, safeFormatSqft, safeFormatBedBath } from "../../lib/helpers/display";
import { Property } from "../../lib/models/property";
import { RextimatePriceHistory } from "../../lib/models/rextimatePriceHistory";
import CircleButton from "../CircleButton";
import HorizontalLine from "../HorizontalLine";
import { createDetailsStyles } from "./detailsStyles";

interface DetailsProps {
  property: Property;
  onAddressPress: (args: any) => any;
  currentRextimate: RextimatePriceHistory;
  onMoreInfoPress: (args?: any) => any;
  onListingAgentPress: (args?: any) => any;
  isOpenHouse?: boolean;
  final?: boolean;
}

const Details: React.FC<DetailsProps> = ({
  property,
  onAddressPress,
  currentRextimate,
  onMoreInfoPress,
  onListingAgentPress,
  final,
  isOpenHouse,
}) => {
  const styles = createDetailsStyles(isOpenHouse || false);
  const isLarge = WINDOW_WIDTH > 600;

  return (
    <View style={styles.mainContainer}>
      <Pressable onPress={onListingAgentPress}>
        <Text style={styles.courtesyText}>
          Courtesy of {property.listingOffice?.name || 'Unknown Office'}
        </Text>
      </Pressable>
      <Pressable onPress={onAddressPress}>
        <Text style={styles.addressText}>
          {property.fullListingAddress || 'Address not available'}
        </Text>
      </Pressable>
      <View style={styles.rextimateContainer}>
        <Text style={styles.rextimateText}>
          {safeFormatMoney(currentRextimate?.amount, 'Loading...')}
        </Text>
        <View style={styles.crownContainer}>
          <Image 
            style={styles.crownImage}
            source={require("../../assets/crown_gold.png")}
          />
          <Text style={styles.currentText}>
            {final ? "Final" : "Current"} Rextimate
          </Text>
        </View>
      </View>
      {final && (
        <Text style={styles.salePriceText}>
          Sale Price:{" "}
          {safeFormatMoney(property.salePrice, "PENDING")}
        </Text>
      )}
      <View style={styles.detailsContainer}>
        <View style={styles.featureContainer}>
          <CircleButton
            style={styles.circleButton}
            imageURL={require("../../assets/bed_purple.png")}
          />
          <Text style={styles.featureText}>
            {safeFormatBedBath(property.beds, 'bed')}
          </Text>
        </View>
        <View style={styles.featureContainer}>
          <CircleButton
            style={styles.circleButtonWithMargin}
            imageURL={require("../../assets/bath_purple.png")}
          />
          <Text style={styles.featureText}>
            {safeFormatBedBath(property.baths?.total, 'bath')}
          </Text>
        </View>
        <View style={styles.featureContainer}>
          <CircleButton
            style={styles.circleButtonWithMargin}
            imageURL={require("../../assets/ruler_triangle_purple.png")}
          />
          <Text style={styles.featureText}>
            {safeFormatSqft(property.size)}
          </Text>
        </View>
        <Pressable onPress={onMoreInfoPress}>
          <View style={styles.moreInfoButton}>
            <Image
              style={styles.moreInfoIcon}
              source={require("../../assets/info_outline_purple.png")}
            />
            <Text style={styles.moreInfoText}>
              more info
            </Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.horizontalLineContainer}>
        <HorizontalLine />
      </View>
    </View>
  );
};

export default Details;
