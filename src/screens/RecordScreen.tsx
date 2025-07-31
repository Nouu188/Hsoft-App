// src/screens/RecordScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Text as SvgText, Path } from 'react-native-svg';
import { COLORS, SIZES } from '../constants/theme';

const MedicationGauge = ({ percentage = 60 }) => {
    const radius = 80;
    const strokeWidth = 20;
    const angle = (percentage / 100) * 270;

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 135) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    };

    const endPoint = polarToCartesian(radius, radius, radius - strokeWidth / 2, angle);
    const startPoint = polarToCartesian(radius, radius, radius - strokeWidth / 2, 0);
    const largeArcFlag = angle <= 180 ? "0" : "1";
    const pathData = `M ${startPoint.x} ${startPoint.y} A ${radius - strokeWidth / 2} ${radius - strokeWidth / 2} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 20 }}>
            <Svg width={radius * 2} height={radius * 2}>
                <G rotation={135} origin={`${radius}, ${radius}`}>
                    <Path
                        d={`M ${startPoint.x} ${startPoint.y} A ${radius - strokeWidth / 2} ${radius - strokeWidth / 2} 0 1 1 ${polarToCartesian(radius, radius, radius - strokeWidth / 2, 270).x} ${polarToCartesian(radius, radius, radius - strokeWidth / 2, 270).y}`}
                        stroke={COLORS.lightGray}
                        fill="none"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                     <Path
                        d={pathData}
                        stroke={COLORS.primary}
                        fill="none"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                </G>
                <G>
                    <Circle cx={radius} cy={radius} r="10" fill={COLORS.textDark} />
                    <Path
                        d={`M ${radius} ${radius} L ${endPoint.x} ${endPoint.y}`}
                        stroke={COLORS.textDark}
                        strokeWidth="2"
                        transform={`rotate(${angle + 135}, ${radius}, ${radius})`}
                    />
                </G>
            </Svg>
             <Text style={styles.gaugeText}>Yesterday: {percentage}%</Text>
        </View>
    );
};

const RecordScreen = () => {
    const [activeTab, setActiveTab] = useState('Meds');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity>

                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Record</Text>
                    <TouchableOpacity>

                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'Meds' && styles.activeTab]}
                        onPress={() => setActiveTab('Meds')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Meds' && styles.activeTabText]}>Meds</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'Measurement' && styles.activeTab]}
                        onPress={() => setActiveTab('Measurement')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Measurement' && styles.activeTabText]}>Measurement</Text>
                    </TouchableOpacity>
                </View>

                {/* Medication Tracked Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Medication Tracked</Text>

                    </View>
                    <MedicationGauge percentage={60} />
                    <TouchableOpacity style={styles.viewAllButton}>
                        <Text style={styles.viewAllText}>View all logs</Text>

                    </TouchableOpacity>
                </View>

                {/* Streak Cards */}
                <View style={styles.streakContainer}>
                    <View style={styles.streakCard}>

                        <Text style={styles.streakNumber}>0 day</Text>
                        <Text style={styles.streakLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.streakCard}>

                        <Text style={styles.streakNumber}>0 day</Text>
                        <Text style={styles.streakLabel}>Longest Streak</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.lightGray, borderRadius: 25, margin: SIZES.padding, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  activeTab: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { color: COLORS.textLight, fontWeight: '600' },
  activeTabText: { color: COLORS.primary },
  card: { backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius * 1.5, padding: SIZES.padding, marginHorizontal: SIZES.padding },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  gaugeText: { position: 'absolute', bottom: 0, fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  viewAllButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.primary, padding: 15, borderRadius: SIZES.radius, marginTop: 10 },
  viewAllText: { color: COLORS.white, fontWeight: 'bold' },
  streakContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: SIZES.padding },
  streakCard: { flex: 1, backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius, padding: SIZES.padding, alignItems: 'center', marginHorizontal: SIZES.padding / 2 },
  streakNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginVertical: 5 },
  streakLabel: { fontSize: 14, color: COLORS.textLight },
});

export default RecordScreen;