// src/features/booking-wizard/components/HospitalInfoCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Hospital } from '@/types';

type InfoRowProps = {
    label: string;
    value?: string | number | null;
    icon: any;
};

const formatValue = (value?: string | number | null): string =>
    value ? String(value) : 'Chưa cập nhật';

const InfoRow = ({ label, value, icon }: InfoRowProps) => (
    <View style={styles.infoRow}>
        <Ionicons name={icon as any} size={20} color={COLORS.primary} style={styles.infoIcon} />
        <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{formatValue(value)}</Text>
        </View>
    </View>
);

interface HospitalInfoCardProps {
    hospital: Hospital | null;
}

export const HospitalInfoCard = ({ hospital }: HospitalInfoCardProps) => {
    if (!hospital) return null;

    return (
        <View>
            <InfoRow label="Tên bệnh viện" value={hospital.name} icon="business-outline" />
            <InfoRow label="Địa chỉ" value={hospital.address} icon="location-outline" />
            <InfoRow label="Điện thoại" value={hospital.phone} icon="call-outline" />
        </View>
    );
};

const styles = StyleSheet.create({
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
});
