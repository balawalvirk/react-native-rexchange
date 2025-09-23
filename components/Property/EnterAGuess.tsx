import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { isLarge } from '../../lib/helpers/dimensions';
import { formatMoney } from '../../lib/helpers/money';
import { FixedPriceBid } from '../../lib/models/fixedPriceBids';
import tw from '../../lib/tailwind/tailwind';
import { useScrollEnabled } from '../../providers/scrollEnabledProvider';
import CircleButton from '../CircleButton';
import HorizontalLine from '../HorizontalLine';

interface EnterAGuessProps {
  setStep: (args: 1 | 2) => void;
  existingFixedPriceBid: FixedPriceBid | null;
  setFixedPriceBid: (args: any) => void;
  onSubmit: (args: any) => any;
  setSelectedPosition: (args: any) => void;
  setPositionWasSet: (args: any) => void;
  fixedPriceBid: number;
}

const EnterAGuess: React.FC<EnterAGuessProps> = ({
  setStep,
  setFixedPriceBid,
  onSubmit,
  setSelectedPosition,
  setPositionWasSet,
  existingFixedPriceBid,
  fixedPriceBid,
}) => {
  const textSize = isLarge ? 'text-5xl h-16' : 'text-2xl my-2';
  const [value, setValue] = useState('');
  const handleChange = (text: string) => {
    if (text.length < 15) {
      const value = text;
      const stripped = value.toString()?.replace(/\D/g, '');
      const money = stripped ? formatMoney(parseInt(stripped)) : '';
      setValue(money.toString());
      setFixedPriceBid(parseInt(stripped) || 0);
    }
  };
  const handleCancelPress = () => {
    setStep(1);
    setSelectedPosition(null);
    setPositionWasSet(false);
    setFixedPriceBid(null);
  };
  const { setScrollEnabled } = useScrollEnabled();
  const enterAGuessBottomModalRef = useRef<BottomSheetModal>(null);
  const myTotalsSnapPoints = useMemo(() => ['1%', '90%'], []);
  const handleModalChange = (index: number) => {
    if (index == -1) {
    } else {
      setScrollEnabled(false);
    }
  };

  useEffect(() => {
    if (fixedPriceBid) {
      setValue(formatMoney(fixedPriceBid));
    }
  }, [fixedPriceBid]);

  const guessInfo = isLarge ? 'text-2xl' : 'text-base';
  const guessText = isLarge ? 'text-2xl' : 'text-lg';
  const guessedBidAmount = isLarge ? 'text-5xl' : 'text-2xl';
  const circleButtonText = isLarge ? 'text-xl font-bold' : 'text-base';
  const circleButtonPosition = isLarge ? 'mt-16' : '';
  const guessWhatText = isLarge  ? 'py-8 h-[200px]' : 'py-4';
  return (
    <View style={tw`mx-4 my-1`}>
      {!existingFixedPriceBid && (
        <View
          style={tw`px-8 ${guessWhatText} shadow-md border-1 border-borderGray`}
        >
          <Pressable
            style={tw`absolute right-2 top-2`}
            onPress={() => enterAGuessBottomModalRef.current?.present()}
          >
            <Image source={require('../../assets/info_circle_purple.png')} />
          </Pressable>
          <Text style={tw`${guessText} font-rajdhani600 text-center`}>
            What do you think this house will sell for?
          </Text>
          <TextInput
            keyboardType="numeric"
            style={tw` mt-auto ${textSize} text-center border-b-1 border-borderGray text-purple font-rajdhani700`}
            onChangeText={handleChange}
            value={value}
          ></TextInput>
        </View>
      )}
      {existingFixedPriceBid && (
        <View style={tw`flex items-center justify-center p-10`}>
          <Text
            style={tw`${guessText} text-center text-darkGray font-overpass500`}
          >
            You guessed that this house would sell for:
          </Text>
          <Text
            style={tw`mt-4 ${guessedBidAmount} text-center text-purple font-rajdhani700`}
          >
            {formatMoney(existingFixedPriceBid.amount)}
          </Text>
        </View>
      )}
      <View
        style={tw`flex flex-row justify-around my-4 ${circleButtonPosition}`}
      >
        <View>
          <CircleButton
            style={tw`w-20 h-20 border-2 border-solid border-red`}
            imageURL={require('../../assets/times_red.png')}
            imageStyle={tw`w-6 h-6`}
            onPress={handleCancelPress}
          />
          <Text
            style={tw`my-2 text-center uppercase text-red ${circleButtonText}`}
          >
            Cancel
          </Text>
        </View>
        <View>
          <CircleButton
            style={tw`w-20 h-20 border-2 border-solid border-green bg-green`}
            imageStyle={tw`w-6 h-6`}
            imageURL={require('../../assets/check_white.png')}
            onPress={onSubmit}
          />
          <Text
            style={tw`my-2 text-center uppercase text-green ${circleButtonText}`}
          >
            Submit
          </Text>
        </View>
      </View>
      <BottomSheetModal
        ref={enterAGuessBottomModalRef}
        index={1}
        snapPoints={myTotalsSnapPoints}
        onChange={handleModalChange}
      >
        <View style={[{ height: '100%', marginBottom: 100 }]}>
          <ScrollView style={tw`px-4 pb-8`}>
            <View style={tw`flex flex-row items-center justify-center w-full`}>
              <Image source={require('../../assets/info_circle_purple.png')} />
              <Text
                style={tw`p-4 ${guessInfo} capitalize font-overpass600 text-purple`}
              >
                Guess the sale price
              </Text>
            </View>
            <Pressable
              onPress={() => enterAGuessBottomModalRef.current?.dismiss()}
            >
              <Image
                style={tw`absolute w-3 h-3 -top-8 right-4`}
                source={require('../../assets/times_gray.png')}
              ></Image>
            </Pressable>
            <HorizontalLine />
            <Text style={tw`my-4 ${guessInfo} font-overpass400`}>
              Tell us what you think the house will actually sell for! Make sure
              you make a guess beacuse when the house sells, you'll be rewarded!
              WHen the house sells in real life, if you're within $2000 of the
              sale price, you'll win big!
            </Text>
            <Text style={tw`my-4 ${guessInfo} font-overpass400`}>
              Pressed "Too High"? Your guess should be lower than the current
              price.
            </Text>
            <Text style={tw`my-4 ${guessInfo} font-overpass400`}>
              Pressed "Too Low"? Your guess should be higher than the current
              price.
            </Text>
            <Text style={tw`my-4 ${guessInfo} font-overpass400`}>
              Pressed "Just Right"? Your guess should match the current price.
            </Text>
            <View
              style={tw`flex justify-start w-full h-32 p-4 mx-auto mt-auto bg-white `}
            >
              <Pressable
                onPress={() => enterAGuessBottomModalRef.current?.dismiss()}
              >
                <View
                  style={tw`flex items-center justify-center rounded-md bg-green h-15 `}
                >
                  <Text
                    style={tw`${guessText} text-center text-white font-overpass500`}
                  >
                    Ok
                  </Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default EnterAGuess;
