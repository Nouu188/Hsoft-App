import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SIZES, COLORS } from '@/constants/theme';
import EmailForm from './EmailForm';
import type {ContentProps} from './types'

const Content: React.FC<ContentProps> = ({ onSubmit }) => {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>Quên mật khẩu?</Text>
      <Text style={styles.subtitle}>
        Chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu.
      </Text>
      <EmailForm onSubmit={onSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: SIZES.base * 25,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 32,
  },
});

export default Content;
