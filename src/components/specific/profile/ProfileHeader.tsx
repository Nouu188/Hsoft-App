import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { ProfileStackParamList } from "../../../navigation/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text } from "react-native";
import { TouchableOpacity, View } from "react-native";

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

const ProfileHeader = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} /> 
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Profile</Text>
      
      <TouchableOpacity 
        style={styles.headerButton} 
        // onPress={() => handleShare()} // You might want to implement a share function here
      >
        <Ionicons name="share-outline" size={24} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    // Reduced vertical padding to match the image's tighter spacing
    paddingVertical: SIZES.base, 
    backgroundColor: COLORS.primary,
    // Added padding top to account for status bar, making it align within SafeAreaView
    paddingTop: SIZES.padding * 0.5, 
    borderBottomWidth:0.2,
    height:150
  },
  headerButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    ...FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default ProfileHeader;