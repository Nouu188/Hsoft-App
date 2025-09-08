import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SIZES } from '@/constants/theme';

interface EmptyStateProps {
  theme: typeof import('@/constants/theme').COLORS;
}

const EmptyState: React.FC<EmptyStateProps> = ({ theme }) => {
  return (
    <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.emptyIconBackground, { backgroundColor: theme.primaryLight }]}>
        <Ionicons name="document-text-outline" size={40} color={theme.primary} />
      </View>

      <Text style={[styles.emptyText, { color: theme.secondary }]}>
        Không có ghi chú nào ở đây
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIconBackground: {
    width: 90,
    height: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: { fontSize: 16 },
});

export default EmptyState;
