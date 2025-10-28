import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { isLarge } from '../../lib/helpers/dimensions';
import { formatMoney } from '../../lib/helpers/money';
import { FixedPriceBid } from '../../lib/models/fixedPriceBids';
import { createEnterAGuessStyles } from './enterAGuessStyles';
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
  selectedPosition: 0 | 1 | 2 | null;
  listPrice: number;
  currentRextimate: { amount: number };
}

const EnterAGuess: React.FC<EnterAGuessProps> = ({
  setStep,
  setFixedPriceBid,
  onSubmit,
  setSelectedPosition,
  setPositionWasSet,
  existingFixedPriceBid,
  fixedPriceBid,
  selectedPosition,
  listPrice,
  currentRextimate,
}) => {
  const styles = createEnterAGuessStyles();
  const [value, setValue] = useState('');
  
  // Set initial value to rextimate price when "Just Right" is selected
  useEffect(() => {
    if (selectedPosition === 2 && !value) {
      const rextimateValue = formatMoney(currentRextimate.amount).replace(/[,$]/g, '');
      setValue(rextimateValue);
      setFixedPriceBid(currentRextimate.amount);
    }
  }, [selectedPosition, currentRextimate.amount, value, setFixedPriceBid]);
  
  const handleChange = (text: string) => {
    const stripped = text.toString()?.replace(/\D/g, '');
    
    // Limit to 7 digits maximum
    if (stripped.length <= 7) {
      const amount = parseInt(stripped) || 0;
      
      const money = stripped ? formatMoney(amount) : '';
      setValue(money.toString());
      setFixedPriceBid(amount);
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

  // Clear input field when position changes to start fresh
  useEffect(() => {
    setValue('');
    setFixedPriceBid(null);
  }, [selectedPosition]);

  // Populate input field with existing fixed price bid if available (only on initial load)
  useEffect(() => {
    if (existingFixedPriceBid && existingFixedPriceBid.amount > 0) {
      // Only populate if no position is selected yet (initial state)
      if (selectedPosition === null) {
        setValue(formatMoney(existingFixedPriceBid.amount));
        setFixedPriceBid(existingFixedPriceBid.amount);
      }
    }
  }, [existingFixedPriceBid, selectedPosition]);

  return (
    <View style={styles.mainContainer}>
      {(
        <View style={styles.guessContainer}>
          <Pressable
            style={styles.infoButton}
            onPress={() => enterAGuessBottomModalRef.current?.present()}
          >
            <Image source={require('../../assets/info_circle_purple.png')} />
          </Pressable>
          {selectedPosition === 1 ? (
            <>
              <Text style={styles.guessText}>
              Enter your predicted sales price or simply hit Submit
              </Text>
              <TextInput
                keyboardType="numeric"
                placeholder="Enter an amount"
                placeholderTextColor="#9CA3AF"
                style={[styles.textInput, styles.textInputOrange]}
                onChangeText={handleChange}
                value={value}
              />
            </>
          ) : selectedPosition === 0 ? (
            <>
              <Text style={styles.guessText}>
              Enter your predicted sales price or simply hit Submit
              </Text>
              <TextInput
                keyboardType="numeric"
                placeholder="Enter an amount"
                placeholderTextColor="#B8B8B8"
                style={[styles.textInput, styles.textInputPurple]}
                onChangeText={handleChange}
                value={value}
              />
            </>
          ) : selectedPosition === 2 ? (
            <>
              <Text style={styles.guessText}>
              Your guess should match the current price
              </Text>
              <TextInput
                keyboardType="numeric"
                placeholder={formatMoney(currentRextimate.amount)}
                placeholderTextColor="#9CA3AF"
                style={[styles.textInput, styles.textInputGreen]}
                onChangeText={handleChange}
                value={value}
                editable={false}
              />
            </>
          ) : null}
        </View>
      )}
      <View style={styles.buttonContainer}>
        <View>
          <CircleButton
            style={[styles.circleButton, styles.circleButtonRed]}
            imageURL={require('../../assets/times_red.png')}
            imageStyle={styles.circleButtonImage}
            onPress={handleCancelPress}
          />
          <Text style={[styles.buttonText, styles.buttonTextRed]}>
            Cancel
          </Text>
        </View>
        <View>
          <CircleButton
            style={[styles.circleButton, styles.circleButtonGreen]}
            imageStyle={styles.circleButtonImage}
            imageURL={require('../../assets/check_white.png')}
            onPress={() => {
              // Always allow submission - if no price entered, it will use current rextimate
              // The parent component will handle the logic for empty values
              onSubmit({});
            }}
          />
          <Text style={[styles.buttonText, styles.buttonTextGreen]}>
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
        <View style={styles.bottomSheetContainer}>
          <ScrollView style={styles.bottomSheetScrollView}>
            <View style={styles.modalHeader}>
              <Image source={require('../../assets/info_circle_purple.png')} />
              <Text style={styles.modalHeaderText}>
                Guess the sale price
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => enterAGuessBottomModalRef.current?.dismiss()}
            >
              <Image
                // style={styles.modalCloseIcon}
                source={require('../../assets/times_gray.png')}
              ></Image>
            </TouchableOpacity>
            <HorizontalLine />
            <Text style={styles.modalContentText}>
              Tell us what you think the house will actually sell for! Make sure
              you make a guess beacuse when the house sells, you'll be rewarded!
              WHen the house sells in real life, if you're within $2000 of the
              sale price, you'll win big!
            </Text>
            <Text style={styles.modalContentText}>
              Pressed "Too High"? Your guess should be lower than the current
              price.
            </Text>
            <Text style={styles.modalContentText}>
              Pressed "Too Low"? Your guess should be higher than the current
              price.
            </Text>
            <Text style={styles.modalContentText}>
              Pressed "Just Right"? Your guess should match the current price.
            </Text>
            <View style={styles.modalButtonContainer}>
              <Pressable
                onPress={() => enterAGuessBottomModalRef.current?.dismiss()}
              >
                <View style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>
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
