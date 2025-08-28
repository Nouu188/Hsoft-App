import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { NotificationItemProps } from './types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime); // để dùng fromNow()

// Hàm helper trả về icon và màu dựa theo loại thông báo
const getIconInfo = (type: string) => {
  switch (type) {
    case 'DOSE_REMINDER':
      return { name: 'medkit-outline', color: COLORS.primary };
    case 'RESULT_AVAILABLE':
      return { name: 'document-text-outline', color: '#3498db' };
    case 'APPOINTMENT_REMINDER':
      return { name: 'calendar-outline', color: '#9b59b6' };
    case 'PAYMENT_DUE':
      return { name: 'wallet-outline', color: '#f39c12' };
    default:
      return { name: 'notifications-outline', color: COLORS.textLight };
  }
};

// Component hiển thị từng thông báo
const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress }) => {
  const isUnread = item.status !== 'READ'; // đánh dấu chưa đọc
  const { name, color } = getIconInfo(item.type);

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={onPress}
    >
      {/* Chấm đỏ nếu chưa đọc */}
      {isUnread && <View style={styles.unreadDot} />}

      {/* Icon của thông báo */}
      <View style={[styles.iconWrapper, { backgroundColor: `${color}20` }]}>
        <Ionicons name={name as any} size={24} color={color} />
      </View>

      {/* Nội dung thông báo */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.time}>{dayjs(item.sentAt).fromNow()}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Style
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderWidth: 0.58,
    borderColor: COLORS.border,
  },
  unreadContainer: { backgroundColor: '#fdededf9' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, marginRight: SIZES.padding / 2 },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.padding },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark, flex: 1, marginRight: 8 },
  time: { fontSize: 12, color: COLORS.textLight },
  body: { fontSize: 14, color: COLORS.textLight, lineHeight: 20 },
});

export default NotificationItem;
