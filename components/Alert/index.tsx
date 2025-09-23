import React from 'react';
import { View, Text } from 'react-native';
import { isLarge } from '../../lib/helpers/dimensions';
import tw from '../../lib/tailwind/tailwind';
interface AlertProps {
  message: string;
  status: 'success' | 'error';
}

const Alert: React.FC<AlertProps> = ({ message, status }) => {
  const textSize = isLarge ? 'text-2xl' : 'text-base';
  return (
    <View style={tw` w-full p-4 ${status === 'error' ? 'bg-red' : 'bg-green'}`}>
      <Text style={tw`${textSize} font-overpass600 text-white`}>{message}</Text>
    </View>
  );
};

export default Alert;
