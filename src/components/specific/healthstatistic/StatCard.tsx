import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { StatCardProps } from './types';

const StatCard: React.FC<StatCardProps> = ({ stat }) => (
    <View style={styles.statCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.statValue}>{stat.value}</Text>
            {stat.hasIcon && (
                <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
            )}
        </View>
        <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
);

const styles = StyleSheet.create({
    statCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, width: '48%', shadowColor: '#9FB1C6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, },
    statValue: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', },
    statLabel: { fontSize: 14, color: '#64748B', marginTop: 8, },
    checkIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#34D399', justifyContent: 'center', alignItems: 'center', marginLeft: 8, },
});

export default StatCard;