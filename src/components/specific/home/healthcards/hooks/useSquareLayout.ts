import { useState, useCallback } from 'react';
import { LayoutChangeEvent } from 'react-native';

export const useSquareLayout = () => {
  const [size, setSize] = useState<number | undefined>(undefined);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;

    if (width !== size) {
      setSize(width);
    }
  }, [size]); 

  return { size, onLayout };
};