// Step3_Confirmation.tsx
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useIdentityStore } from '@/store/useIdentityStore';
import { useBookingStore } from '@/store/useBookingStore';
import { PatientInfoCard } from './PatientInfoCard';
import CollapsibleSection from '../step_1/collapsible_section/CollapsibleSection';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EntityCard from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import { HospitalInfoCard } from './HospitalInfoCard';
import type { BookingStackParamList } from '@/navigation/BookingWizardNavigator';
import type { Entity } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';

interface Step3Props {
    onBack: (entity?: Entity) => void;
}
const Step3_Confirmation: React.FC<Step3Props> = ({ onBack }) => {
    const { identity } = useIdentityStore();
    const { data, resetBooking } = useBookingStore();
    const scrollY = useRef(new Animated.Value(0)).current;

    const navigation = useNavigation<NativeStackNavigationProp<BookingStackParamList>>();

    const getEntitySectionTitle = () => {
        const hasDoctors = data.selectedDoctors.length > 0;
        const hasClinics = (data.selectedClinics?.length || 0) > 0;

        if (hasDoctors && hasClinics) return "Bác sĩ & Phòng khám đã chọn";
        if (hasDoctors) return "Bác sĩ đã chọn";
        if (hasClinics) return "Phòng khám đã chọn";
        return "Không có bác sĩ hoặc phòng khám nào";
    };

    const handleConfirm = () => {
        resetBooking();
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainApp' as any }],
        });
        setTimeout(() => {
            Alert.alert('Thành công', 'Bạn đã đặt lịch thành công!');
        }, 300);
    };

    const handleEditEntity = (entity: Entity) => {
        onBack(entity);
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
                    {/* Doctors */}
                    {data.selectedDoctors.map((doc) => (
                        <EntityCard
                            key={doc.id}
                            entity={doc}
                            variant="summary"
                            appointmentTime={data.doctorTimes[doc.id]}
                            onEditEntity={handleEditEntity} 
                        />
                    ))}

                    {/* Clinics */}
                    {data.selectedClinics?.map((clinic) => (
                        <EntityCard
                            key={clinic.id}
                            entity={clinic}
                            variant="summary"
                            appointmentTime={data.clinicTimes?.[clinic.id]}
                            onEditEntity={handleEditEntity} 
                        />
                    ))}
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
