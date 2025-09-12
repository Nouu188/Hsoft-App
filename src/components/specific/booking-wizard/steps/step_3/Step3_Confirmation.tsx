import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useIdentityStore } from '@/store/useIdentityStore';
import { useBookingStore } from '@/store/useBookingStore';
import { PatientInfoCard } from './PatientInfoCard';
import CollapsibleSection from '../step_1/collapsible_section/CollapsibleSection';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import DoctorCard from '@/components/specific/schedule/appointment/components/doctor_list/DoctorCard';
import { HospitalInfoCard } from './HospitalInfoCard';
interface Step3Props {
    onBack: () => void;
}

const Step3_Confirmation: React.FC<Step3Props> = ({ onBack }) => {
    const { identity } = useIdentityStore();
    const { data, resetBooking } = useBookingStore();
    const scrollY = useRef(new Animated.Value(0)).current;

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleConfirm = () => {
        // Xóa dữ liệu booking hiện tại trong store
        resetBooking();
        // Reset navigation stack
        navigation.reset({
            index: 0, // Chỉ định màn hình active trong stack mới là phần tử thứ 0
            routes: [{ name: 'MainApp' }], // Stack mới chỉ gồm màn hình 'MainApp'
        });
        setTimeout(() => {
            Alert.alert('Thành công', 'Bạn đã đặt lịch thành công!');
        }, 300);
    };

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <View style={styles.row}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue}>{value}</Text>
        </View>
    );

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
        {
            key: 'hospitalInfo',
            render: () => (
                <CollapsibleSection title="Bệnh viện đã chọn" sectionKey="hospitalInfo">
                    <HospitalInfoCard hospital={data.hospital || null} />
                </CollapsibleSection>
            ),
        },
        {
            key: 'doctorInfo',
            render: () => (
                <CollapsibleSection title="Bác sĩ đã chọn" sectionKey="doctorInfo">
                    {data.selectedDoctors.map((doc) => (
                        <DoctorCard
                            key={doc.id}
                            {...doc}
                            variant="summary"
                            appointmentTime={data.doctorTimes[doc.id]}
                        />
                    ))}
                </CollapsibleSection>
            ),
        }



    ];

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Animated.FlatList
                data={sections}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => item.render()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleConfirm}
                >
                    <Text style={[styles.buttonText, { color: COLORS.white }]}>
                        Xác nhận
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    listContent: {
        paddingVertical: SIZES.padding,
        paddingBottom: 120,
        flexGrow: 1,
    },
    headerSection: {
        marginBottom: SIZES.padding,
        paddingHorizontal: SIZES.padding,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 6,
    },
    subTitle: { fontSize: 14, color: COLORS.text },
    cardBox: {
        backgroundColor: COLORS.background,
        marginBottom: SIZES.padding,
        padding: SIZES.padding,
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    cardLabel: { fontSize: 14, color: COLORS.text },
    cardValue: {
        fontSize: 14,
        color: COLORS.textDark,
        fontWeight: '600',
        flexShrink: 1,
        textAlign: 'right',
        marginLeft: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: SIZES.padding,
        borderTopWidth: 1,
        borderTopColor: COLORS.background,
        backgroundColor: COLORS.white,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    confirmButton: { backgroundColor: COLORS.lightBlue },
    buttonText: { fontSize: 16, fontWeight: '600' },
    doctorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
        borderRadius: 12,
        marginBottom: SIZES.padding,
    },
    doctorIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    doctorInfoBox: {
        flex: 1,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textDark,
        marginBottom: 6,
        lineHeight: 24,
    },
    doctorSub: {
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 4,
        lineHeight: 22,
    },
    doctorSubValue: {
        fontWeight: '500',
        color: COLORS.textDark,
    },


});

export default Step3_Confirmation;
