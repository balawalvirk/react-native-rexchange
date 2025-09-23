import _ from 'lodash';
import { View, Text, Image, ScrollView } from 'react-native';
import { useEquity } from '../../firebase/equity';
import {
  getDateFromTimestamp,
  getEquityForOnePosition,
  getFixedPriceBidEquity,
} from '../../lib/helpers/calculations';
import { formatMoney } from '../../lib/helpers/money';
import { Position } from '../../lib/models/positions';
import { Property } from '../../lib/models/property';
import tw from '../../lib/tailwind/tailwind';

interface MyTotalsProps {
  property: Property;
}

const MyTotals: React.FC<MyTotalsProps> = ({ property }) => {
  const { equity, numJustRight, currentRextimate, positions, fixedPriceBid } =
    useEquity(property.id, property.listPrice, property.salePrice);
  const tooLow = positions.filter((position) => position.type === 0);
  const tooHigh = positions.filter((position) => position.type === 1);
  const justRight = positions.filter((position) => position.type === 2);
  return (
    <ScrollView>
      <View style={tw`px-4 py-8 pb-44`}>
        <Text
          style={tw`my-1 text-xl text-center font-rajdhani700 text-darkGray`}
        >
          Valuations
        </Text>
        <View
          style={[
            tw`flex items-center justify-center w-20 h-20 mx-auto my-2 rounded-full bg-lightGreen`,
          ]}
        >
          <Text style={[tw`text-3xl font-rajdhani700 text-green`]}>
            {positions.length}
          </Text>
        </View>
        <View style={tw`flex flex-row items-center justify-between`}>
          <View style={tw`flex flex-row items-center`}>
            <View
              style={tw`flex flex-row items-center justify-center w-10 h-10 rounded-full bg-lightGreen`}
            >
              <Image source={require('../../assets/balance_green.png')}></Image>
            </View>
            <Text style={tw`ml-2 text-lg font-rajdhani700 text-darkGray`}>
              Your Gains/Losses
            </Text>
          </View>

          <Text style={tw`text-lg font-rajdhani700 text-darkGray`}>
            {formatMoney(equity)}
          </Text>
        </View>
        <View style={tw`p-4 my-6 rounded-md bg-lightPurple`}>
          <View style={tw`flex flex-row justify-between`}>
            <Text style={tw`text-base text-purple font-rajdhani700`}>
              {tooLow.length}x Too Low
            </Text>
            <Image source={require('../../assets/exchange_purple.png')}></Image>
          </View>
          <View
            style={tw`bg-purple opacity-20 h-0.5 w-full rounded-md my-2`}
          ></View>
          {tooLow.map((position: Position) => {
            return (
              <View
                key={`${property.id}-${(position.dateCreated as any).seconds}`}
                style={tw`flex flex-row items-center justify-between`}
              >
                <Text style={tw`text-purple font-rajdhani600`}>
                  {getDateFromTimestamp(position.dateCreated)}{' '}
                  {formatMoney(position.rextimate)}
                </Text>
                <Text style={tw`text-purple font-rajdhani600`}>
                  {formatMoney(
                    getEquityForOnePosition(
                      position,
                      currentRextimate.amount,
                      numJustRight,
                    ),
                  )}
                </Text>
              </View>
            );
          })}
          <Text
            style={tw`mt-2 text-base text-center text-purple font-rajdhani700`}
          >
            Too Low Gains/Losses{' '}
            {formatMoney(
              _.reduce(
                tooLow,
                (total: number, position: Position) => {
                  total += getEquityForOnePosition(
                    position,
                    currentRextimate.amount,
                    numJustRight,
                  );
                  return total;
                },
                0,
              ),
            )}
          </Text>
        </View>
        <View style={tw`p-4 my-6 rounded-md bg-lightOrange`}>
          <View style={tw`flex flex-row justify-between`}>
            <Text style={tw`text-base text-orange font-rajdhani700`}>
              {tooHigh.length}x Too High
            </Text>
            <Image source={require('../../assets/exchange_yellow.png')}></Image>
          </View>
          <View
            style={tw`bg-orange opacity-20 h-0.5 w-full rounded-md my-2`}
          ></View>
          {tooHigh.map((position: Position) => {
            return (
              <View
                key={`${property.id}-${(position.dateCreated as any).seconds}`}
                style={tw`flex flex-row items-center justify-between`}
              >
                <Text style={tw`text-orange font-rajdhani600`}>
                  {getDateFromTimestamp(position.dateCreated)}{' '}
                  {formatMoney(position.rextimate)}
                </Text>
                <Text style={tw`text-orange font-rajdhani600`}>
                  {formatMoney(
                    getEquityForOnePosition(
                      position,
                      currentRextimate.amount,
                      numJustRight,
                    ),
                  )}
                </Text>
              </View>
            );
          })}
          <Text
            style={tw`mt-2 text-base text-center text-orange font-rajdhani700`}
          >
            Too High Gains/Losses{' '}
            {formatMoney(
              _.reduce(
                tooHigh,
                (total: number, position: Position) => {
                  total += getEquityForOnePosition(
                    position,
                    currentRextimate.amount,
                    numJustRight,
                  );
                  return total;
                },
                0,
              ),
            )}
          </Text>
        </View>
        {property.status != 'Sold' && (
          <Text style={tw`text-center underline`}>
            The values below are potential until the house officially sells.{' '}
          </Text>
        )}

        <View style={tw`p-4 my-6 rounded-md bg-lightGreen`}>
          <View style={tw`flex flex-row justify-between`}>
            <Text style={tw`text-base text-green font-rajdhani700`}>
              {justRight.length}x Just Right
            </Text>
            <Image source={require('../../assets/exchange_green.png')}></Image>
          </View>
          <View
            style={tw`bg-green opacity-20 h-0.5 w-full rounded-md my-2`}
          ></View>
          {justRight.map((position: Position) => {
            return (
              <View
                key={`${property.id}-${(position.dateCreated as any).seconds}`}
                style={tw`flex flex-row items-center justify-between`}
              >
                <Text style={tw`text-green font-rajdhani600`}>
                  {getDateFromTimestamp(position.dateCreated)}{' '}
                  {formatMoney(position.rextimate)}
                </Text>
                <Text style={tw`text-green font-rajdhani600`}>
                  {formatMoney(
                    getEquityForOnePosition(
                      position,
                      currentRextimate.amount,
                      numJustRight,
                    ),
                  )}
                </Text>
              </View>
            );
          })}
          <Text
            style={tw`mt-2 text-base text-center text-green font-rajdhani700`}
          >
            <Text style={tw`underline`}>
              {property.status != 'Sold' && 'Potential'}{' '}
            </Text>
            Just Right Gains/Losses{' '}
            {formatMoney(
              _.reduce(
                justRight,
                (total: number, position: Position) => {
                  total += getEquityForOnePosition(
                    position,
                    currentRextimate.amount,
                    numJustRight,
                  );
                  return total;
                },
                0,
              ),
            )}
          </Text>
        </View>
        {fixedPriceBid && (
          <View style={tw`p-4 my-6 rounded-md`}>
            <Text style={tw`text-base text-black font-rajdhani700`}>
              Your Guess
            </Text>
            <View
              style={tw`bg-black opacity-20 h-0.5 w-full rounded-md my-2`}
            ></View>
            <View style={tw`flex flex-row items-center justify-between`}>
              <Text style={tw`text-black font-rajdhani600`}>
                {getDateFromTimestamp(fixedPriceBid.dateCreated)}{' '}
                {formatMoney(fixedPriceBid.amount)}
              </Text>
              <Text style={tw`text-black font-rajdhani600`}>
                {formatMoney(
                  getFixedPriceBidEquity(
                    fixedPriceBid,
                    currentRextimate.amount,
                    numJustRight,
                  ),
                )}
              </Text>
            </View>
            <Text
              style={tw`mt-2 text-base text-center text-black font-rajdhani700`}
            >
              <Text style={tw`underline`}>
                {property.status != 'Sold' && 'Potential'}{' '}
              </Text>
              Guess Gains/Losses{' '}
              {formatMoney(
                getFixedPriceBidEquity(
                  fixedPriceBid,
                  currentRextimate.amount,
                  numJustRight,
                ),
              )}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default MyTotals;
