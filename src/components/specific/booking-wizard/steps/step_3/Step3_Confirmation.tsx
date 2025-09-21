// Step3_Confirmation.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useIdentityStore } from '@/store/useIdentityStore';
import { useBookingStore } from '@/store/useBookingStore';
import { PatientInfoCard } from './PatientInfoCard';
import CollapsibleSection from '../step_1/collapsible_section/CollapsibleSection';
import { useNavigation } from '@react-navigation/native';
import { storageService } from '@/services/storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EntityCard, { Entity } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import { HospitalInfoCard } from './HospitalInfoCard';
import dayjs from 'dayjs';
import { BookingStackParamList } from '@/navigation/types';

interface Step3Props {
    onBack: (entity?: Entity, selectedDate?: string) => void;
}

const Step3_Confirmation: React.FC<Step3Props> = ({ onBack }) => {
    const { identity } = useIdentityStore();
    const { data, setSectionExpanded } = useBookingStore();
    const scrollY = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<NativeStackNavigationProp<BookingStackParamList>>();

    // 👇 Khi vào Step3 thì expand tất cả section
    useEffect(() => {
        ["patientInfo", "hospitalInfo", "entityInfo"].forEach(key =>
            setSectionExpanded(key, true)
        );
    }, [setSectionExpanded]);

    const getEntitySectionTitle = () => {
        const hasDoctors = data.selectedDoctors.length > 0;
        const hasClinics = (data.selectedClinics?.length || 0) > 0;
        if (hasDoctors && hasClinics) return "Bác sĩ & Phòng khám đã chọn";
        if (hasDoctors) return "Bác sĩ đã chọn";
        if (hasClinics) return "Phòng khám đã chọn";
        return "Không có bác sĩ hoặc phòng khám nào";
    };

    const handleConfirm = async () => {
        const { data } = useBookingStore.getState();
        const appointmentsToSave: any[] = [];

        // Doctor appointments
        Object.entries(data.doctorTimes).forEach(([key, time]) => {
            if (!time) return;
            const parts = key.split('-');
            const date = parts.slice(-3).join('-');
            const doctorId = parts.slice(0, -3).join('-');
            const doctor = data.selectedDoctors.find(d => d.id === doctorId);
            if (!doctor) return;
            appointmentsToSave.push({
                id: `${doctorId}-${date}-${time}`,
                date,
                time,
                entityType: 'doctor',
                entityId: doctorId,
                entityName: doctor.name,
                specialty: doctor.specialty,
                title: `Khám với ${doctor.name}`,
                appointmentCode: `${Math.floor(100000 + Math.random() * 900000)}`, // 👈 mã số khám riêng
            });
        });

        // Clinic appointments
        Object.entries(data.clinicTimes).forEach(([key, time]) => {
            if (!time) return;
            const parts = key.split('-');
            const date = parts.slice(-3).join('-');
            const clinicId = parts.slice(0, -3).join('-');
            const clinic = data.selectedClinics.find(c => c.id === clinicId);
            if (!clinic) return;
            appointmentsToSave.push({
                id: `${clinicId}-${date}-${time}`,
                date,
                time,
                entityType: 'clinic',
                entityId: clinicId,
                entityName: clinic.name,
                specialty: clinic.specialty,
                title: `Khám tại ${clinic.name}`,
                appointmentCode: `${Math.floor(100000 + Math.random() * 900000)}`, // 👈 mã số khám riêng
            });
        });

        // Data bệnh nhân chung
        const bookingData = {
            patientName: identity?.fullName || '',
            patientPhone: identity?.phoneNumber || '',
            patientDob: identity?.birthYear ? String(identity.birthYear) : '',
            hospitalName: data.hospital?.name || '',
            note: data.notes || '',
        };

        // 👉 Gom full data để lưu
        const fullBookingData = {
            bookingData,
            appointments: appointmentsToSave,
            createdAt: new Date().toISOString(),
        };

        try {
            await storageService.addBooking(fullBookingData);
        } catch (err) {
            console.error('Failed to save booking', err);
        }
        navigation.navigate('BookingReceipt' as any, fullBookingData as any);
    };


    const handleEditEntity = (entity: Entity, date: string) => {
        onBack(entity, date);
    };

    const renderEntityAppointments = () => {
        const doctorAppointments = Object.entries(data.doctorTimes).map(([key, time]) => {
            if (!time) return null;

            const parts = key.split('-');
            const date = parts.slice(-3).join('-');
            const doctorId = parts.slice(0, -3).join('-');
            const doctor = data.selectedDoctors.find(d => d.id === doctorId);
            if (!doctor) return null;

            // 👇 Tạo key unique luôn
            const uniqueKey = `${doctorId}-${date}-${time}`;

            return (
                <EntityCard
                    key={uniqueKey}
                    entity={doctor}
                    variant="summary"
                    appointmentTime={`${time} - ${dayjs(date).format("DD/MM/YYYY")}`}
                    onEditEntity={() => handleEditEntity(doctor, date)}
                />
            );
        });

        const clinicAppointments = Object.entries(data.clinicTimes).map(([key, time]) => {
            if (!time) return null;

            const parts = key.split('-');
            const date = parts.slice(-3).join('-');
            const clinicId = parts.slice(0, -3).join('-');
            const clinic = data.selectedClinics.find(c => c.id === clinicId);
            if (!clinic) return null;

            // 👇 Tạo key unique luôn
            const uniqueKey = `${clinicId}-${date}-${time}`;

            return (
                <EntityCard
                    key={uniqueKey}
                    entity={clinic}
                    variant="summary"
                    appointmentTime={`${time} - ${dayjs(date).format("DD/MM/YYYY")}`}
                    onEditEntity={() => handleEditEntity(clinic, date)}
                />
            );
        });

        return [...doctorAppointments, ...clinicAppointments];
    };


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
            key: 'entityInfo',
            render: () => (
                <CollapsibleSection title={getEntitySectionTitle()} sectionKey="entityInfo">
                    {renderEntityAppointments()}
                </CollapsibleSection>
            ),
        },
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
    listContent: { paddingVertical: SIZES.padding, paddingBottom: 120, flexGrow: 1 },
    headerSection: { marginBottom: SIZES.padding, paddingHorizontal: SIZES.padding },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: SIZES.padding / 5,
        marginTop: SIZES.padding,
    },
    subTitle: { fontSize: 14, color: COLORS.text },
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
});

export default Step3_Confirmation;
