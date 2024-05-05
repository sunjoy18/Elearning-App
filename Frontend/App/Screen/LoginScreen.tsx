import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ImageBackground,
  ScrollView,
} from "react-native";
import app from "../../assets/images/NXGN.png";
import Colors from "../../assets/utils/Colors";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { BackHandler } from 'react-native';
import { Modal } from "react-native";
import logobg from "../../assets/images/login_bg.png";
import { LinearGradient } from 'expo-linear-gradient';
import { HOST as api } from '@env';

const LoginScreen = () => {

  // USERNAME: Ani
  // PASSWORD: 12345
  
  const checkLoginStatus = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("jwtToken");
      if (storedToken) {
        navigation.dispatch(
          CommonActions.reset({
            routes: [{ name: "HomeTabs" }],
          })
        );
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const Login = async () => {
    try {
      // Your logic to make an API request for user authentication
      const response = await axios.post(`http://${api}/api/auth/login`, formData );

      // Assuming the API response includes an authentication token
      const authToken = response.data.authToken;

      // Store the authentication token securely
      await SecureStore.setItemAsync("jwtToken", authToken);

      // For example, navigate to HomeScreen using React Navigation
      // navigation.navigate('HomeScreen');
      navigation.dispatch(
        CommonActions.reset({
          routes: [{ name: "HomeTabs" }],
        })
      );
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Invalid Credentials !");
      setIsErrorModalVisible(true);

    }
  };

  useEffect(() => {
    const backButtonHandler: any = () => {
      BackHandler.exitApp();
    };
    // Add the event listener
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backButtonHandler);
    // Clean up the event listener when the component unmounts
    return () => backHandler.remove();
  });

  return (

    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ImageBackground source={logobg} style={styles.background} >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            alignItems: "center",
          }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >

          <View style={{ display: "flex", width: "100%", alignItems: "center", marginTop: '40%' }}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Image source={app} style={styles.logoImage} />
              </View>
            </View>

            <View style={{ display: "flex", flexDirection: 'row' }}>
              <Text style={[styles.heading, { color: Colors.BLACK }]}>Python School Coding</Text>
            </View>

            {/* <Text style={styles.subHeading}>Empowering Futures at Every Signal.</Text> */}
            <View style={{ width: "100%", display: "flex", alignItems: "center" }}>
              <Text style={styles.label}>UserName:</Text>
              <TextInput
                style={styles.input}
                placeholder="UserName"
                value={formData.username}
                onChangeText={(text) => handleChange("username", text)}
              />

              <Text style={styles.label}>Password:</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={true}
              />
              <LinearGradient
                colors={['#FFD700', '#B8860B']}
                style={{
                  borderRadius: 99,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 150,
                  height: 45,
                  marginTop: 20,
                  borderWidth: 2,
                  borderColor: '#000000',
                  overflow: 'hidden',
                }}
              >
                {/* <TouchableOpacity style={styles.loginButton}> */}
                <Text style={styles.buttonText} onPress={Login}>
                  LOGIN
                </Text>
                {/* </TouchableOpacity> */}
              </LinearGradient>

              <View style={{ marginTop: '10%', display: "flex", flexDirection: 'row' }}>
                <Text style={{ color: "#000" }}>
                  Powered by&nbsp;
                </Text>
                <Text style={{ color: Colors.ORANGE }}>
                  NextGenLab
                </Text>
              </View>
            </View>

          </View>

          <Modal
            visible={isErrorModalVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={{ marginBottom: 20 }}>📕📒📗</Text>
                <Text style={styles.modalText}>{errorMessage}</Text>
                <TouchableOpacity onPress={() => setIsErrorModalVisible(false)}>
                  <Text style={styles.modalButton}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </ImageBackground>
    </ScrollView >
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    width: 150,
    height: 150,
    padding: 10,
  },
  logoBackground: {
    flex: 1,
    resizeMode: "contain",
  },
  background: {
    flex: 1,
    resizeMode: 'strech',
    width: "100%"
  },
  logoImage: {
    flex: 1,
    width: 100,
    aspectRatio: 1 / 1,
    borderRadius: 10,
  },
  heading: {
    marginTop: 10,
    fontSize: 25,
    textAlign: "center",
    fontFamily: "outfit-bold",
  },
  subHeading: {
    fontSize: 20,
    color: Colors.WHITE,
    textAlign: "center",
    paddingBottom: 40,
  },
  label: {
    color: "#000",
    fontSize: 15,
    marginLeft: "-45%",
    paddingTop: 20,
  },
  input: {
    height: 40,
    width: "70%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
  },
  loginButton: {
    backgroundColor: Colors.GOLD,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 45,
    marginTop: 20,
    borderWidth: 2,
    borderColor: Colors.BLACK,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: "outfit-bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.GRAY,
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalText: {
    fontSize: 18,
    color: Colors.WHITE,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    fontSize: 16,
    color: Colors.LIGHT_GREEN,
    fontWeight: 'bold',
    textAlign: "center",
  },

  bgImage: {
    height: "100%",
    zindex: 0
  }
});

LoginScreen.navigationOptions = {
  tabBarStyle: {
    display: "none",
  },
};

export default LoginScreen;
