import { COLORS, SIZES } from '@/constants/theme';
import { DoseStatus, MealRelation } from '@/types';
import { Dose } from '@/types/dtos/dose/dose.dto';
import { GroupedDose } from '@/types/dtos/dose/grouped-dose.dto';
import Ionicons from '@react-native-vector-icons/ionicons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MenuOption } from './DoseActionMenu';
import { useDoseItem } from '../hooks/useDoseItem';
import DailySchedulePills from './DailySchedulePills';
import DoseItemModals from './DoseItemModals';
import MealTimeSetter from './MealTimeSetter';

interface DoseItemProps {
  dose: Dose;
  allDosesForDay: GroupedDose[];

  onTogglePrepared: (doseId: string) => void;
  onNavigateToTime: (time: string) => void;
  onSkipDose: (doseId: string, reason: { category: string; detail?: string }) => void;
  onSetMealPreference: (doseId: string, preference: MealRelation | null) => void;
  onRescheduleDose: (doseId: string, newTime: string) => void;
}

const DoseItem: React.FC<DoseItemProps> = (props) => {
  const { dose, allDosesForDay, onTogglePrepared, onNavigateToTime } = props;

  const {
    isMenuVisible,
    isSkipModalVisible,
    isTimePickerVisible,
    pickerMode,
    confirmationState,
    detectedMealType,

    setMenuVisible,
    setSkipModalVisible,
    handleConfirmSkip,
    setTimePickerVisible,
    handleConfirmTime,
    setConfirmationState,
    showMealTimePicker,

    menuOptions,
  } = useDoseItem(props);

  const isTaken = dose.status === DoseStatus.TAKEN;
  const isUpcoming = dose.status === DoseStatus.UPCOMING;

  return (
    <View style={[styles.doseItemContainer, dose.is_prepared && !isTaken && !isUpcoming && styles.preparedItem]}>
      <View style={styles.doseItem}>
        {!isTaken && !isUpcoming ? (
          <TouchableOpacity onPress={() => onTogglePrepared(dose.id)} style={styles.checkbox}>
            <Ionicons name={dose.is_prepared ? "checkbox" : "square-outline"} size={24} color={dose.is_prepared ? COLORS.primary : COLORS.textLight} />
          </TouchableOpacity>
        ) : !isUpcoming ? (
          <Ionicons name="checkbox" style={styles.checkbox} size={24} color={COLORS.primary} />
        ) : (
          <Ionicons name="ellipse" style={styles.checkbox} size={24} color={COLORS.primary} />
        )}

        <View style={styles.doseInfo}>
          <Text style={[styles.medicationName]}>{dose.medication_name}</Text>
          <Text style={[styles.dosageText]}>{dose.dosage_instructions}</Text>

          <View style={styles.usageContainer}>
            {dose.usage_instructions && <Text style={[styles.usageText]}>{dose.usage_instructions}</Text>}
            {detectedMealType && (
              <MealTimeSetter doseStatus={dose.status} mealRelation={dose.meal_relation} onPress={showMealTimePicker} />
            )}
          </View>

          <DailySchedulePills
            currentDose={dose}
            allDosesForDay={allDosesForDay}
            onPillPress={onNavigateToTime}
          />
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textLight} />
        </TouchableOpacity>

      </View>

      <DoseItemModals
        dose={dose}
        isMenuVisible={isMenuVisible}
        isSkipModalVisible={isSkipModalVisible}
        isTimePickerVisible={isTimePickerVisible}
        pickerMode={pickerMode}
        confirmationState={confirmationState}
        menuOptions={menuOptions as MenuOption[]}
        onCloseMenu={() => setMenuVisible(false)}
        onCloseSkipModal={() => setSkipModalVisible(false)}
        onConfirmSkip={handleConfirmSkip}
        onCloseTimePicker={() => setTimePickerVisible(false)}
        onConfirmTime={handleConfirmTime}
        onCloseConfirmation={() => setConfirmationState(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  doseItemContainer: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: '#F1F5F9',
  },
  preparedItem: {
    opacity: 0.9,
  },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: SIZES.padding / 1.5,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2
  },
  doseInfo: {
    flex: 1
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark
  },
  dosageText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  usageText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic'
  },
  menuButton: {
    padding: 8,
    paddingRight: 0,
  },
});


export default DoseItem;