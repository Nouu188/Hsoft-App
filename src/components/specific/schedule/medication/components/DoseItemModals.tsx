import React from 'react';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { Dose } from '@/types';
import DoseActionMenu, { MenuOption } from './DoseActionMenu';
import SkipReasonModal from '../../shared/SkipReasonModal';

interface DoseItemModalsProps {
  dose: Dose;
  isMenuVisible: boolean;
  isSkipModalVisible: boolean;
  isTimePickerVisible: boolean;
  pickerMode: 'reschedule' | 'mealTime' | null;
  confirmationState: { visible: boolean; title: string; message: string; onConfirm: () => void; } | null;
  menuOptions: MenuOption[];
  
  onCloseMenu: () => void;
  onCloseSkipModal: () => void;
  onConfirmSkip: (reason: { category: string; detail?: string }) => void;
  onCloseTimePicker: () => void;
  onConfirmTime: (date: Date) => void;
  onCloseConfirmation: () => void;
}

const DoseItemModals: React.FC<DoseItemModalsProps> = (props) => {
  const {
    dose,
    isMenuVisible,
    isSkipModalVisible,
    isTimePickerVisible,
    pickerMode,
    confirmationState,
    menuOptions,
    onCloseMenu,
    onCloseSkipModal,
    onConfirmSkip,
    onCloseTimePicker,
    onConfirmTime,
    onCloseConfirmation,
  } = props;

  return (
    <>
      <DoseActionMenu
        visible={isMenuVisible}
        onClose={onCloseMenu}
        options={menuOptions}
        title={`Tùy chọn cho ${dose.medication_name}`}
      />
      <SkipReasonModal
        visible={isSkipModalVisible}
        onClose={onCloseSkipModal}
        onConfirm={onConfirmSkip}
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={onConfirmTime}
        onCancel={onCloseTimePicker}
        title={pickerMode === 'reschedule' ? "Chọn giờ uống mới" : "Chọn giờ ăn"}
        date={new Date(dose.due_at)}
        is24Hour={true}
      />
      {confirmationState && (
        <ConfirmationModal
          visible={confirmationState.visible}
          onClose={onCloseConfirmation}
          onConfirm={confirmationState.onConfirm}
          title={confirmationState.title}
          message={confirmationState.message}
        />
      )}
    </>
  );
};

export default DoseItemModals;