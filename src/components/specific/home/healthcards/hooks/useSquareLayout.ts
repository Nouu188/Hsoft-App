import { useState, useCallback } from 'react';
import { LayoutChangeEvent } from 'react-native';

/**
 * Hook để tạo layout hình vuông (chiều rộng = chiều cao).
 * Lấy width của View rồi lưu lại để dùng làm size.
 */
export const useSquareLayout = () => {
  const [size, setSize] = useState<number | undefined>(undefined);

  // Hàm gọi khi layout thay đổi -> lấy width để đặt size
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;

    // Chỉ set lại nếu width thay đổi
    if (width !== size) {
      setSize(width);
    }
  }, [size]); 

  return { size, onLayout };
};
