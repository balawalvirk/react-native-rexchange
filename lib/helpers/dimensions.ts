import { Dimensions } from 'react-native';

export const WINDOW_WIDTH = Dimensions.get('window').width;
export const isLarge = WINDOW_WIDTH >= 600;
export const WINDOW_HEIGHT = Dimensions.get('window').height;
export const IMAGE_HEIGHT = 2 * WINDOW_HEIGHT / 5;
export const SHORT_SHEET = WINDOW_HEIGHT / 2;
export const TALL_SHEET = WINDOW_HEIGHT - 100;
