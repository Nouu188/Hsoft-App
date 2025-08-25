import React from 'react';
import { View, TouchableOpacity, StyleSheet,Text } from 'react-native';
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS, SIZES } from '../../../constants/theme';

interface HeaderProps {
  onBackPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBackPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Đặt lịch khám</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
     flexDirection: 'row', 
     justifyContent: 'space-between', 
     alignItems: 'center', 
     paddingHorizontal: SIZES.padding, 
     marginTop: SIZES.padding * 2, 
     marginBottom:SIZES.padding*0.4,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.border,
    backgroundColor: COLORS.white, 
  },
  titleContainer: {
    position: 'absolute', 
    left: 0, 
    right: 0, 
    alignItems: 'center' 
  },
   headerTitle: { 
    fontSize: SIZES.h3, 
    fontWeight: 'bold', 
    color: COLORS.text 
  },
});

export default Header;