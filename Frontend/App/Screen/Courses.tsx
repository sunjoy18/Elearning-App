import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../assets/utils/Colors';
import student from '../../assets/images/studenttt.png';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ColorContext } from '../context/ColorContext';


import { HOST as api } from '@env';
import { EnrollContext } from '../context/EnrollContext';

const { width } = Dimensions.get('window');
const itemWidth = (width - 50) / 2;

const cardColors: any = ['#FFDD95', '#C2BAFF', '#9BE5AC', '#E3B5CD']

let colorIndex = 0;
const len = cardColors.length;

const getRandomColor = () => {
    if (colorIndex >= len) {
        colorIndex = 0
    }
    const color = cardColors[colorIndex];
    colorIndex = colorIndex + 1
    return color;
};

const CoursesScreen: React.FC = () => {
    const enroll = useContext(EnrollContext);
    const navigation: any = useNavigation();

    const handleCategoryPress = (course: any) => {
        navigation.navigate("EnrollScreen", { course: course });
    };

    const [isSearchClicked, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [courses, setCourses] = useState<any>([]);
    const [user, setUser] = useState<any>('');

    const showSearch = () => {
        setSearchVisible(!isSearchClicked);
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
    // const response = await axios.get('http://${api}/api/getCourses');
    // setCourses(response.data);
    const getCourses = async () => {
        tkn = await SecureStore.getItemAsync("jwtToken");
        if (tkn) {
            headers = { 'auth-token': tkn };
        }
        try {
            const [enrolledResponse, coursesResponse] = await Promise.all([
                axios.get(`http://${api}/api/enrolled`, { headers }),
                axios.get(`http://${api}/api/getCourses`),
            ]);

            // Extract the names of enrolled courses
            const enrolledCourses = enrolledResponse.data.map((enrolled: any) => enrolled.name);

            // Filter out the courses that are not enrolled
            const notEnrolledCourses = coursesResponse.data.filter((course: any) =>
                !enrolledCourses.includes(course.name)
            );

            setCourses(notEnrolledCourses);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };



    let tkn;
    let headers: any;
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
    }, [enroll.enroll]);


    const color = useContext(ColorContext);
    console.log("home : ", color.mode)

    return (
        <ScrollView style={[styles.container, color.mode === 'dark' && styles.darkcontainer,]}>
            <View>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '5%' }}>
                    <Text style={[styles.greetingText, color.mode === 'dark' && styles.darkgreetingText]}>All Courses</Text>
                    <MaterialIcons name='search' size={25} color={color.mode === 'dark' ? Colors.WHITE : Colors.BLACK} onPress={showSearch} />
                </View>
                {isSearchClicked && (
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder='Search Course'
                            value={searchText}
                            onChangeText={(text) => setSearchText(text)}
                        />
                    </View>
                )}
                {
                    searchText !== '' ? (
                        filteredCourses.length > 0 ? (
                            <View style={styles.categoryContainer}>
                                {filteredCourses.map((course: any, index: any) => (
                                    <TouchableOpacity
                                        key={index}                                        
                                        style={[styles.categoryView, { backgroundColor: getRandomColor() }, color.mode === 'dark' && styles.darkcategoryView]}
                                        onPress={() => handleCategoryPress(course)}
                                    >
                                        <Image source={{ uri: `http://${api}/api/getFile/${course.image}` }} style={styles.categoryImage} alt={course.name} />
                                        <Text style={[styles.categoryText, color.mode === 'dark' && styles.darkcategoryText]}>{course.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Text style={{ textAlign: 'center' }}>No Courses Found</Text>
                        )
                    ) : (
                        <>
                            {/* <View style={styles.mainContainer}>
                                <View style={styles.mainView}>
                                    <Image source={student} style={styles.mainImage} />
                                    <Text style={styles.learnText}>Let's Learn {'\n'} More</Text>
                                </View>
                            </View> */}

                            {/* <View style={styles.categoriesContainer}>
                                <Text style={[styles.categoriesText, color.mode === 'dark' && styles.darkcategoriesText]}>Categories</Text>
                            </View> */}

                            <View style={styles.categoryContainer}>
                                {courses.length > 0 ? (
                                    courses.map((course: any, index: any) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.categoryView, { backgroundColor: getRandomColor() }, color.mode === 'dark' && styles.darkcategoryView]}
                                            onPress={() => handleCategoryPress(course)}
                                        >
                                            <Image
                                                source={{ uri: `http://${api}/api/getFile/${course.image}` }}
                                                style={styles.categoryImage}
                                                alt={course.name}
                                            />
                                            <Text style={[styles.categoryText, color.mode === 'dark' && styles.darkcategoryText]}>
                                                {course.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={{ flex: 1 }}>
                                        <Text style={[{ textAlign: 'center' }, color.mode === 'dark' && { color: Colors.WHITE }]}>No More Course Available.</Text>
                                    </View>
                                )}
                            </View>

                        </>
                    )
                }

            </View>
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:Colors.LIGHT_BLUE
    },
    darkcontainer: {
        backgroundColor: Colors.BLACK,
    },
    greetingText: {
        fontSize: 20,
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
    },
    mainView: {
        display: 'flex',
        flexDirection: 'row',
        width: '95%',
        backgroundColor: Colors.PRIMARY,
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
        fontSize: 30,
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
    },
    categoryView: {
        // borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: itemWidth,
        height: 140,
        borderRadius: 20,
        marginVertical: 12,
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
        // borderColor: Colors.WHITE
    },
    categoryText: {
        fontFamily: 'outfit-regular',
        textAlign: 'center',
        fontSize: 15,
        marginTop: 8
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

export default CoursesScreen;