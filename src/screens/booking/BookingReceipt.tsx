import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useBookingStore } from '@/store/useBookingStore';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingReceipt'>;

const BookingReceipt: React.FC<Props> = ({ route, navigation }) => {
    const { bookingData, appointments } = (route.params as any) || {};

    const renderDetailRow = (label: string, value?: string | null) => (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value ?? '-'}</Text>
        </View>
    );

    // 👉 dùng chung cho icon ngôi nhà & nút hoàn tất
    const handleDone = () => {
        try {
            useBookingStore.getState().resetBooking();
        } catch (e) {
            // ignore
        }
        navigation.reset({ index: 0, routes: [{ name: 'MainApp' as any }] });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.badgeRow}>
                    {/* Icon ngôi nhà bấm được */}
                    <TouchableOpacity style={styles.leftBadge} onPress={handleDone}>
                        <Ionicons name="home-outline" size={20} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.headerTitle}>Phiếu đặt lịch khám</Text>

                    {/* Thông tin bệnh nhân */}
                    <View style={styles.infoBlock}>
                        {renderDetailRow('Họ tên', bookingData?.patientName)}
                        {renderDetailRow('SĐT', bookingData?.patientPhone)}
                        {renderDetailRow('Ngày sinh', bookingData?.patientDob)}
                        {renderDetailRow('Bệnh viện', bookingData?.hospitalName)}
                        {renderDetailRow('Ghi chú', bookingData?.note)}
                    </View>

                    {/* Danh sách lịch khám */}
                    {appointments?.map((a: any, idx: number) => (
                        <View key={a.appointmentCode} style={styles.appointmentBox}>
                            <Text style={styles.subTitle}>Lịch khám {idx + 1}</Text>

                            {renderDetailRow(
                                a.entityType === 'doctor' ? 'Bác sĩ' : 'Phòng khám',
                                `${a.entityName}${a.specialty ? ` - ${a.specialty}` : ''}`
                            )}
                            {renderDetailRow('Thời gian', `${a.time} - ${a.date}`)}

                            <View style={styles.codeBlock}>
                                <Text style={styles.codeLabel}>Mã số khám</Text>
                                <Text style={styles.code}>{a.appointmentCode}</Text>
                                <Text style={styles.codeHint}>
                                    *Mã này sẽ được sử dụng khi đến khám để xác nhận thứ tự
                                </Text>
                            </View>
                        </View>
                    ))}

                    {/* Nút hoàn tất */}
                    <TouchableOpacity style={[styles.button, styles.doneButton]} onPress={handleDone}>
                        <Text style={[styles.buttonText, { color: COLORS.white }]}>Hoàn tất</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scroll: { padding: SIZES.padding, alignItems: 'center' },
    card: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 1.5,
        padding: SIZES.padding * 1.2,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SIZES.base / 2,
    },
    leftBadge: {
        backgroundColor: COLORS.primaryLight,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginVertical: SIZES.base,
        color: COLORS.text,
    },
    infoBlock: { width: '100%', marginTop: SIZES.base * 1.5 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background,
    },
    rowLabel: { color: COLORS.text, opacity: 0.8 },
    rowValue: { color: COLORS.text, fontWeight: '700' },
    appointmentBox: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: COLORS.background,
        marginTop: SIZES.base * 2,
        paddingTop: SIZES.base,
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    codeBlock: {
        width: '100%',
        alignItems: 'center',
        marginTop: SIZES.base,
    },
    codeLabel: { color: COLORS.text, opacity: 0.8 },
    code: { fontSize: 28, fontWeight: '900', color: COLORS.primary, marginTop: SIZES.base / 2 },
    codeHint: { color: COLORS.text, opacity: 0.7, marginTop: SIZES.base / 2, textAlign: 'center' },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: SIZES.base * 2,
    },
    doneButton: { backgroundColor: COLORS.lightBlue },
    buttonText: { fontSize: 16, fontWeight: '700' },
});

export default BookingReceipt;
