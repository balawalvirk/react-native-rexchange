import { View } from 'react-native';
import tw from '../../lib/tailwind/tailwind';

interface HorizontalLineProps {
  style?: any;
}

const HorizontalLine: React.FC<HorizontalLineProps> = ({ style }) => {
  return (
    <View
      style={[tw`border-b-1 w-full`, style ? style : tw`border-borderGray`]}
    ></View>
  );
};

export default HorizontalLine;
