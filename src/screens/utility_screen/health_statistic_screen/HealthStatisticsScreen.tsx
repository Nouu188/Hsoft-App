import { SIZES } from '@/constants/theme';
import React, { useState } from 'react';
import {
SafeAreaView,
View,
Text,
StyleSheet,
ScrollView,
} from 'react-native';
// Import các kiểu dữ liệu và component đã tách

import StatisticHeader from '@/components/specific/healthstatistic/StatisticHeader'
import SegmentedControl from '@/components/specific/healthstatistic/SegmentedControl';
import MedicationCard from '@/components/specific/healthstatistic/MedicationCard';
import StatCard from '@/components/specific/healthstatistic/StatCard';
import { DailyProgress, Medication, Statistic } from '@/components/specific/healthstatistic/types';
import CircularProgress from '@/components/specific/healthstatistic/CircularProgress';
// ======================== DỮ LIỆU GIẢ LẬP (MOCK DATA) ========================
const dailyProgress: DailyProgress = { taken: 3, total: 5 };
const medications: Medication[] = [
{ name: 'Nhôm', frequency: '2 lần', taken: 1, total: 2, color: '#FDBA74', progressColor: '#34D399', iconColor: '#FB923C' },
{ name: 'Paracetamol', frequency: '1 lần', taken: 1, total: 1, color: '#93C5FD', progressColor: '#60A5FA', iconColor: '#3B82F6' },
{ name: 'Paracetamol', frequency: '1 lần', taken: 1, total: 1, color: '#93C5FD', progressColor: '#60A5FA', iconColor: '#3B82F6' },
{ name: 'Paracetamol', frequency: '1 lần', taken: 1, total: 1, color: '#93C5FD', progressColor: '#60A5FA', iconColor: '#3B82F6' },
{ name: 'Paracetamol', frequency: '1 lần', taken: 1, total: 1, color: '#93C5FD', progressColor: '#60A5FA', iconColor: '#3B82F6' },
];
const statistics: Statistic[] = [
{ value: '5 ngày', label: 'liên tiếp', hasIcon: true },
{ value: '90%', label: 'Tuân thủ 30 ngày qua', hasIcon: false },
];
// =================================================================
// --- COMPONENT CHÍNH CỦA MÀN HÌNH ---
// =================================================================
const HealthStatisticScreen: React.FC = () => {
const [selectedPeriod, setSelectedPeriod] = useState('Theo ngày');
const periodOptions = ['Theo ngày', 'Theo tuần', 'Theo tháng'];
const handlePeriodChange = (period: string) => {
    console.log('Đã chọn:', period);
    setSelectedPeriod(period);
};
return (
<SafeAreaView style={styles.safeArea}>
<View style={styles.stickyHeaderContainer}>
<StatisticHeader />
<SegmentedControl
options={periodOptions}
selectedOption={selectedPeriod}
onSelect={handlePeriodChange}
/>
</View>
<ScrollView
    style={styles.container}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.contentContainer}
  >
    <CircularProgress value={dailyProgress.taken} total={dailyProgress.total} />
    
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thuốc của bạn</Text>
      {medications.map((med, index) => (
        <MedicationCard key={index} medication={med} />
      ))}
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thống kê</Text>
      <View style={styles.statsGrid}>
        {statistics.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </View>
    </View>
  </ScrollView>
</SafeAreaView>
);
};
// =================================================================
// --- STYLES (Chỉ giữ lại các style cần thiết cho màn hình chính) ---
// =================================================================
const styles = StyleSheet.create({
safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
stickyHeaderContainer: {
paddingHorizontal: 24,
backgroundColor: '#F8FAFC',
paddingBottom: SIZES.base,
marginTop:SIZES.base*2
},
container: {
flex: 1
},
contentContainer: {
paddingHorizontal: 24,
paddingBottom: SIZES.padding * 5,
},
section: {
marginTop: SIZES.padding * 2, // Tăng khoảng cách giữa các mục
},
sectionTitle: {
fontSize: 20,
fontWeight: 'bold',
color: '#1E293B',
marginBottom: 16,
},
statsGrid: {
flexDirection: 'row',
justifyContent: 'space-between',
},
});
export default HealthStatisticScreen;