import { GestureResponderEvent } from 'react-native';
export interface SettingsMenuItemProps {
    icon: string;
    text: string;
    onPress?: () => void;
}
export interface ProfileMenuItemProps {
  icon?: string;
  text: string;
  onPress?: (event: GestureResponderEvent) => void; // Thay đổi kiểu cho onPress nếu cần
  isSwitch?: boolean; // Xác định đây có phải là item có switch không
  switchValue?: boolean; // Giá trị hiện tại của switch
  onSwitchChange?: (value: boolean) => void;
}