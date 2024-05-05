import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../assets/utils/Colors';
import mainIcon from '../../assets/images/man1.png';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import EnrolledScreen from './EnrolledScreen';

import { EnrollContext } from '../context/EnrollContext';

import { HOST as api } from '@env';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const itemWidth = (width - 50) / 2;

const HomeScreen: React.FC = () => {
    const navigation: any = useNavigation();
    const [courseStatus, setCourseStatus] = useState<any>({});
    const [moduleStatus, setModuleStatus] = useState<any>({});

    const enroll = useContext(EnrollContext);

    const handleCategoryPress = (course: any) => {
        navigation.navigate("ModuleScreen", { course, moduleDataWithStatus: moduleStatus[course.name] });

    };

    const [isSearchClicked, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [courses, setCourses] = useState<any>([]);
    const [user, setUser] = useState<any>('');

    useEffect(() => {
        let headers: any;

        const fetchData = async () => {
            tkn = await SecureStore.getItemAsync("jwtToken");
            if (tkn) {
                headers = { 'auth-token': tkn };
            };
            try {
                const [completeResponse] = await Promise.all([
                    axios.get(`http://${api}/api/complete/status`, { headers }),
                ]);
                completeResponse.data.forEach((course: any) => {
                    const { courseName, completed, modules } = course;
                    // Update the courseStatus state with the new course information
                    setCourseStatus((prevCourseStatus: any) => ({
                        ...prevCourseStatus,
                        [courseName]: completed,
                    }));
                    setModuleStatus((prevModuleStatus: any) => ({
                        ...prevModuleStatus,
                        [courseName]: { ...modules, modules },
                    }))
                });
            } catch (error) {
                console.error("Error fetching Data:", error);
            }
        };
        fetchData();
    }, [enroll.enroll]);

    const showSearch = () => {
        setSearchVisible(true);
    }

    const notshowSearch = () => {
        setSearchVisible(false);
    }

    // Filter courses based on search text
    const filteredCourses = courses.filter((course: any) =>
        course.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const checkLogin = async () => {
        let tkn = await SecureStore.getItemAsync('jwtToken');

        if (!tkn) {
            navigation.navigate('LoginScreen'); // For React Navigation 6.x or later
        };
    };

    let tkn;
    let headers: any;

    const getCourses = async () => {
        tkn = await SecureStore.getItemAsync("jwtToken");
        if (tkn) {
            headers = { 'auth-token': tkn }
        };
        const [enrolledResponse, coursesResponse] = await Promise.all([
            axios.get(`http://${api}/api/enrolled`, { headers }),
            axios.get(`http://${api}/api/getCourses`)
        ]);
        setCourses(
            coursesResponse.data.filter((course: any) =>
                enrolledResponse.data.some((enrolled: any) => enrolled.name === course.name)
            )
        );
    };



    const getUser = async () => {
        tkn = await SecureStore.getItemAsync("jwtToken");
        if (tkn) {
            headers = { 'auth-token': tkn }
        };
        const response = await axios.get(`http://${api}/api/getUser`, { headers });
        setUser(response.data);
    };

    useEffect(() => {
        checkLogin();
        getCourses();
        getUser();
    }, []);

    return (
        <ScrollView style={[styles.container]}>
            <View>

                <View style={styles.mainContainer}>
                    <View>
                        <LinearGradient
                            colors={['#FFD700', '#B8860B']} // Gold color codes
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '100%',
                                backgroundColor: Colors.GOLD,
                                borderRadius: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                padding: 5
                            }}
                        >
                            {/* <View style={[styles.mainView, color.mode === 'dark' && { backgroundColor: Colors.GRAY }]}> */}
                            <Image source={mainIcon} style={styles.mainImage} />
                            <View style={{ flexDirection: 'column' }}>
                                <Text style={[styles.greetingText]}> Hi, {user.name}</Text>
                                <Text style={styles.learnText}>Let's Learn {'\n'} More</Text>
                            </View>
                            {/* </View> */}
                        </LinearGradient>
                    </View>
                </View>

                <View>
                    <View style={{ margin: '-6%', width: '80%', marginLeft: 40, height: 60, borderRadius: 19, borderColor: 'your_border_color', borderWidth: 1, backgroundColor: '#fff' }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '5%' }}>
                            {isSearchClicked && searchText !== '' ? (
                                <MaterialIcons name='cancel' size={25} color={Colors.BLACK} onPress={notshowSearch} />
                            ) : (
                                <MaterialIcons name='search' size={25} color={Colors.BLACK} onPress={showSearch} />
                            )}
                            <TextInput
                                style={{ flex: 1, marginLeft: 10 }}
                                placeholder='Search Course'
                                placeholderTextColor='#800080'
                                value={searchText}
                                onChangeText={(text) => {
                                    setSearchText(text);
                                }}
                                onPressIn={showSearch}
                            />
                        </View>
                    </View>
                    {isSearchClicked ? (
                        <View>
                            {searchText !== '' ? (
                                filteredCourses.length > 0 ? (
                                    <View style={styles.categoryContainer}>
                                        {filteredCourses.map((course: any, index: any) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.categoryView, { backgroundColor: Colors.LIGHT_GRAY }]}
                                                onPress={() => handleCategoryPress(course)}
                                            >
                                                <Text style={[styles.categoryText]}>{course.name}</Text>
                                                <Image source={{ uri: `http://${api}/api/getFile/${course.image}` }} style={styles.categoryImage} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={[{ textAlign: 'center', marginTop: 40 }]}>No Courses Found</Text>
                                )
                            ) :
                                <View style={{ marginTop: 20 }}>
                                    <EnrolledScreen />
                                </View>
                            }
                        </View>
                    ) : (
                        <View style={{ marginTop: 20 }}>
                            <EnrolledScreen />
                        </View>
                    )}
                </View>

            </View>
        </ScrollView>

    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.LIGHT_BLUE,
        ...Platform.select({
            ios: {
                marginTop: 32,
            },
        }),
    },

    darkcontainer: {
        backgroundColor: Colors.BLACK,
    },
    greetingText: {
        fontSize: 30,
        fontFamily: 'outfit-bold',
    },
    darkgreetingText: {
        color: Colors.WHITE
    },
    input: {
        height: 40,
        width: '90%',
        margin: '5%',
        borderWidth: 1,
        padding: 10,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
    },
    mainContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
    },
    mainView: {
        display: 'flex',
        flexDirection: 'row',
        width: '95%',
        backgroundColor: Colors.GOLD,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    mainImage: {
        width: 170,
        height: 170,
    },
    learnText: {
        fontFamily: 'outfit-bold',
        fontSize: 25,
        color: Colors.WHITE,
    },
    categoriesContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 25,
    },
    categoriesText: {
        fontFamily: 'outfit-bold',
        fontSize: 20,
    },
    darkcategoriesText: {
        color: Colors.WHITE
    },
    seeAllText: {
        color: 'blue',
    },
    categoryContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 10,
        marginTop: 30
    },
    categoryView: {
        // borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: itemWidth,
        height: 140,
        borderRadius: 10,
        marginVertical: 12,
    },
    darkcategoryView: {
        // borderColor: Colors.WHITE
    },
    categoryText: {
        fontFamily: 'outfit-regular',
        textAlign: 'center',
    },
    darkcategoryText: {
        // color: Colors.WHITE
    },
    categoryImage: {
        width: '50%',
        height: '50%',
        marginTop: 10,
        resizeMode: 'contain'
    },
});

export default HomeScreen;
