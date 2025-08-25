import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import CustomTabBar from './CustomTabBar';
import ProfileStackNavigator from './ProfileStackNavigator';
import HomeScreenNavigator from './HomeScreenNavigator';
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreenNavigator} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="ProfileStack" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default TabNavigator;