import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBarProps } from './types';

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = '#60A5FA', backgroundColor = '#EFF6FF' }) => (
    <View style={[styles.progressBarContainer, { backgroundColor }]}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
);

const styles = StyleSheet.create({
    progressBarContainer: { height: 8, borderRadius: 4, width: '100%', }, // Sửa lại width để linh hoạt hơn
    progressBarFill: { height: '100%', borderRadius: 4, },
});

export default ProgressBar;