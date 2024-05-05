import React, { useContext, useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, Switch, Platform, ImageBackground } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import profile from "../../assets/images/profile.png";
import bich_pro from "../../assets/images/bich_pro.png"
import male from "../../assets/images/2.png"
import female from "../../assets/images/3.png"
import Colors from "../../assets/utils/Colors";
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { useLogin } from "../../App/context/LoginContext";
import axios from "axios";
import { ColorContext } from '../context/ColorContext';
import { Feather, Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';

import { HOST as api } from '@env';

const ProfileScreen = () => {
  const { state, dispatch } = useLogin();
  const navigation: any = useNavigation();
  const [logoutConfirmationVisible, setLogoutConfirmationVisible] = useState(false);
  const [user, setUser] = useState<any>('');

  const handleLogout = async () => {
    // Close the confirmation modal
    setLogoutConfirmationVisible(false);

    try {
      await SecureStore.deleteItemAsync('jwtToken');
      console.log("Logout Successful");
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  let tkn;
  useEffect(() => {
    let headers: any;
    const getUser = async () => {
      tkn = await SecureStore.getItemAsync("jwtToken");
      if (tkn) {
        headers = { 'auth-token': tkn }
      }
      const response = await axios.get(`http://${api}/api/getUser`, { headers })
      setUser(response.data);

    }
    getUser();
  }, [])

  let Gender;
  const [gender, setgender] = useState(false);

  return (
    <ScrollView contentContainerStyle={[styles.container]}>
      <View style={[styles.profileHeader]}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', rowGap: 50, paddingTop: 10, alignItems: "baseline" }}>
          <View style={{ marginLeft: '80%' }}>
            <MaterialIcons
              name="logout"
              size={20}
              color={"#000"}
              onPress={() => setLogoutConfirmationVisible(true)}
            />
          </View>
        </View>
        <Image source={user.gender === "Male" ? male : female} style={styles.profileImage} />
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileCollege}>{user.schoolName}</Text>
      </View>

      <View>
        <Image source={bich_pro} style={{ width: "100%", marginTop: -40, height: 150 }} />
      </View>

      <View style={{paddingLeft: 30, paddingRight: 30, gap: 25, marginTop: 20}}>
        <View style={[styles.infoContainer]}>
          <Feather name="user" size={24} color={Colors.GOLD} style={{ marginTop: 10 }} />
          <View style={[styles.infoTextContainer]}>
            <Text style={[styles.infoLabel]}>USERNAME</Text>
            <Text style={[{ fontSize: 17 }]}>{user.username}</Text>
          </View>
        </View>

        <View style={[styles.infoContainer]}>
          <Fontisto name="email" size={24} color={Colors.GOLD} style={{ marginTop: 10 }} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoLabel]}>EMAIL</Text>
            <Text style={[{ fontSize: 17 }]}>{user.email}</Text>
          </View>
        </View>

        <View style={[styles.infoContainer]}>
          <Feather name="smartphone" size={24} color={Colors.GOLD} style={{ marginTop: 10 }} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoLabel]}>PHONE</Text>
            <Text style={[{ fontSize: 17 }]}>{user.mobile}</Text>
          </View>
        </View>

        <View style={[styles.infoContainer]}>
          <MaterialCommunityIcons name={user.gender === "Male" ? "gender-male" : "gender-female"} size={24} color={Colors.GOLD} style={{ marginTop: 10 }} />
          {/* <MaterialCommunityIcons name="gender-male" size={24} color={Colors.GOLD} style={{marginTop:10}}/> */}
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoLabel]}>GENDER</Text>
            <Text style={[{ fontSize: 17 }]}>{user.gender}</Text>

          </View>
        </View>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={logoutConfirmationVisible}
        onRequestClose={() => setLogoutConfirmationVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to logout?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setLogoutConfirmationVisible(false)}>
                <Text style={styles.modalButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.modalButton}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.LIGHT_BLUE,
    ...Platform.select({
      ios: {
        marginTop: 32,
      },
    }),
  },
  darkContainer: {
    backgroundColor: Colors.BLACK,
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.LIGHT_BLUE,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    height: 250,
    paddingBottom: 20,

  },
  darkprofileHeader: {

  },
  greetingText: {
    color: '#000',
    fontSize: 25,
    fontFamily: "Euclid-regular",
    marginRight: 60,
    marginLeft: 25,
    marginBottom: 5,
  },
  darkgreetingText: {},
  profileImageContainer: {
    backgroundColor: Colors.WHITE,
    borderRadius: 100,
    width: 110,
    height: 110,
    alignItems: "center",
  },
  darkprofileImageContainer: {},
  profileImage: {
    marginTop: -25,
    width: 200,
    height: 140,
    borderRadius: 10,
    resizeMode: 'contain'
  },
  profileName: {
    color: Colors.BLACK,
    fontFamily: "Euclid-regular",
    marginTop: 5

  },
  darkprofileName: {},
  profileCollege: {
    color: Colors.BLACK,
    marginTop: 0,
    fontFamily: 'Euclid-regular',
  },
  darkprofileCollege: {},
  infoContainer: {
    borderColor: Colors.GOLD,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderRadius: 10,
    // borderBottomWidth: 0,
    display: "flex",
    flexDirection: "row",
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    gap: 10,
  },
  darkinfoContainer: {
    borderColor: Colors.GRAY,
  },
  infoIcon: {
    size: 25,
    color: Colors.LIGHT_PRIMARY,
  },
  darkinfoIcon: {},
  infoTextContainer: {
    paddingTop: 5,
    marginLeft: 10
  },
  darkinfoTextContainer: {
  },
  infoLabel: {
    fontFamily: "Euclid-regular",
    fontSize: 10,
    color: Colors.GRAY,
  },
  darkinfoLabel: {
    color: Colors.WHITE,
  },
  darkuserInfo: {
    color: Colors.WHITE,
  },
  infoDetail: {},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  darkmodalContent: {},
  modalText: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  darkmodalButton: {},
  label: {
    fontSize: 17,
    marginRight: 10,
  },
});


export default ProfileScreen;