import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingWizard from '@/components/specific/booking-wizard/BookingWizard';

import { TimeSlot } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import AppointmentTimeSelectionScreen from '@/components/specific/booking-wizard/steps/step_2/screen_part/time_selection/AppointmentTimeSelectionScreen';

export type BookingStackParamList = {
    BookingWizardMain: {
        step?: number;
        prefilledDoctors?: { doctorId: string; selectedTime: string }[];
    };
    AppointmentBooking: {
        doctorId: string;
        doctorName: string;
        availableTimes: TimeSlot[];
        onSelectTime?: (time: string) => void; 
    };
};


const Stack = createNativeStackNavigator<BookingStackParamList>();

const BookingWizardNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BookingWizardMain" component={BookingWizard} />
            <Stack.Screen name="AppointmentBooking" component={AppointmentTimeSelectionScreen} />
        </Stack.Navigator>
    );
};

export default BookingWizardNavigator;