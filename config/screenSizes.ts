import {Dimensions} from 'react-native';
const fullHeight = Dimensions.get('window').height;
const heightRef = fullHeight / 926;
const fontRef = fullHeight / 926;
const fullWidth = Dimensions.get('window').width;
const widthRef = fullWidth / 428;
export {fullWidth, fullHeight, heightRef, widthRef, fontRef};
