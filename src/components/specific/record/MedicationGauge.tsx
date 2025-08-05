import { COLORS } from '@/constants/theme';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Text as SvgText, Path } from 'react-native-svg';

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

const styles = StyleSheet.create({
    gaugeText: { position: 'absolute', bottom: 0, fontSize: 16, fontWeight: '600', color: COLORS.textDark },
});

export default MedicationGauge;