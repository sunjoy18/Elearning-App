import { View, Text, Dimensions, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Colors from '../../assets/utils/Colors';
import { useRoute } from '@react-navigation/native';
import coursesData from './courses.json';
import { useNavigation } from '@react-navigation/native';
import axios from "axios"
import * as SecureStore from 'expo-secure-store';

import {HOST as api}  from '@env';
import { EnrollContext } from '../context/EnrollContext';
import { ColorContext } from '../context/ColorContext';


const { width, height } = Dimensions.get('window');
const cardWidth = width - 80;
const cardHeight = height - 400;


export default function EnrollScreen() {
  const enroll = useContext(EnrollContext)
  const route: any = useRoute();
  const { course } = route.params;
  const navigation: any = useNavigation();
  const [isEnrolled, setIsEnrolled] = useState(false);

  let tkn;
  let headers: any;
  const handleEnroll: any = async () => {
    if (isEnrolled) {
      navigation.navigate('ModuleScreen', { course });
    }
    else {
      try{        
        tkn = await SecureStore.getItemAsync("jwtToken");
        if (tkn) {
          headers = { 'auth-token': tkn }
        }
        const enrollThisCourse = async () => {
          const res = await axios.put(`http://${api}/api/enroll/${course.name}`, {}, { headers });
          if(res.data.message === 'Enrolled')
          {
            enroll.setEnroll(course.name)
            console.log("Enroll Screen : ", enroll.enroll)
            navigation.navigate('ModuleScreen', { course });
          }
        }
        enrollThisCourse();
      }
      catch(err)
      {
        console.log("Error enrolling : ", err);
      }
    }
  };

  useEffect(() => {
    let headers: any;
    const checkEnrollment = async () => {
      tkn = await SecureStore.getItemAsync("jwtToken");
      if (tkn) {
        headers = { 'auth-token': tkn };
      };
      const res = (await (axios.get(`http://${api}/api/enrolled`, { headers }))).data
      setIsEnrolled(res.map((item: any) => item.name).includes(course.name));
    }
    checkEnrollment()
  },[tkn, headers])
  const color = useContext(ColorContext);

  return (
    <View style={[styles.container, color.mode === 'dark' && {backgroundColor: Colors.BLACK}]}>
      <View style={[styles.cardContainer, color.mode === 'dark' && {backgroundColor: Colors.GRAY}]}>
        <View style={{ paddingBottom: 20 }}>
          <Image source={{uri:`http://${api}/api/getFile/${course.image}`}} style={styles.cardImage} />
        </View>
        <View style={{ width: '100%', borderTopWidth: 1, borderColor: Colors.BLACK, alignItems: 'center' }}>
          <Text style={styles.cardTitle}>{course.name}</Text>
          <Text style={styles.cardDescription}>JavaScript courses cover variables, data types, functions, control flow, DOM manipulation, event handling,. You will learn how to write JavaScript code and frameworks.</Text>
          <TouchableOpacity style={styles.enrollButton} onPress={() => handleEnroll()}>
            {isEnrolled ? (
              <Text style={styles.enrollButtonText}>View Course</Text>
            ) : (
              <Text style={styles.enrollButtonText}>Enroll Free</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: Colors.LIGHT_BLUE
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: Colors.BLACK,
    backgroundColor: Colors.LIGHT_GREEN,
    borderRadius: 10,
    width: cardWidth,
    height: cardHeight,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontFamily: 'outfit-semibold',
    marginTop: 20,
    textAlign: 'center',
    color: Colors.BLACK,
    fontSize:20
  },
  cardDescription: {
    textAlign: 'center',
    color: Colors.BLACK,
  },
  enrollButton: {
    backgroundColor: Colors.Yellow_Light,
    borderWidth: 1,
    borderRadius: 5,
    width: 100,
    margin: 20,
    padding: 5,
  },
  enrollButtonText: {
    textAlign: 'center',
  },
});
