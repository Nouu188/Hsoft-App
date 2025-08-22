import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen.tsx'
import NotificationSettingScreen from '../components/specific/notification/NotificationSetting.tsx'
import NotificationScreen from '@/screens/notification/NotificationScreen.tsx';
import NoteScreen from '@/screens/utility_screen/note_screen/NoteScreen.tsx';
export type HomeStackParamList = {
  Notification:undefined;
  Home:undefined;
  NotificationSetting:undefined;
  NoteScreen:undefined;
};
const Stack = createNativeStackNavigator<HomeStackParamList>();
const HomeScreenNavigator = () => {
  return (
     <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="NotificationSetting" component={NotificationSettingScreen} />
        <Stack.Screen name="NoteScreen" component={NoteScreen} />
     </Stack.Navigator>
  )
}

export default HomeScreenNavigator;