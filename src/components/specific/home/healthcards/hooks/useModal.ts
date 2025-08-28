import { useState, useCallback } from 'react';

/**
 * Hook quản lý trạng thái modal (mở/đóng).
 * @param initialState - trạng thái ban đầu (mặc định là false = đóng)
 * @returns isVisible (boolean), openModal(), closeModal()
 */
export const useModal = (initialState = false) => {
  const [isVisible, setIsVisible] = useState(initialState);

  // Mở modal
  const openModal = useCallback(() => setIsVisible(true), []);

  // Đóng modal
  const closeModal = useCallback(() => setIsVisible(false), []);

  return { isVisible, openModal, closeModal };
};
