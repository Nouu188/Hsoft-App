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

// Style cho header
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',            // sắp xếp các phần tử theo hàng ngang
        justifyContent: 'space-between', // 3 phần tử cách đều
        alignItems: 'center',            // căn giữa theo chiều dọc
        paddingHorizontal: SIZES.padding / 2, // padding ngang
        paddingVertical: SIZES.base,           // padding dọc
    },
    headerButton: {
        width: 50, 
        height: 50,
        justifyContent: 'center', // căn giữa icon theo chiều dọc
        alignItems: 'center',     // căn giữa icon theo chiều ngang
    },
    headerTitle: {
        ...FONTS.h2, // style chữ lớn, bold
    },
});

export default SettingsHeader;
