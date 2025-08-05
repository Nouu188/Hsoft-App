import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

const HeartProgress = ({ percentage = 60 }) => {
    const radius = 60;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (percentage / 100) * circumference;

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
                <G rotation="-90" origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}>
                    <Circle
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        stroke={COLORS.lightGray}
                        fill="transparent"
                        strokeWidth={strokeWidth}
                    />
                    <Circle
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        stroke={COLORS.primary}
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={progress}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>
            <View style={styles.heartCenter}>
                <Ionicons name="heart" size={30} color={COLORS.danger} />
                <Text style={styles.heartPercentage}>{percentage}%</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  heartCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  heartPercentage: { fontSize: 22, fontWeight: 'bold', color: COLORS.textDark, marginTop: 5 },
});

export default HeartProgress;