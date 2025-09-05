import React from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SHADOWS, SIZES } from '@/constants/theme';

type AddButtonProps = {
  onPress: () => void;
};

const AddButton: React.FC<AddButtonProps> = ({ onPress }) => (
  <TouchableOpacity style={{ position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center', right: SIZES.padding * 1.2, bottom: SIZES.padding * 1.2, backgroundColor: COLORS.lightBlue, borderRadius: 28, ...SHADOWS.medium, marginBottom: SIZES.padding * 3.5 }} onPress={onPress}>
    <Ionicons name="add" size={30} color="white" />
  </TouchableOpacity>
);

export default AddButton;
