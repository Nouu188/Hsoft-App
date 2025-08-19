import { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { SIZES } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

export const useGridCalculations = (numColumns: number) => {
  // Dùng useMemo để chỉ tính toán lại khi numColumns hoặc screenWidth thay đổi
  const itemSize = useMemo(() => {
    const PADDING_HORIZONTAL = SIZES.padding;
    return (screenWidth - PADDING_HORIZONTAL * 2) / numColumns;
  }, [numColumns]);

  return { itemSize };
};