import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { ProgressBar } from 'react-native-paper';
import Colors from '../../assets/utils/Colors'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { HOST as api } from '@env';
import { EnrollContext } from '../context/EnrollContext';
import { ChapterCompleteContext } from '../context/ChapterCompleteContext';

const { width } = Dimensions.get('window');
const itemWidth = (width - 20);

const cardColors: any = ['#FFDD95', '#C2BAFF', '#9BE5AC', '#E3B5CD']

let colorIndex = 0;
const len = cardColors.length;
// 
const getRandomColor = () => {
  if (colorIndex >= len) {
    colorIndex = 0
  }
  const color = cardColors[colorIndex];
  colorIndex = colorIndex + 1
  return color;
};



export default function EnrolledScreen() {
  let tkn;
  const enroll = useContext(EnrollContext);
  const complete = useContext(ChapterCompleteContext)



  // Create an state object to store course information
  const [courseStatus, setCourseStatus] = useState<any>({});
  const [enrolledCourseWithData, setEnrolledCourseWithData] = useState<any>([]);
  const [moduleStatus, setModuleStatus] = useState<any>({});
  const [chapsCompleted, setChapsCompleted] = useState<any>({});
  const [totalChapter, setTotalChapter] = useState<any>({});

  useEffect(() => {
    colorIndex = 0
    let headers: any;
    const fetchData = async () => {
      tkn = await SecureStore.getItemAsync("jwtToken");
      if (tkn) {
        headers = { 'auth-token': tkn };
      };
      try {
        const [enrolledResponse, coursesResponse, completeResponse] = await Promise.all([
          axios.get(`http://${api}/api/enrolled`, { headers }),
          axios.get(`http://${api}/api/getCourses`),
          axios.get(`http://${api}/api/complete/status`, { headers }),
        ]);
        setEnrolledCourseWithData(
          coursesResponse.data.filter((course: any) =>
            enrolledResponse.data.some((enrolled: any) => enrolled.name === course.name)
          )
        );
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
        // console.log('courseStatus : ', courseStatus)
        // console.log('moduleStatus : ', moduleStatus)
      } catch (error) {
        console.error("Error fetching Data:", error);
      }
    };
    fetchData();
  }, [enroll.enroll, complete.chapterComplete ]);

  useEffect(() => {
    colorIndex = 0
    const fetchCompletion = () => {
      const updateChapsCompleted = (courseName: any, count: any) => {
        // Updating object with dynamic key
        setChapsCompleted((prevState: any) => ({
          ...prevState,
          [courseName]: count
        }));
      };

      const updateTotalCount = (courseName: any, count: any) => {
        // Updating object with dynamic key
        setTotalChapter((prevState: any) => ({
          ...prevState,
          [courseName]: count
        }));
      };

      try {
        // Function to calculate the sum of true values inside the chapters array for a unit
        const sumOfTrueValuesInUnit = (unit: any) => {
          return unit.chapters.reduce((count: any, chapter: any) => count + (chapter.completed === true), 0);
        };
        // Function to calculate the sum of true values inside the units array for a module
        const sumOfTrueValuesInModule = (module: any) => {
          return module.units.reduce((count: any, unit: any) => count + sumOfTrueValuesInUnit(unit), 0);
        };
        // Iterate over modules and calculate the sum of true values for each module and each unit
        const moduleSums: any = {};

        let count = 0;
        enrolledCourseWithData.map((course: any) => (
          Object.entries(moduleStatus[course.name]).forEach(([key, value]: any) => {
            if (key !== "modules") {
              moduleSums[value.moduleName] = sumOfTrueValuesInModule(value);
              count = count + sumOfTrueValuesInModule(value);
              updateChapsCompleted(course.name, count);
              console.log(moduleSums)              
            }
          })
        ));

        // Function to calculate the count of chapters in a unit
        const countChaptersInUnit = (unit: any) => {
          return unit.chapters.length;
        }
        // Function to calculate the count of chapters in a module
        const countChaptersInModule = (module: any) => module.units.reduce((count: any, unit: any) => count + countChaptersInUnit(unit), 0);
        // Calculate the count of chapters in the 'Python Advance' course

        let chapterCount: any = 0;
        enrolledCourseWithData.map((course: any) => (
          Object.entries(moduleStatus[course.name]).forEach(([key, value]) => {
            // if (key !== "modules") {
              chapterCount = chapterCount + countChaptersInModule(value);
              totalChapter[course.name] = chapterCount
              updateTotalCount(course.name, chapterCount);
            // }
          })
        ));
      } catch (error) {
        console.log("Fetch Error:", error)
      }
    };
    fetchCompletion();
  }, [courseStatus, enrolledCourseWithData, enroll.enroll]);

  console.log('chapCompleted : ', chapsCompleted)
  console.log('Total chapters: ', totalChapter);

  let [percentage, setPercentage] = useState<any>({});

  useEffect(() => {
    enrolledCourseWithData.forEach((course: any) => {
      setPercentage((prevState: any) => ({
        ...prevState,
        [course.name]: (chapsCompleted[course.name] / totalChapter[course.name])
      }));
    });

  }, [chapsCompleted, totalChapter]);

  useEffect(() => {
    console.log('percentage : ', percentage['Python Basics']);
  }, [percentage]);



  const navigation: any = useNavigation();
  const viewModule = (course: any) => {
    navigation.navigate("ModuleScreen", { course, moduleDataWithStatus: moduleStatus[course.name], CourseName: course.name });

  };

  // const color = useContext(ColorContext);
  return (
    <ScrollView style={[styles.container]}>
      {/* <View style={styles.centeredContainer}> */}
      <View style={styles.categoriesContainer}>
        <Text style={[styles.categoriesText]}>Enrolled Courses</Text>
      </View>
      <View style={styles.categoryContainer}>
        {enrolledCourseWithData.map((course: any, index: any) => (
          <TouchableOpacity
            key={index}
            style={[styles.categoryView, { backgroundColor: getRandomColor() }]}
            onPress={() => viewModule(course)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: `http://${api}/api/getFile/${course.image}` }} style={styles.categoryImage} alt={course.image} />
              <View style={{ marginLeft: 10, flex: 1, marginTop:20 }}>
                <Text style={[styles.categoryText]}>{course.name}</Text>
                <View style={styles.progressBarContainer}>
                  {percentage[course.name] > 0 ? (
                    <>
                      <ProgressBar
                        // progress={totalChapter[course.name] == 1 ? 0 : chapsCompleted[course.name] / totalChapter[course.name]}
                        progress={percentage[course.name] != null ? percentage[course.name] : 0.0}
                        theme={{ colors: { primary: 'green' } }}
                        style={styles.progressBar}
                      />
                      <Text style={[styles.progressText]}>{totalChapter[course.name] == 1 ? `0%` : `${Math.floor((chapsCompleted[course.name] / totalChapter[course.name]) * 100)}%`}</Text>
                    </>
                  ) : (
                    <>
                      <ProgressBar
                        progress={0.0}
                        theme={{ colors: { primary: 'green' } }}
                        style={styles.progressBar}
                      />
                      <Text style={[styles.progressText]}>{`${Math.floor(0.0 * 100)}%`}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* </View> */}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesContainer: {
    display: 'flex',
    flexDirection: 'column',
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
  darkcontainer: {
    backgroundColor: Colors.BLACK,
  },
  centeredContainer: {
    alignItems: 'center',
  },
  darkcenteredContainer: {
    backgroundColor: Colors.BLACK
  },
  headerText: {
    fontFamily: 'outfit-semibold',
    fontSize: 200,
    textAlign: 'center',
    padding: 20,
    borderBottomWidth: 2,

    borderRadius: 20,
    width: '100%'
  },
  darkheaderText: {
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
    // borderWidth: 1,
    width: itemWidth,
    borderRadius: 10,
    marginVertical: 12,
    height: 100,
    marginLeft: 0
    // backgroundColor: Colors.LIGHT_YELLOW,
  },
  darkcategoryView: {
    // borderColor: Colors.WHITE
  },
  categoryText: {
    fontFamily: 'outfit-regular',
    textAlign: 'center',
    fontSize:20
  },
  darkcategoryText: {
    // color: Colors.WHITE
  },
  categoryImage: {
    width: '30%',
    height: '90%',
    marginTop: 20,
    marginLeft: 0,
    resizeMode: 'contain',
    alignItems: "center"
  },
  progressBarContainer: {
    flexDirection: 'column',
    // width: '95%'
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  progressBar: {
    marginTop: 10,
    width: '90%'
  },
  progressText: {
    marginTop: 5,
    fontSize: 15,
    textAlign: 'center'
  },
  darkprogressText: {
    // color: Colors.WHITE
  }
});
