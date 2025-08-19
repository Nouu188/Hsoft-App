import { useState, useCallback } from 'react';
import { LayoutChangeEvent } from 'react-native';

export const useSquareLayout = () => {
  const [size, setSize] = useState<number | undefined>(undefined);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // Chỉ cập nhật nếu size thay đổi để tránh render lại vô ích
    if (width !== size) {
      setSize(width);
    }
  }, [size]); // Phụ thuộc vào `size` để có thể so sánh

  return { size, onLayout };
};