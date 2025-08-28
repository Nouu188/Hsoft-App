import { COLORS, FONTS, SHADOWS, SIZES } from "@/constants/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text } from "react-native";
import { TouchableOpacity, View } from "react-native";
import {SettingsMenuItemProps} from '../types'

const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemIconContainer}>
            <Ionicons name={icon as any} size={22} color={COLORS.textDark} />
        </View>
        <Text style={styles.menuItemText}>{text}</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textLight} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 1.5,
        padding: SIZES.base * 1.5,
        marginBottom: SIZES.base * 1.5,
        ...SHADOWS.light,
    },
    menuItemIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemText: {
        ...FONTS.body3,
        flex: 1,
        marginLeft: SIZES.padding,
        fontWeight: '600',
        color: COLORS.textLight,
    },
});

export default SettingsMenuItem;