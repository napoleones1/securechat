import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChatsListScreen from '../screens/ChatsListScreen';
import CallsListScreen from '../screens/CallsListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Colors from '../styles/colors';

const Tab = createMaterialTopTabNavigator();

const MainTabs = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SecureChat</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="magnify" size={24} color={Colors.TEXT_WHITE} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="dots-vertical" size={24} color={Colors.TEXT_WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIndicatorStyle: styles.tabBarIndicator,
          tabBarActiveTintColor: Colors.TEXT_WHITE,
          tabBarInactiveTintColor: Colors.TEXT_LIGHT,
          tabBarPressColor: Colors.PRIMARY_LIGHT,
        }}>
        <Tab.Screen
          name="Chats"
          component={ChatsListScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="message-text" size={20} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Calls"
          component={CallsListScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="phone" size={20} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="cog" size={20} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: Colors.PRIMARY,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_WHITE,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 20,
  },
  tabBar: {
    backgroundColor: Colors.PRIMARY,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tabBarIndicator: {
    backgroundColor: Colors.TEXT_WHITE,
    height: 3,
  },
});

export default MainTabs;
