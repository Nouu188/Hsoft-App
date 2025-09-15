// src/features/booking-wizard/components/PatientInfoCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Identity } from '@/types/dtos/identity/patient-identity.dto';

const formatGender = (gender?: string | null): string => {
  if (!gender) return 'Chưa cập nhật';
  if (gender.toUpperCase() === 'FEMALE') return 'Nữ';
  if (gender.toUpperCase() === 'MALE') return 'Nam';
  return gender;
};

const formatValue = (value?: string | number | null): string =>
  value ? String(value) : 'Chưa cập nhật';

type InfoRowProps = {
  label: string;
  value?: string | number | null;
  icon: any;
};

const InfoRow = ({ label, value, icon }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon as any} size={20} color={COLORS.primary} style={styles.infoIcon} />
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{formatValue(value)}</Text>
    </View>
  </View>
);

type InfoRowPairProps = {
  left: InfoRowProps;
  right: InfoRowProps;
};

const InfoRowPair = ({ left, right }: InfoRowPairProps) => (
  <View style={styles.infoRowPair}>
    <View style={styles.infoRowItem}>
      <InfoRow {...left} />
    </View>
    <View style={styles.infoRowItem}>
      <InfoRow {...right} />
    </View>
  </View>
);

interface PatientInfoCardProps {
  identity: Identity | null;
  onEdit: () => void;
}

export const PatientInfoCard = ({ identity, onEdit }: PatientInfoCardProps) => {
  if (!identity) return null;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Ionicons name="create-outline" size={22} color={COLORS.primary} />
      </TouchableOpacity>
      <InfoRow label="Họ và tên" value={identity.fullName} icon="person-outline" />
      <InfoRowPair
        left={{ label: "Ngày sinh", value: identity.birthYear, icon: "calendar-outline" }}
        right={{ label: "Giới tính", value: formatGender(identity.gender), icon: "male-female-outline" }}
      />
      <InfoRow label="Số điện thoại" value={identity.phoneNumber} icon="call-outline" />
      <InfoRow label="Địa chỉ" value={identity.address} icon="home-outline" />
      <InfoRowPair
        left={{ label: "Mã bệnh nhân", value: identity.externalPatientCode, icon: "id-card-outline" }}
        right={{ label: "Số CMND/CCCD", value: identity.nationalId, icon: "card-outline" }}
      />
      <InfoRow label="Số BHYT" value={identity.healthInsuranceNumber} icon="medkit-outline" />

      {identity.hospitals && identity.hospitals.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Bệnh viện liên kết</Text>
          {identity.hospitals.map(h => (
            <InfoRow
              key={h.id}
              label={h.name}
              value={h.graphqlEndpoint}
              icon="business-outline"
            />
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '700',
    paddingBottom: SIZES.padding * 0.6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.padding * 0.4,
  },
  infoIcon: {
    marginRight: SIZES.base,
    width: 26,
    textAlign: 'center',
    marginTop: 2,
  },
  infoLabel: {
    ...FONTS.body5,
    color: COLORS.textLight,
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.body3,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  infoRowPair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding * 0.4,
  },
  infoRowItem: {
    flex: 1,
    marginRight: SIZES.base,
  },
  editButton: {
    position: 'absolute',
    top: SIZES.padding / 2,
    right: SIZES.padding / 2,
    padding: 8,
    zIndex: 10,
  },
});
