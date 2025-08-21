import { Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(SCREEN_WIDTH * 0.75);
export const ITEM_SPACING = 20;

export const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;

export const SIDE_PADDING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;
