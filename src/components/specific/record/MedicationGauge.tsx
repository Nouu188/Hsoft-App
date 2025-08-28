import { COLORS } from '@/constants/theme';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

// Component hiển thị đồng hồ/Gauge đo tiến độ uống thuốc
const MedicationGauge = ({ percentage = 60 }) => {
    const radius = 80;       // Bán kính vòng gauge
    const strokeWidth = 20;  // Độ dày vòng gauge
    const angle = (percentage / 100) * 270; // Góc quét dựa trên % (max 270 độ)

    // Chuyển tọa độ cực sang tọa độ Cartesian (x, y)
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 135) * Math.PI) / 180.0; // Bắt đầu từ -135 độ
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    };

    // Tính điểm đầu và điểm cuối của cung
    const endPoint = polarToCartesian(radius, radius, radius - strokeWidth / 2, angle);
    const startPoint = polarToCartesian(radius, radius, radius - strokeWidth / 2, 0);
    const largeArcFlag = angle <= 180 ? "0" : "1"; // Cờ để xác định cung lớn hay nhỏ
    const pathData = `M ${startPoint.x} ${startPoint.y} A ${radius - strokeWidth / 2} ${radius - strokeWidth / 2} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 20 }}>
            <Svg width={radius * 2} height={radius * 2}>
                {/* Vòng gauge */}
                <G rotation={135} origin={`${radius}, ${radius}`}>
                    {/* Nền vòng gauge (lightGray) */}
                    <Path
                        d={`M ${startPoint.x} ${startPoint.y} A ${radius - strokeWidth / 2} ${radius - strokeWidth / 2} 0 1 1 ${polarToCartesian(radius, radius, radius - strokeWidth / 2, 270).x} ${polarToCartesian(radius, radius, radius - strokeWidth / 2, 270).y}`}
                        stroke={COLORS.lightGray}
                        fill="none"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                    {/* Phần màu tiến độ (primary) */}
                    <Path
                        d={pathData}
                        stroke={COLORS.primary}
                        fill="none"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                </G>

                {/* Kim gauge */}
                <G>
                    {/* Tâm kim */}
                    <Circle cx={radius} cy={radius} r="10" fill={COLORS.textDark} />
                    {/* Kim chỉ số */}
                    <Path
                        d={`M ${radius} ${radius} L ${endPoint.x} ${endPoint.y}`}
                        stroke={COLORS.textDark}
                        strokeWidth="2"
                        transform={`rotate(${angle + 135}, ${radius}, ${radius})`} // Xoay kim theo %
                    />
                </G>
            </Svg>
            {/* Chữ hiển thị phần trăm */}
            <Text style={styles.gaugeText}>Yesterday: {percentage}%</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    // Text hiển thị % ở dưới cùng
    gaugeText: { 
        position: 'absolute', 
        bottom: 0, 
        fontSize: 16, 
        fontWeight: '600', 
        color: COLORS.textDark 
    },
});

export default MedicationGauge;
