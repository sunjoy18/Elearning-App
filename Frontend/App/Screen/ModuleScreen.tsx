import React, { useState, useLayoutEffect } from 'react'
import Colors from '../../assets/utils/Colors';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { HOST as api } from '@env';

const cardColors: any = ['#A7F0A4', '#FFB6C9', '#FFF293', '#C3C0FF', '#CAFAFF', '#FFECEC', '#FFF1DE', '#B9EFE5']
const bgColor: any = ['#95E893', '#FFA6BB', '#FFEE56', '#B4AEFF', '#A4F1FB', '#FFD2D4', '#FFE2B7', '#6DD7C6']
const { width } = Dimensions.get('window');
const itemWidth = (width - 50) / 2;

const ModuleScreen = () => {
    const [moduleStatus, setModuleStatus] = useState<any>({});

    const trueCount = Object.values(moduleStatus).filter(status => status === true).length;

    const route: any = useRoute();
    const { course, moduleDataWithStatus, CourseName } = route.params;
    let courseModules = course.modules;

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
                if (course.courseName === CourseName) {                    
                    
                        console.log(course.courseName);
                                            
                    course.modules.forEach((mod: any) => {
                        setModuleStatus((prevModuleStatus: any) => ({
                            ...prevModuleStatus,
                            [mod.moduleName]: mod.completed,
                        }));
                    });
                }
            })
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    useLayoutEffect(() => {
        
        const reRender = navigation.addListener('focus',() => {
            // fetchCompletion();
            fetchData();
        })

        return () => {
            reRender();
        }
    }, []);

    const navigation: any = useNavigation();
    const viewUnit = (moduleName: any) => {
        let thisModule: any;
        for (let i = 0; i < courseModules.length; i++) {

            if (courseModules[i].name === moduleName) {
                thisModule = courseModules[i];;
            }
        }
        navigation.navigate("UnitScreen", { course, thisModule, CourseName: CourseName })
    }

    return (
        <ScrollView style={[styles.container]}>
            <View style={styles.categoryContainer}>
                <Text style={[styles.headerText]}>{course.name}</Text>
                {courseModules.map((module: any, index: any) => (
                    <TouchableOpacity key={module.name}
                        style={[styles.categoryView, { backgroundColor: cardColors[index] }]}
                        onPress={() => {
                            if (moduleStatus[module.name] || index === 0 || index === trueCount) {
                                // Navigate to the unlocked unit or perform desired action
                                viewUnit(module.name)
                            } else {
                                // Display a message or perform an action for locked modules
                                showModal('This module is locked. Unlock it to access.');
                            }
                        }}
                    >
                        {
                            index === 0 || moduleStatus[module.name] || index === trueCount ? (
                                <>
                                    <View style={{ height: '60%', display: 'flex', alignSelf: 'baseline' }}>
                                        <View style={{ marginTop: '25%', marginLeft: '0%', backgroundColor: bgColor[index], width: 70, height: 50, borderTopRightRadius: 10 }}>
                                            <Text style={[styles.subTitle, { textAlign: 'center', fontFamily: '', fontSize: 20 }]}>{index + 1}</Text>
                                        </View>
                                    </View>
                                    <View style={{ backgroundColor: 'white', width: '100%', height: '40%', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}>
                                        <Text style={[styles.subTitle]}>{module.name}</Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={{ height: '60%', display: 'flex', alignSelf: 'baseline' }}>
                                        <View style={{ marginTop: '25%', marginLeft: '0%', backgroundColor: bgColor[index], width: 70, height: 50, borderTopRightRadius: 10 }}>
                                            <Text style={[styles.subTitle, { textAlign: 'center', fontFamily: '', fontSize: 20 }]}>{index + 1}🔒</Text>
                                        </View>
                                    </View>
                                    <View style={{ backgroundColor: 'white', width: '100%', height: '40%', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}>
                                        <Text style={[styles.subTitle]}>{module.name}</Text>
                                    </View>
                                </>
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
                    <View style={[styles.modalContent]}>
                        <Text style={{ marginBottom: 20 }}>📕📒📗</Text>
                        <Text style={[styles.modalText]}>{modalMessage}</Text>
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

export default ModuleScreen


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.LIGHT_BLUE
    },
    darkcontainer: {
        backgroundColor: Colors.BLACK,
    },
    headerText: {
        fontFamily: 'outfit-semibold',
        fontSize: 20,
        padding: 10,
        width: '100%'
    },
    darkheaderText: {
        borderColor: Colors.WHITE,
        color: Colors.WHITE
    },

    courseTitle: {
        fontSize: 20,
        color: Colors.BLACK,
        flexWrap: 'wrap',
    },
    darkcourseTitle: {
        color: Colors.WHITE
    },
    subTitle: {
        // textAlign: 'center',
        margin: 3,
        fontSize: 15,
        color: Colors.BLACK,
        padding: 2,
        fontFamily: '',
    },
    darksubTitle: {
        color: Colors.WHITE
    },

    categoryContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 10,
    },
    categoryView: {
        backgroundColor: Colors.WHITE,
        alignItems: 'center',
        // justifyContent: 'space-between',
        width: itemWidth,
        height: 140,
        borderRadius: 10,
        marginVertical: 10,
        // Add box-shadow and border styles
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderColor: Colors.GRAY, // You can replace with the color you want
    },

    darkcategoryView: {
        backgroundColor: Colors.GRAY,
        borderColor: Colors.LIGHT_PRIMARY
    },
    categoryText: {
        fontFamily: 'outfit-regular',
        fontSize: 18,
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
    label: {
        fontSize: 17,
        marginRight: 10,
    },
    darktextColor: {
        color: Colors.WHITE,
        fontSize: 30
    },

});
