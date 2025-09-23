import { View, Image, Pressable } from 'react-native';
import tw from '../../lib/tailwind/tailwind';

interface CircleButtonProps {
  style: any;
  imageURL: any;
  onPress?: (args: any) => any;
  imageStyle?: any;
}

const CircleButton: React.FC<CircleButtonProps> = ({
  style,
  imageURL,
  onPress,
  imageStyle,
}) => {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[tw`flex items-center justify-center p-4 rounded-full`, style]}
      >
        <Image
          style={imageStyle}
          resizeMode="contain"
          source={imageURL}
        ></Image>
      </View>
    </Pressable>
  );
};

export default CircleButton;
