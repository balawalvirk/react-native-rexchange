  import { View, Image, TouchableOpacity } from 'react-native';
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
    <TouchableOpacity 
      style={[tw`flex items-center justify-center p-4 rounded-full`, style]} 
      onPress={onPress}
    >
      <Image
        style={imageStyle}
        resizeMode="contain"
        source={imageURL}
      />
    </TouchableOpacity>
  );
};

export default CircleButton;
