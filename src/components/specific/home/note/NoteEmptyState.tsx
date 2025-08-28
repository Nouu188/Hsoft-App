import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '@/constants/theme';

// Component hiển thị trạng thái rỗng (khi chưa có ghi chú nào)
const EmptyState = () => {
  return (
    <View style={styles.emptyContainer}>
      {/* Icon nền minh hoạ */}
      <View style={styles.emptyIconBackground}>
        <Ionicons name="document-text-outline" size={40} color={COLORS.primary} />
      </View>

      {/* Thông báo không có ghi chú */}
      <Text style={styles.emptyText}>Không có ghi chú nào ở đây</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIconBackground: { width: 90, height: 90, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20,},
  emptyText: { fontSize: 16, color: COLORS.secondary },
});

export default EmptyState;