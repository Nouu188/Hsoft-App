import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingScreen from '@/screens/booking/BookingScreen';

import { TimeSlot } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import AppointmentTimeSelectionScreen from '@/components/specific/booking-wizard/steps/step_2/screen_part/time_selection/AppointmentTimeSelectionScreen';

export type BookingStackParamList = {
    BookingWizardMain: {
        step?: number;
        prefilledDoctors?: { doctorId: string; selectedTime: string }[];
        prefilledClinics?: { clinicId: string; selectedTime: string }[];
    };
    AppointmentBooking: {
        doctorId: string;
        doctorName: string;
        availableTimes: TimeSlot[];
        onSelectTime?: (time: string) => void; 
    };
    
};


const Stack = createNativeStackNavigator<BookingStackParamList>();

const BookingScreenNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BookingWizardMain" component={BookingScreen} />
            <Stack.Screen name="AppointmentBooking" component={AppointmentTimeSelectionScreen} />
        </Stack.Navigator>
    );
};

export default BookingScreenNavigator;