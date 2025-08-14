import { COLORS, FONTS, SIZES } from "@/constants/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SettingsHeader = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={28} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={styles.headerButton} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding / 2, 
        paddingVertical: SIZES.base,
    },
    headerButton: {
        width: 50, 
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...FONTS.h2,
    },
});

export default SettingsHeader;