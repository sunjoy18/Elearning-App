import React, { useEffect, useState, useContext, useLayoutEffect } from 'react'
import Colors from '../../assets/utils/Colors';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { ColorContext } from '../context/ColorContext';
import * as SecureStore from 'expo-secure-store';
import { HOST as api } from '@env';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const cardColors: any = ['#A7F0A4', '#FFB6C9', '#FFF293', '#C3C0FF', '#CAFAFF', '#FFECEC', '#FFF1DE', '#B9EFE5']

const { width } = Dimensions.get('window');
const itemWidth = (width - 50) / 2;

const UnitScreen = () => {
    const [unitStatus, setUnitStatus] = useState<any>({});
    const [chapterStatus, setChapterStatus] = useState<any>({});
    const [unitsStatus, setUnitsStatus] = useState<any>({});
    const [chaptersStatus, setChaptersStatus] = useState<any>({});
    const [modulesStatus, setModulesStatus] = useState<any>({});

    // Count the number of true values
    const trueCount = Object.values(unitsStatus).filter(status => status === true).length;
    console.log("Count of true values: ", trueCount);

    const route: any = useRoute();
    const { course, thisModule, unitDataWithStatus, CourseName } = route.params;
    let moduleUnits = thisModule.units;
    console.log('moduleUnits : ',thisModule.units)
    console.log('1 : ', CourseName)
    console.log('2 : ', thisModule.name)
    console.log('unitDataWithStatus', unitDataWithStatus)

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');


    const showModal = (message: string) => {
        setModalMessage(message);
        setModalVisible(true);
    };

    const fetchData = async () => {
        let tkn = await SecureStore.getItemAsync("jwtToken");
        let headers = {};
        if (tkn) {
            headers = { 'auth-token': tkn };
        }

        try {
            const completeResponse = await axios.get(`http://${api}/api/complete/status`, { headers });
            completeResponse.data.forEach((course: any) => {
                
                console.log("Function calledddddddddddddddddddddddddd", course.courseName);
                if (course.courseName === CourseName) {
                    let mod = course.modules.filter((module: any) => {
                        return module.moduleName === thisModule.name;
                    })

                    if (mod) {
                        console.log("mmmmmmmmmmmmmmmmmmmm: ", mod)
                        mod[0].units.forEach((unit: any) => {
                            setUnitsStatus((prevUnitStatus: any) => ({
                                ...prevUnitStatus,
                                [unit.unitName]: unit.completed,
                            }));
                        })
                        console.log("aaaaaaaaaaaaaaaaaaaa", unitsStatus);
                    }
                }

                const { courseName, modules } = course;
                setModulesStatus((prevModuleStatus: any) => ({
                    ...prevModuleStatus,
                    [courseName]: { ...modules, modules },
                }));
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useLayoutEffect(() => {
        
        const unsubscribe = navigation.addListener('focus', () => {
            fetchData();
          });
      
          return () => {
            unsubscribe();
          };
    }, []);

    const navigation: any = useNavigation();
    const viewUnit = (unitName: any) => {
        let thisUnit: any;
        for (let i = 0; i < moduleUnits.length; i++) {

            if (moduleUnits[i].name === unitName) {
                thisUnit = moduleUnits[i];;
            }
        }
        // console.log('passing unit data : ', thisUnit)
        navigation.navigate("CourseDetails", { course, thisModule, thisUnit, chapterDataWithStatus: chapterStatus[unitName] })
    }

    const color = useContext(ColorContext);
    return (
        <ScrollView style={[styles.container]}>
            {/* <Text style={[styles.headerText, color.mode === 'dark' && styles.darkheaderText,]}>Modules &#x3E; Units &#x3E;</Text> */}
            {/* <Text style={[styles.headerText, color.mode === 'dark' && styles.darkheaderText,]}>{thisModule.name}</Text> */}


            <View style={styles.categoryContainer}>
                <Text style={[styles.headerText]}>{thisModule.name}</Text>

                {moduleUnits.map((unit: any, index: any) => (
                    <TouchableOpacity
                        key={unit.name}
                        style={[styles.categoryView, { backgroundColor: cardColors[index] }]}
                        // onPress={() => viewUnit(unit.name)}
                        onPress={() => {
                            if (unitsStatus[unit.name] || index === 0 || index === trueCount) {
                                // Navigate to the unlocked chapter or perform desired action
                                viewUnit(unit.name)
                            } else {
                                // Display a message or perform an action for locked units
                                showModal('This unit is locked. Complete previous Unit to Unlock it.');
                            }
                        }}
                    >
                        {/* <View style={{ backgroundColor: Colors.PRIMARY, borderRadius: 50, height: 40, aspectRatio: 1/1}}>
                            <Text style={[styles.categoryText, color.mode === 'dark' && styles.darkcategoryText]}>{index + 1}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderColor: color.mode === 'dark' ? Colors.WHITE : Colors.BLACK}}>
                        <Text style={[styles.unitText , color.mode === 'dark' && styles.darkcategoryText]}>Unit 1.{index + 1}</Text>

                        </View>
                        <Text style={[styles.subTitle, color.mode === 'dark' && styles.darksubTitle,]}>{unit.name}?</Text> */}

                        {
                            unitsStatus != null && (index === 0 || unitsStatus[unit.name] || index === trueCount) ? (
                                <>
                                    <View style={{ padding: 10, marginTop: 40 }}>
                                        <Text style={[styles.subTitle, color.mode === 'dark' && styles.darksubTitle, { fontWeight: '500', fontFamily: '' }]}>Unit 1.{index + 1}</Text>
                                    </View>
                                    <View style={{ backgroundColor: 'white', width: width - 25, height: '60%', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 10 }}>
                                        <Text style={[styles.subTitle, color.mode === 'dark' && styles.darksubTitle, { fontSize: 20, marginTop: 25, fontFamily: '' }]}>{unit.name} ?</Text>
                                    </View>
                                </>
                            ) : (
                                <View >
                                    <View style={{ padding: 10, marginTop: 40 }}>
                                        <Text style={[styles.subTitle, color.mode === 'dark' && styles.darksubTitle, { fontWeight: '500', fontFamily: '' }]}>Unit 1.{index + 1} 🔒</Text>
                                        {/* <MaterialIcons  name="lock-outline" size={32} /> */}
                                    </View>
                                    <View style={{ backgroundColor: 'white', width: width - 25, height: '60%', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 10 }}>
                                        <Text style={[styles.subTitle, color.mode === 'dark' && styles.darksubTitle, { fontSize: 20, marginTop: 25, fontFamily: '' }]}>{unit.name} ?</Text>
                                    </View>
                                </View>
                            )
                        }

                    </TouchableOpacity>
                ))}
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, color.mode === 'dark' && { backgroundColor: Colors.GRAY }]}>
                        <Text style={{ marginBottom: 20 }}>📕📒📗</Text>
                        <Text style={[styles.modalText, color.mode === 'dark' && { color: Colors.WHITE }]}>{modalMessage}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButton}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}

export default UnitScreen


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.LIGHT_BLUE
    },
    darkcontainer: {
        // backgroundColor: Colors.BLACK
    },
    headerText: {
        fontFamily: '',
        fontSize: 20,
        padding: 10,
        // padding: 20,
        // borderBottomWidth: 2,
        // borderColor: Colors.BLACK,
        width: '100%'
    },
    darkheaderText: {
        borderColor: Colors.WHITE,
        color: Colors.WHITE
    },
    subTitle: {
        // textAlign: 'center',

        color: Colors.Red_Light,
        fontFamily: '',
        fontSize: 20
    },
    darksubTitle: {
        color: Colors.WHITE
    },
    unitText: {
        fontSize: 120
    },
    categoryContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 10,
    },
    categoryView: {
        justifyContent: 'space-between',
        width: width - 25,
        height: 170,
        marginVertical: 10,
        marginTop: 30,
        borderRadius: 20,
        // Add box-shadow and border styles
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.,
        shadowRadius: 3.84,
        elevation: 5,
        borderColor: Colors.GRAY,
    },

    darkcategoryView: {
        backgroundColor: Colors.GRAY,
        borderColor: Colors.LIGHT_PRIMARY
    },
    categoryText: {
        fontFamily: '',
        fontSize: 15,
        textAlign: 'center',
        paddingTop: 10,

    },
    darkcategoryText: {
        color: Colors.WHITE
    },
    categoryImage: {
        width: '50%',
        height: '50%',
        marginTop: 10,
    },
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
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: 'red'
    },
    modalButton: {
        fontSize: 16,
        color: Colors.Green_Light,
        fontWeight: 'bold',
    },
    darkmodalButton: {},
});
