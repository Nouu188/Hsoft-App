import { useState, useCallback } from 'react';

export const useModal = (initialState = false) => {
  const [isVisible, setIsVisible] = useState(initialState);

  const openModal = useCallback(() => setIsVisible(true), []);
  const closeModal = useCallback(() => setIsVisible(false), []);

  return { isVisible, openModal, closeModal };
};