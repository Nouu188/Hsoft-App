// src/features/booking-wizard/steps/Step3_Confirmation.tsx
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useIdentityStore } from '@/store/useIdentityStore';
import { useBookingStore } from '@/store/useBookingStore';
import { PatientInfoCard } from './PatientInfoCard';
import CollapsibleSection from '../step_1/collapsible_section/CollapsibleSection';

interface Step3Props {
    onConfirm: () => void;
    onBack: () => void;
}

const Step3_Confirmation: React.FC<Step3Props> = ({ onConfirm }) => {
    const { identity } = useIdentityStore();
    const { data } = useBookingStore(); // lấy thông tin từ bước 1
    const scrollY = useRef(new Animated.Value(0)).current;

    // Các section trong Step 3
    const sections = [
        {
            key: 'title',
            render: () => (
                <View style={styles.headerSection}>
                    <Text style={styles.title}>Xác nhận thông tin đặt lịch</Text>
                    <Text style={styles.subTitle}>
                        Vui lòng kiểm tra kỹ thông tin bệnh nhân trước khi xác nhận.
                    </Text>
                </View>
            ),
        },
        {
            key: 'hospitalInfo',
            render: () => (
                <CollapsibleSection title="Bệnh viện đã chọn" sectionKey="hospitalInfo">
                    <View style={styles.cardBox}>
                        <Text style={styles.cardLabel}>Tên bệnh viện</Text>
                        <Text style={styles.cardValue}>{data.hospital?.name || 'Chưa chọn'}</Text>

                        <Text style={styles.cardLabel}>Địa chỉ</Text>
                        <Text style={styles.cardValue}>{data.hospital?.address || '---'}</Text>
                    </View>
                </CollapsibleSection>
            ),
        },
        {
            key: 'patientInfo',
            render: () => (
                <CollapsibleSection title="Thông tin cá nhân" sectionKey="patientInfo">
                    <PatientInfoCard
                        identity={identity}
                        onEdit={() => console.log('Chỉnh sửa thông tin')}
                    />
                </CollapsibleSection>
            ),
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Animated FlatList để scroll */}
            <Animated.FlatList
                data={sections}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => item.render()}
                contentContainerStyle={{
                    paddingVertical: SIZES.padding,
                    paddingBottom: 140,
                    flexGrow: 1,
                }}
                showsVerticalScrollIndicator
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            />

            {/* Footer cố định */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={onConfirm}
                >
                    <Text style={[styles.buttonText, { color: COLORS.white }]}>Xác nhận</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    headerSection: { marginBottom: SIZES.padding / 2, paddingHorizontal: SIZES.padding },
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 6, marginTop: SIZES.padding },
    subTitle: { fontSize: 14, color: COLORS.text, marginBottom: 16 },
    cardBox: {
        backgroundColor: COLORS.background,
    },
    cardLabel: { fontSize: 16, color: COLORS.text },
    cardValue: { fontSize: 14, color: COLORS.textDark, fontWeight: '600', marginBottom: SIZES.padding / 2 },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginLeft: 12,
    },
    confirmButton: { backgroundColor: COLORS.lightBlue },
    buttonText: { fontSize: 16, fontWeight: '600' },
});

export default Step3_Confirmation;
