// App.tsx
import React, { useState, useEffect, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, SafeAreaView, Platform } from "react-native";
import * as Font from "expo-font";
import Colors from "./assets/utils/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreen from "./App/Screen/HomeScreen";
import LoginScreen from "./App/Screen/LoginScreen";
import DisplayVideo from "./App/Screen/DisplayVideo";
import EnrolledScreen from "./App/Screen/EnrolledScreen";
import EnrollScreen from "./App/Screen/EnrollScreen";
import ProfileScreen from "./App/Screen/ProfileScreen";
import CourseDetailsScreen from "./App/Screen/CourseDetails";
import { LogBox } from "react-native";
LogBox.ignoreLogs(["new NativeEventEmitter", "_RNGestureHandlerModule.default.flushOperations"]); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
import {
  useLogin,
  LoginContextProvider,
} from "./App/context/LoginContext";
import ModuleScreen from "./App/Screen/ModuleScreen";
import UnitScreen from "./App/Screen/UnitScreen";
import { ColorContextProvider } from "./App/context/ColorContext";
import { ColorContext } from './App/context/ColorContext';
import CoursesScreen from "./App/Screen/Courses";
import { EnrollContextProvider } from "./App/context/EnrollContext";
import { AntDesign } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeTabs = () => {
  const color = useContext(ColorContext);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: color.mode === 'dark' ? 'white' : Colors.WHITE,
        tabBarInactiveTintColor: Colors.BLACK,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          overflow: 'hidden',
        },
      }}
      tabBar={(props) => (
        <LinearGradient
          colors={['#FFD700', '#B8860B']}
          // #f5b925 is the hex code for gold color
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          {props.state.routes.map((route, index) => {
            let iconName: any;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Enrolled') {
              iconName = 'card-membership';
            } else if (route.name === 'Profile') {
              iconName = 'account-circle';
            }

            return (
              <>
                {iconName == 'home' ?
                  <AntDesign name={iconName} size={25} color={props.state.index === index ? Colors.WHITE : Colors.BLACK} onPress={() => props.navigation.navigate(route.name)}></AntDesign> :
                  <MaterialIcons
                    key={index}
                    name={iconName}
                    size={25}
                    color={props.state.index === index ? Colors.WHITE : Colors.BLACK}
                    onPress={() => props.navigation.navigate(route.name)}
                  />
                }
              </>

            );
          })}
        </LinearGradient>
      )}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ size, focused }) => (
            <AntDesign
              name="home"
              size={size}
              color={color.mode === 'dark' ? Colors.WHITE : focused ? Colors.WHITE : Colors.BLACK}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Enrolled"
        component={CoursesStack}
        options={{
          tabBarIcon: ({ size, focused }) => (
            <View style={focused && { backgroundColor: Colors.BLACK, borderRadius: 50, padding: 7 }}>
              <MaterialIcons
                name="card-membership"
                size={size}
                color={color.mode === 'dark' ? Colors.WHITE : focused ? Colors.WHITE : Colors.BLACK}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ size, focused }) => (
            <View style={focused && { backgroundColor: Colors.BLACK, borderRadius: 50, padding: 7 }}>
              <MaterialIcons
                name="account-circle"
                size={size}
                color={color.mode === 'dark' ? Colors.WHITE : focused ? Colors.WHITE : Colors.BLACK}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EnrolledScreen"
        component={EnrolledScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ModuleScreen"
        component={ModuleScreen}
        options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Modules' }}
      />
      <Stack.Screen
        name="UnitScreen"
        component={UnitScreen}
        options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Units' }}
      />
      <Stack.Screen
        name="CourseDetails"
        component={CourseDetailsScreen}
        options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Chapters' }}
      />
      <Stack.Screen
        name="DisplayVideo"
        component={DisplayVideo}
        options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Video' }}
      />
    </Stack.Navigator>
  );
};

const CoursesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CoursesScreen"
        component={CoursesScreen}
        // options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Courses' }}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EnrollScreen"
        component={EnrollScreen}
        options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Enroll' }}
      />
      <Stack.Screen
        name="EnrolledScreen"
        component={EnrolledScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ModuleScreen"
        component={ModuleScreen}
        options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Modules' }}
      />
      <Stack.Screen
        name="UnitScreen"
        component={UnitScreen}
        options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Units' }}
      />
      <Stack.Screen
        name="CourseDetails"
        component={CourseDetailsScreen}
        options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Chapters' }}
      />
      <Stack.Screen
        name="DisplayVideo"
        component={DisplayVideo}
        options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Video' }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        // options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Profile' }}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: Platform.OS === 'ios', headerBackTitleVisible: false, headerTitle: 'Modules' }} /> */}
    </Stack.Navigator>
  );
};


const Navigator = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
    </Stack.Navigator>
  );
};

const App: React.FC<any> = () => {
  const [fontLoaded, setFontLoaded] = useState(false);

  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // const LoginStatus = useContext(LoginContext);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        "outfit-bold": require("./assets/fonts/Outfit-Bold.ttf"),
        "outfit-regular": require("./assets/fonts/Outfit-Regular.ttf"),
        "outfit-light": require("./assets/fonts/Outfit-Light.ttf"),
        "outfit-semibold": require("./assets/fonts/Outfit-SemiBold.ttf"),

        "AlumniSans": require("./assets/fonts/AlumniSans-Regular.ttf"),
        "AlumniSans-semibold": require("./assets/fonts/AlumniSans-SemiBold.ttf"),
        "AlumniSans-bold": require("./assets/fonts/AlumniSans-Bold.ttf"),
        "AlumniSans-italic": require("./assets/fonts/AlumniSans-Italic.ttf"),
        "AlumniSans-bold-italic": require("./assets/fonts/AlumniSans-SemiBoldItalic.ttf"),

        "Euclid-regular": require("./assets/fonts/Euclid-Circular-A-Regular.ttf"),
        "Euclid-italic": require("./assets/fonts/Euclid-Italic.ttf"),
        "Euclid-bold": require("./assets/fonts/Euclid-Bold.ttf"),



      });
      setFontLoaded(true);
    }

    loadFont();
  }, []);

  if (!fontLoaded) {
    return (
      <View style={styles.container}>
        
        <Text style={styles.loadingText}>Loading...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }


  return (
    <>
      {
        Platform.OS === 'ios' && <StatusBar style="auto" />
      }
      {/* <StatusBar style="dark"/> */}
      <EnrollContextProvider>
        <ColorContextProvider>
          <LoginContextProvider>
            <NavigationContainer>
              <Navigator />
            </NavigationContainer>
          </LoginContextProvider>
        </ColorContextProvider>
      </EnrollContextProvider>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.LIGHT_BLUE,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },
  loadingText: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
