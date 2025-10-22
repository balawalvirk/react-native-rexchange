import { Pressable, ScrollView, Platform } from "react-native";
import { IMAGE_HEIGHT, WINDOW_WIDTH } from "../../lib/helpers/dimensions";
import { Property } from "../../lib/models/property";
import LazyLoadedImage from "../LazyLoadedImage";

interface ImageSliderProps {
  property: Property;
  onPress: (args?: any) => any;
  handleScrollPosition?: (args: any) => void;
  show: boolean;
  showThumbnail: boolean;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  property,
  onPress,
  handleScrollPosition,
  show,
  showThumbnail,
}) => {
  // ImageSlider component
  
  return (
    <ScrollView
      horizontal={true}
      decelerationRate={0}
      snapToInterval={WINDOW_WIDTH}
      snapToAlignment={"center"}
      disableIntervalMomentum={true}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={{ width: WINDOW_WIDTH, height: IMAGE_HEIGHT }}
      onScroll={handleScrollPosition}
      scrollEventThrottle={Platform.OS === 'android' ? 16 : 500}
    >
      {property.images.map((image, index) => {
        return (
          <Pressable
            onPress={() => onPress(index)}
            key={`${property.id}-image-${index}`}
          >
            <LazyLoadedImage
              image={`${image}`}
              imageWidth={"1200"}
              thumbnail={`${image}?width=100`}
              showThumbnail={showThumbnail}
              show={show}
            ></LazyLoadedImage>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export default ImageSlider;
