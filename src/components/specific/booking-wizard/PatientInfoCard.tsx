// src/features/booking-wizard/components/PatientInfoCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Identity } from '@/types/dtos/identity/patient-identity.dto';

const formatGender = (gender: string | undefined | null): string => {
    if (!gender) return 'Chưa cập nhật';
    // Có thể mở rộng thêm 'OTHER' nếu cần
    if (gender.toUpperCase() === 'FEMALE') return 'Nữ';
    if (gender.toUpperCase() === 'MALE') return 'Nam';
    return gender;
};

type InfoRowProps = {
  label: string;
  value: string | number | undefined;
  icon: keyof typeof Ionicons;
};

const InfoRow = ({ label, value, icon }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon as any} size={22} color={COLORS.primary} style={styles.infoIcon} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// --- Main Component ---
interface PatientInfoCardProps {
  identity: Identity | null;
  onEdit: () => void;
}

export const PatientInfoCard = ({ identity, onEdit }: PatientInfoCardProps) => {
  if (!identity) {
    // Có thể hiển thị một skeleton loader ở đây
    return null; 
  }

  // Cấu trúc lại dữ liệu để dễ dàng render và bảo trì
  const patientDetails = [
    { label: "Họ và tên", value: identity.fullName, icon: 'person-outline' as const },
    { label: "Ngày sinh", value: identity.birthYear, icon: 'calendar-outline' as const },
    { label: "Giới tính", value: formatGender(identity.gender), icon: 'transgender-outline' as const },
    { label: "Số điện thoại", value: identity.phoneNumber, icon: 'call-outline' as const },
  ];

  return (
    <View style={styles.card}>
      {/* Nút chỉnh sửa được đặt ở góc trên bên phải, chuyên nghiệp hơn */}
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Ionicons name="create-outline" size={22} color={COLORS.primary} />
      </TouchableOpacity>
      
      {patientDetails.map((detail) => (
         <InfoRow 
            key={detail.label}
            label={detail.label}
            value={detail.value}
            icon={detail.icon as any}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    position: 'relative', // Cần thiết cho absolute positioning của nút edit
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding * 1.2,
  },
  infoIcon: {
    marginRight: SIZES.padding,
    width: 24, // Đảm bảo các icon thẳng hàng
    textAlign: 'center',
  },
  infoLabel: {
    ...FONTS.body4,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  infoValue: {
    ...FONTS.h4,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    top: SIZES.padding,
    right: SIZES.padding,
    zIndex: 1,
    padding: 5, // Tăng vùng bấm
  },
});