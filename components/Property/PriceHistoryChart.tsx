import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ChartConfig } from 'react-native-chart-kit/dist/HelperTypes';
import { getRextimatePriceHistories } from '../../firebase/collections/rextimatePriceHistories';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import { formatMoney } from '../../lib/helpers/money';
import { Property } from '../../lib/models/property';
import { RextimatePriceHistory } from '../../lib/models/rextimatePriceHistory';
import tw from '../../lib/tailwind/tailwind';

interface PriceHistoryChartProps {
  property: Property;
  currentRextimate: RextimatePriceHistory;
  isOpenHouse: boolean;
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  property,
  currentRextimate,
  isOpenHouse,
}) => {
  const [data, setData] = useState<any>({
    datasets: [
      {
        data: [],
      },
    ],
  });
  const [x, setX] = useState(0);
  const [selectedValue, setSelectedValue] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const rphs = await getRextimatePriceHistories(property.id, isOpenHouse);
    setData({
      labels: rphs.map((rph: RextimatePriceHistory) => rph.dateCreated),
      datasets: [
        {
          data: rphs.map((rph: RextimatePriceHistory) => rph.amount),
        },
      ],
    });
  };

  const chartConfig: ChartConfig = {
    backgroundGradientFrom: 'rgba(225,225,225,0)',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    backgroundGradientTo: 'rgba(225,225,225,0)',
    color: (opacity = 1) => `#5d26c1`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  const handleDataPointClick = (args: any) => {
    const {
      index,
      x,
      dataset: { data: arr },
    } = args;
    setSelectedValue(arr[index]);

    setSelectedDate(data.labels[index]);
    setX(x);
  };

  const decorate = (args: any) => {
    // console.log(args);
  };

  const isLarge = WINDOW_WIDTH > 600;
  const rextimateText = isLarge ? 'text-2xl' : 'text-base';
  const dateText = isLarge ? 'text-lg' : 'text-xs';

  return (
    <>
      <Text style={tw`px-4 ${rextimateText} font-overpass500`}>
        {formatMoney(selectedValue || currentRextimate.amount)}
      </Text>
      <Text style={tw`px-4 ${dateText} font-overpass500`}>
        {selectedDate
          ? new Date(selectedDate).toLocaleString()
          : new Date().toLocaleString()}
      </Text>
      <View style={tw`relative`}>
        <LineChart
          data={data}
          width={WINDOW_WIDTH}
          height={WINDOW_HEIGHT / 2 - 50}
          chartConfig={chartConfig}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={false}
          withHorizontalLabels={false}
          withShadow={false}
          onDataPointClick={handleDataPointClick}
          decorator={decorate}
        />
        <View
          style={[tw`absolute w-[0.5px] top-0 bottom-20 bg-black`, { left: x }]}
        ></View>
      </View>
    </>
  );
};

export default PriceHistoryChart;
