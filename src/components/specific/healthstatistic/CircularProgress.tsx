import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircularProgressProps } from './types'; // Import type từ file chung

const CircularProgress: React.FC<CircularProgressProps> = ({ value, total, size = 160, strokeWidth = 12 }) => {
    const percentage = (value / total) * 100;
    const radius = size / 2;
    const fillTranslateY = size - (size * percentage) / 100;

    return (
        <View style={[styles.progressContainer, { width: size, height: size, borderRadius: radius, overflow: 'hidden' }]}>
            <View style={[styles.progressLayer, { backgroundColor: '#EFF6FF' }]} />
            <View
                style={[
                    styles.progressLayer,
                    { 
                        backgroundColor: '#60A5FA',
                        transform: [{ translateY: fillTranslateY }],
                    },
                ]}
            />
            <View style={[ styles.progressInnerCircle, { width: size - strokeWidth * 2, height: size - strokeWidth * 2, borderRadius: radius, }, ]}>
                <View style={styles.pillIcon} />
                <Text style={styles.progressText}> {value}/{total} viên </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    progressContainer: { alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 24, backgroundColor: '#EFF6FF' },
    progressLayer: { position: 'absolute', width: '100%', height: '100%', },
    progressInnerCircle: { backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    pillIcon: { width: 20, height: 40, backgroundColor: '#93C5FD', borderRadius: 20, transform: [{ rotate: '45deg' }], opacity: 0.8, },
    progressText: { position: 'absolute', fontSize: 22, fontWeight: 'bold', color: '#1E293B', },
});

export default CircularProgress;