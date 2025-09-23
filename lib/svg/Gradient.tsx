import * as React from 'react';
import { SvgXml } from 'react-native-svg';
import tw from '../tailwind/tailwind';

const xml = `
<svg xmlns='http://www.w3.org/2000/svg' width='300px' height='300px'>
<defs>
<linearGradient id='g1' gradientUnits='userSpaceOnUse' x1='21.92%' y1='-10.22%' x2='78.08%' y2='110.22%'>
<stop stop-color='#0b998e'/>
<stop offset='.17' stop-color='#4c8ca3'/>
<stop offset='.41' stop-color='#977fbb'/>
<stop offset='.6' stop-color='#8870b2'/>
<stop offset='.76' stop-color='#6a52a1'/>
<stop offset='1' stop-color='#5d25c1'/>
</linearGradient>
</defs>
<rect width='100%' height='100%' fill='url(#g1)'/>
</svg>
`;

const Gradient: React.FC<{}> = () => {
  return <SvgXml style={tw`absolute inset-0`} xml={xml} width="100%" height="100%" />;
};

export default Gradient;
