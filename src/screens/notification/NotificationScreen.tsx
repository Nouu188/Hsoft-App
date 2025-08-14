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

  // Hàm xử lý khi người dùng nhấn vào một thông báo
  const handleNotificationPress = (item: NotificationHistory) => {
    if (item.status !== NotificationStatus.READ) {
      markAsRead(item.id);
    }

    if (item.type === NotificationType.RESULT_AVAILABLE) {
      navigation.navigate('MedicalRecordsStack', {
        screen: 'RecordDetail',
        params: { 
          recordId: item.payload.recordId, 
          resultToFocus: item.payload.resultId 
        }
      });
    }

    switch (item.type) {
      case NotificationType.DOSE_REMINDER:
        console.log('Navigating to Schedule with doseIds:', item.payload?.doseIds);
        navigation.navigate('Schedule', { doseIdsToFocus: item.payload?.doseIds });
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
        if (item.payload?.appointmentId) {
          navigation.navigate('AppointmentStack', {
            screen: 'AppointmentDetail',
            params: { appointmentId: item.payload.appointmentId }
          });
        }
        break;
      
      case NotificationType.PAYMENT_DUE:
        if (item.payload?.paymentId) {
          navigation.navigate('PaymentStack', { 
            screen: 'PaymentDetail',
            params: { paymentId: item.payload.paymentId }
          });
        }
        break;

      default:
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