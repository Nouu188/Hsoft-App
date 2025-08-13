// src/screens/notification/NotificationScreen.tsx (Hoàn chỉnh)

import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore } from '@/store/useNotificationStore';
import { COLORS, SIZES } from '@/constants/theme';
import NotificationFilter from '@/components/specific/notification/NotificationFilter';
import NotificationItem from '@/components/specific/notification/NotificationItem';
import { NotificationHistory, NotificationStatus, NotificationType } from '@/types';
import { MainTabsNavigationProp } from '@/navigation/types';

const NotificationScreen = () => {
  // Sử dụng type an toàn cho navigation
  const navigation = useNavigation<MainTabsNavigationProp<'Notification'>>();
  
  const {
    filteredNotifications,
    activeFilter,
    isLoading,
    error,
    fetchNotifications,
    setFilter,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    // Gọi fetchNotifications khi màn hình được focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifications();
    });
    return unsubscribe;
  }, [navigation, fetchNotifications]);

  /**
   * Xử lý điều hướng thông minh dựa trên loại thông báo.
   */
  const handleNotificationPress = (item: NotificationHistory) => {
    // 1. Đánh dấu đã đọc (Optimistic Update)
    if (item.status !== NotificationStatus.READ) {
      markAsRead(item.id);
    }

    if (item.type === NotificationType.RESULT_AVAILABLE) {
      // TypeScript sẽ báo lỗi nếu bạn truyền sai params hoặc sai tên màn hình
      navigation.navigate('MedicalRecordsStack', {
        screen: 'RecordDetail',
        params: { 
          recordId: item.payload.recordId, 
          resultToFocus: item.payload.resultId 
        }
      });
    }

    // 2. Logic điều hướng dựa trên `type` và `payload`
    switch (item.type) {
      case NotificationType.DOSE_REMINDER:
        navigation.navigate('Schedule', { 
          timeToFocus: item.payload?.doseTime 
        });
        break;
      
      case NotificationType.RESULT_AVAILABLE:
        if (item.payload?.resultId) {
          navigation.navigate('MedicalRecordsStack', {
            screen: 'RecordDetail',
            params: { recordId: item.payload.recordId, resultToFocus: item.payload.resultId }
          });
        }
        break;

      case NotificationType.APPOINTMENT_REMINDER:
      case NotificationType.APPOINTMENT_CONFIRMED:
        // Điều hướng đến màn hình chi tiết lịch hẹn
        if (item.payload?.appointmentId) {
          navigation.navigate('AppointmentStack', { // Giả sử có stack này
            screen: 'AppointmentDetail',
            params: { appointmentId: item.payload.appointmentId }
          });
        }
        break;
      
      case NotificationType.PAYMENT_DUE:
        // Điều hướng đến màn hình thanh toán
        if (item.payload?.paymentId) {
          navigation.navigate('PaymentStack', { // Giả sử có stack này
            screen: 'PaymentDetail',
            params: { paymentId: item.payload.paymentId }
          });
        }
        break;

      default:
        // Không làm gì cho các thông báo chung
        console.log('Navigating for a general notification, no action defined.');
        break;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={COLORS.primary} style={styles.centered} />;
    }
    if (error) {
      return <Text style={styles.centeredText}>Lỗi: {error}</Text>;
    }
    return (
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={() => handleNotificationPress(item)} />
        )}
        ListEmptyComponent={<Text style={styles.centeredText}>Bạn chưa có thông báo nào.</Text>}
        contentContainerStyle={{ paddingBottom: SIZES.padding*12 }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
          <Ionicons name="checkmark-done-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>
      
      <NotificationFilter activeFilter={activeFilter} onFilterChange={setFilter} />
      
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.padding / 2, height: 56, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
  headerButton: { padding: SIZES.padding / 2 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  contentContainer: { },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centeredText: { flex: 1, textAlign: 'center', textAlignVertical: 'center', color: COLORS.textLight, fontSize: 16, padding: SIZES.padding },
});

export default NotificationScreen;