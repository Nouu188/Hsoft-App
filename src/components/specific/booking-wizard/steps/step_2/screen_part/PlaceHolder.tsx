import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

const Placeholder: React.FC = () => (
  <View style={styles.placeholder}>
    <Text>Danh sách phòng khám sẽ hiển thị ở đây</Text>
  </View>
);

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: 15,
  },
});

export default Placeholder;
