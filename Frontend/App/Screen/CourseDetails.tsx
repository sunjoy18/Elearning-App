import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Dimensions, TouchableOpacity, ActivityIndicator, Alert, Platform, Modal, ViewStyle } from 'react-native';
import Colors from '../../assets/utils/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import * as IntentLauncher from 'expo-intent-launcher';
import { ColorContext } from '../context/ColorContext';
import { AntDesign } from '@expo/vector-icons';
import { HOST as api } from '@env';
const { width, height } = Dimensions.get('window');
const itemWidth = (width - 50) / 2;
import WebView from 'react-native-webview';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Fire from '../../assets/fire.gif';

import { ChapterCompleteContext } from '../context/ChapterCompleteContext';

const CourseDetailsScreen: React.FC = () => {
  let tkn;
  let headers: any;
  const route: any = useRoute();
  const { course, thisModule, thisUnit } = route.params;


  let unitsChapter = thisUnit.chapters;
  const indexOfUnit = thisModule.units.findIndex((unit: any) => unit.name === thisUnit.name);
  const [completedChapters, setCompletedChapters] = useState<any>([]);
  const [completed, setCompleted] = useState<any>(false);
  const [chapterStatus, setChapterStatus] = useState<any>({});
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [score, setScore] = useState<any>({});
  const [quizCompleted, setQuizCompleted] = useState<any>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // Initialize visibility states based on the selected chapter
  const [isVideoVisible, setVideoVisible] = useState(true);
  const [isNotesVisible, setNotesVisible] = useState(false);
  const [isQuizVisible, setQuizVisible] = useState(false);

  // Add state to track the selected option
  const [selectedOption, setSelectedOption] = useState<any>("");
  const [link, setLink] = useState<any>("");


  const color = useContext(ColorContext);
  const complete = useContext(ChapterCompleteContext)


  const cardColors: any = [Colors.QUIZ1, Colors.QUIZ2, Colors.QUIZ3]
  const [randomColor, setRandomColor] = useState<any>("");

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


  useEffect(() => {
    const getStatus = async () => {
      tkn = await SecureStore.getItemAsync("jwtToken");
      if (tkn) {
        headers = { 'auth-token': tkn }
      }
      const res = await axios.get(`http://${api}/api/complete/status`, { headers });
      let cothis = res.data.filter((c: any) => (c.courseName === course.name));
      let mthis = cothis[0].modules.filter((m: any) => m.moduleName === thisModule.name);
      let uthis = mthis[0].units.filter((u: any) => (u.unitName === thisUnit.name));


      uthis[0].chapters.forEach((chap: any) => {
        const { completed, chapterName, } = chap;
        // Update the chapterStatus state with the unit data and completion status
        setChapterStatus((prevChapterStatus: any) => ({
          ...prevChapterStatus,
          [chapterName]: completed,
        }));
      });
    };
    getStatus();

    const fetchData = async () => {
      try {
        const storedNotes = await SecureStore.getItemAsync('downloadedNotes');
        if (storedNotes) {
          // Parse the storedNotes if necessary (it might be in JSON format)
          const parsedNotes = JSON.parse(storedNotes);
          setDownloadedNotes(parsedNotes);
        }
      } catch (error) {
        console.error('Error fetching downloaded notes:', error);
      }
    };


    fetchData();
  }, []);

  useEffect(() => {

    for (let i = 0; i < completedChapters.length; i++) {
      const element = completedChapters[i];
      if (element) {
        chapterContents.videos.map((video: any) => {
          setLink(video.url);
        })
      }
    }
  }, [completedChapters])


  useEffect(() => {
    // Update completedChapters when chapterStatus changes
    setCompletedChapters(unitsChapter.map((chapter: any) => chapterStatus[chapter.name]));
  }, [chapterStatus, unitsChapter]);


  const normalizeAnswer = (answer: any): string => {
    return answer.replace(/\s/g, '').toLowerCase()
  };


  const handleAnswer = (selectedAnswer: any) => {
    if (!quizCompleted[selectedChapter]) {
      let updatedScore = { ...score };
      const selectedAnswerNormalized = normalizeAnswer(selectedAnswer);
      const correctAnswerNormalized = normalizeAnswer(
        chapterContents.quiz.questions[currentQuestion].correctAnswer
      );


      if (selectedAnswerNormalized === correctAnswerNormalized) {
        updatedScore[selectedChapter] = (updatedScore[selectedChapter] || 0) + 1;

        setSelectedOption(selectedAnswer);

        setTimeout(() => {
          setSelectedOption("");
        }, 1300);
      }
      else {
        setSelectedOption(selectedAnswer);

        setTimeout(() => {
          setSelectedOption("");
        }, 2000);
      }
      if (currentQuestion < chapterContents.quiz.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
        }, 1500);
      } else {
        setTimeout(() => {
          setQuizCompleted((prev: any) => ({ ...prev, [selectedChapter]: true }));
        }, 1500);
        // Check if the user meets the minimum answer requirement
        if (updatedScore[selectedChapter] >= unitsChapter[selectedChapter].minAnswer) {
          if (selectedChapter < completedChapters.length - 1) {
            complete.setChapterComplete(unitsChapter[selectedChapter])
            setCompletedChapters((prevChapters: any) => {
              const updatedChapters = [...prevChapters];
              updatedChapters[selectedChapter + 1] = true;
              return updatedChapters;
            });
          }



          async function setModuleCompleted() {
            tkn = await SecureStore.getItemAsync("jwtToken");
            if (tkn) {
              headers = { 'auth-token': tkn }
            }
            try {
              const res = await axios.put(`http://${api}/api/complete/module/${course.name}/${thisModule.name}`, {}, { headers: headers })
            } catch (error) {
              console.log("Error marking module as complete : ", error)
            }
          }


          async function setUnitCompleted() {
            tkn = await SecureStore.getItemAsync("jwtToken");
            if (tkn) {
              headers = { 'auth-token': tkn }
            }
            try {
              const res = await axios.put(`http://${api}/api/complete/unit/${course.name}/${thisModule.name}/${thisUnit.name}`, {}, { headers: headers })
            } catch (error) {
              console.log("Error marking unit as complete : ", error)
            }
          }
          if (selectedChapter === unitsChapter.length - 1) {
            setUnitCompleted();
          }

          if ((indexOfUnit === (thisModule.units.length - 1)) && (selectedChapter === unitsChapter.length - 1)) {
            setModuleCompleted();
          }

          const currentScore = updatedScore[selectedChapter] || 0;

          async function setCompletedChapter() {
            tkn = await SecureStore.getItemAsync("jwtToken");
            if (tkn) {
              headers = { 'auth-token': tkn }
            }
            try {
              const res = await axios.put(`http://${api}/api/complete/chapter/${course.name}/${thisModule.name}/${thisUnit.name}/${unitsChapter[selectedChapter + 1].name}`, {}, { headers: headers })
            } catch (error) {
              console.log("Error setting chapter complete : ", error)
            }
          }
          setCompletedChapter();
          showModal(`Quiz completed for ${course.name}, Chapter ${selectedChapter + 1}! Your score: ${currentScore}/${chapterContents.quiz.questions.length}`);
          setCompleted(true);
        } else {
          showModal(`You need to answer at least ${unitsChapter[selectedChapter].minAnswer} question correctly to unlock the next chapter.`);
          setCompleted(false);
        }

        setCurrentQuestion(0);
      }
      setScore(updatedScore);
    }
  };


  const handleReattempt = () => {
    setQuizCompleted((prev: any) => ({ ...prev, [selectedChapter]: false }));
    setCurrentQuestion(0);
    setScore(0);
  }


  const handleChapterPress = (chapterName: any, index: any) => {
    if (completedChapters[index] || index === 0) {
      setSelectedChapter(index);
      for (let i = 0; i < unitsChapter.length; i++) {
        if (unitsChapter[i].name === chapterName) {
          setChapterContents(unitsChapter[i].contents);
        }
      }
    } else {
      showModal("This chapter is locked. Complete the previous chapter first.");
    }
  }

  const [chapterContents, setChapterContents] = useState(
    {
      videos: unitsChapter[0].contents.videos || [],
      notes: unitsChapter[0].contents.notes || [],
      quiz: unitsChapter[0].contents.quiz || [],
    }
  );

  const toggleVideo = () => {
    setVideoVisible(!isVideoVisible);
    setNotesVisible(false);
    setQuizVisible(false);
    // setvideoclick(false)
  };

  const toggleNotes = () => {
    setNotesVisible(!isNotesVisible);
    setVideoVisible(false);
    setQuizVisible(false);
  };

  const toggleQuiz = () => {
    setQuizVisible(!isQuizVisible);
    setVideoVisible(false);
    setNotesVisible(false);
    setvideoclick(false)
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const openDownloadedPdf = async (fileUri: string) => {
    try {
      setIsLoading(true);
      const fileExists = await FileSystem.getInfoAsync(fileUri);

      if (fileExists.exists) {
        if (Platform.OS === 'ios') {
        } else if (Platform.OS === 'android') {
          const contentUri = await FileSystem.getContentUriAsync(fileUri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
          });
        }
      } else {
        showModal("PDF file is not downloaded.")
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      });
    }
  };


  const [downloadedNotes, setDownloadedNotes] = useState<string[]>([]);

  const downloadPdf = async (pdfUrl: string, pdfName: string) => {
    setIsLoading(true);
    const downloadResumable = FileSystem.createDownloadResumable(
      pdfUrl, `${FileSystem.documentDirectory}${pdfName}`, {},
    );


    try {
      const file = await downloadResumable.downloadAsync();
      if (file && file.uri) {
        setIsLoading(false);
        setDownloadedNotes(prevNotes => [...prevNotes, pdfName]); // Update the downloaded notes
        // Store the list of downloaded notes in AsyncStorage
        await SecureStore.setItemAsync('downloadedNotes', JSON.stringify([...downloadedNotes, pdfName]));
        showModal('PDF file downloaded successfully!');
      } else {
        console.error('File download failed');
      }
    } catch (e) {
      console.error('Error downloading PDF:', e);
    }
  };

  useEffect(() => {
    // Check if there are videos and at least one video available
    if (chapterContents.videos && chapterContents.videos.length > 0) {
      const latestVideo = chapterContents.videos[chapterContents.videos.length - 1];
      // Trigger onPress for the latest video
      setvideooo(latestVideo.url);
      setvideoclick(true);
    }
  }, []);


  const [videooo, setvideooo] = useState("");
  const [videoclick, setvideoclick] = useState(false);

  let alphabet = ["A", "B", "C", "D"];

  const [isRotated, setIsRotated] = useState(false);

  const toggleRotation = () => {
    setIsRotated(!isRotated);
  };


  const renderContents = () => {
    if (selectedChapter !== null) {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {/* VIDEOS : */}
            <View style={{ display: 'flex', width: '95%', flexDirection: 'row', marginTop: '2%' }}>
              <Text style={[{ width: '80%', marginLeft: 10 }, color.mode === 'dark' && styles.darktextColor,]}>VIDEOS :</Text>
            </View>

            <View style={{ width: '95%', gap: 5 }}>
              {chapterContents.videos && chapterContents.videos.length > 0 ? (
                chapterContents.videos.map((video: any, index: any) => (
                  <View key={index}>
                    <TouchableOpacity
                      key={index}
                      style={styles.ContentsButton}
                      onPress={() => { setvideooo(video.url), setvideoclick(true), setQuizVisible(false) }}
                    >
                      <MaterialIcons name="play-circle-outline" size={20} />
                      <Text style={[{ width: '80%' }, color.mode === 'dark' && styles.darktextColor,]}>{video.name}</Text>
                    </TouchableOpacity>


                  </View>
                ))
              ) : (
                <Text style={[styles.ContentsButton, { textAlign: 'center' }]}> No Video Available </Text>
              )}
            </View>

            {/* NOTES :  */}
            <View style={{ display: 'flex', width: '95%', flexDirection: 'row' }}>
              <Text style={[{ width: '80%', marginLeft: 10 }, color.mode === 'dark' && styles.darktextColor,]}>NOTES :</Text>
            </View>

            <View style={{ width: '95%', gap: 5 }}>
              {chapterContents.notes.length > 0 ? (
                chapterContents.notes.map((note: any, index: any) => (
                  downloadedNotes.includes(note) ? (
                    <TouchableOpacity key={index} style={styles.ContentsButton}
                      onPress={() => openDownloadedPdf(`${FileSystem.documentDirectory}${note}`)}
                    >
                      <MaterialIcons name="library-books" size={20} color={color.mode === 'dark' ? Colors.LIGHT_GREEN : Colors.BLACK} style={{ position: 'absolute', left: 10 }} />
                      {/* <Text style={[{ width: '80%', marginLeft: 10 }, color.mode === 'dark' && styles.darktextColor,]}>{note}</Text> */}
                      <Text style={[{ width: '80%', marginLeft: 10 }, color.mode === 'dark' && styles.darktextColor,]}>Basics.pdf</Text>

                      <MaterialIcons name="visibility" size={20} style={{ position: 'absolute', right: 15 }} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity key={index} style={styles.ContentsButton}
                      onPress={() => downloadPdf(`http://${api}/api/getFile/${note}`, note)}
                    >
                      <MaterialIcons name="library-books" size={20} color={color.mode === 'dark' ? Colors.LIGHT_GREEN : Colors.BLACK} style={{ position: 'absolute', left: 10 }} />
                      {/* <Text style={[{ width: '80%', marginLeft: 10 }, color.mode === 'dark' && styles.darktextColor,]}>{note}</Text> */}
                      <Text style={[{ width: '80%', marginLeft: 10 }, color.mode === 'dark' && styles.darktextColor,]}>Basics.pdf</Text>

                      <MaterialIcons name="file-download" size={20} color={color.mode === 'dark' ? Colors.LIGHT_GREEN : Colors.BLACK} style={{ position: 'absolute', right: 15 }} />
                    </TouchableOpacity>
                  )
                ))
              ) : (
                <Text style={[styles.ContentsButton, { textAlign: 'center' }]}>No Note Available</Text>
              )}
            </View>


            {/* QUIZ :  */}
            <View style={{ display: 'flex', width: '95%', flexDirection: 'row' }}>
              <Text style={[{ width: '80%', marginLeft: 10 }, color.mode === 'dark' && styles.darktextColor,]}>QUIZ :</Text>
            </View>

            {selectedChapter !== null && (
              <View style={{ width: '95%', gap: 5 }}>
                <TouchableOpacity onPress={toggleQuiz} style={[styles.ContentsButton, isQuizVisible ? { backgroundColor: Colors.LIGHT_PRIMARY, borderColor: Colors.PRIMARY } : {}]} >
                  <Text>QUIZ</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      );
    }
    return null;
  };



  return (
    <ScrollView contentContainerStyle={[styles.container, color.mode === 'dark' && styles.darkcontainer,]}>
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <View style={[isRotated ? styles.rotatedStyle : {}]}>
        {videoclick ? (
          <>
            <WebView
              style={[
                styles.webViewStyle,
                isRotated && { transform: [{ rotate: '90deg' }] },
                { width: isRotated ? height : width },
                { alignSelf: isRotated ? 'center' : '' },
              ]}

              source={{ uri: `${videooo}` }}
            >
            </WebView>
            {isRotated ?
              <>
                <View style={styles.portrairButtonContainer}>
                  <MaterialCommunityIcons name="phone-rotate-landscape" size={24} color={Colors.Green_Light} onPress={toggleRotation} />
                </View>
              </>
              :
              <View style={styles.landscapeButtonContainer}>
                <MaterialCommunityIcons name="phone-rotate-portrait" size={24} color={Colors.Green_Light} onPress={toggleRotation} />
              </View>
            }
          </>
        ) : isQuizVisible ?
          <>
            <View style={{ width: '100%', gap: 5 }}>
              {quizCompleted[selectedChapter] ? (
                <View style={[styles.quizContentButton, { backgroundColor: randomColor }]}>
                  <View style={{ marginTop: 30, zIndex: 1 }}>
                    <View style={styles.reattemptBox}>
                      <Text style={{ fontSize: 23, color: 'white' }}>Quiz Attempted for Chapter {selectedChapter + 1}!</Text>
                      <Text style={{ fontSize: 18, color: 'white' }}>Your Score: {score[selectedChapter] || 0}/{chapterContents.quiz.questions.length}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.reattemptButton}
                      onPress={handleReattempt}
                    >
                      <Text>Reattempt Quiz</Text>
                    </TouchableOpacity>
                  </View>
                  {completed ? <Image source={Fire} style={{ width: 380, height: 400, zIndex: 0, marginTop: -400 }} /> : null}
                </View>
              ) : (
                <View style={[styles.quizContentButton, { backgroundColor: getRandomColor() }]}>
                  {chapterContents.quiz && chapterContents.quiz.questions.length > 0 ? (
                    <>
                      <View style={styles.quizContainer}>
                        <View style={styles.quizHeading}>
                          <Text style={{ fontSize: 30, color: "white" }}>Quiz Time</Text>
                        </View>
                        <View style={styles.quizView}>

                          <Text style={[color.mode === 'dark' && styles.darktextColor || styles.quizQuestion]}>{`${currentQuestion + 1}) ${chapterContents.quiz.questions[currentQuestion].question} ?`}</Text>
                        </View>
                      </View>
                      <View style={styles.quizOptions}>
                        {chapterContents.quiz.questions[currentQuestion].options.map((option: any, index: any) => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.quizOption,
                              selectedOption === option && chapterContents.quiz.questions[currentQuestion].correctAnswer === option && styles.correctOption, // Apply correct option style
                              selectedOption === option && chapterContents.quiz.questions[currentQuestion].correctAnswer !== option && styles.wrongOption, // Apply wrong option style
                            ]}
                            onPress={() => handleAnswer(option)}
                          >
                            <Text style={{ color: "white", marginLeft: 10 }}>{`${alphabet[index]}) ${option}`}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  ) : (
                    <Text>No quiz questions available for this chapter.</Text>
                  )}
                </View>
              )}
            </View>
          </>

          : ('')
        }
      </View>

      <View style={{ padding: 10 }}>
        {
          unitsChapter.map((chap: any, index: any) => {
            return (
              <View key={index}>
                <TouchableOpacity key={index} onPress={() => handleChapterPress(chap.name, index)}>
                  <View style={{ marginLeft: 0, marginTop: 30 }}>
                    <View>
                      <Text style={[{ fontSize: 14, fontFamily: 'Euclid-bold', alignItems: 'center' }, selectedChapter === index ? { color: 'green' } : {}]}>
                        {completedChapters[index] || index === 0 ? <AntDesign name="checkcircleo" size={15} color="green" style={{ paddingRight: 15 }} />
                          : <AntDesign name="lock" size={20} color="red" />}
                        {` Chapter ${index + 1} - `}
                      </Text>
                      <Text style={{ marginLeft: 100, marginTop: -28, fontSize: 15, fontFamily: 'Euclid-regular', }}>{`${chap.name}`}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {selectedChapter === index && renderContents()}
              </View>
            )
          })
        }


      </View>
      {completed ? <Image source={Fire} style={{ width: 380, height: 800, zIndex: 0, marginTop: -600 }} /> : null}
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
              <TouchableOpacity onPress={() => [setModalVisible(false), setCompleted(false)]}>
                <Text style={styles.modalButton}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};




export default CourseDetailsScreen;


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.LIGHT_BLUE
  },
  darkcontainer: {
    backgroundColor: Colors.BLACK
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.BLACK,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    height: 250,
    paddingBottom: 20,
    position: 'relative',
    gap: -50,
  },
  chapterContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  chapterView: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: itemWidth,
    height: 140,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  chapterText: {
    fontFamily: 'outfit-semibold',
    textAlign: 'center',
    fontSize: 18,
  },
  chapterImage: {
    width: '50%',
    height: '50%',
  },
  contentButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    borderRadius: 10,
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    padding: '4%',
    marginVertical: 5,
  },
  ContentsButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: "95%",
    borderRadius: 10,
    borderColor: Colors.ORANGE,
    borderWidth: 1,
    padding: '4%',
    marginLeft: 7,
    gap: 20,
  },
  notesContentButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    borderRadius: 10,
    borderColor: Colors.ORANGE,
    borderWidth: 1,
    padding: '4%',
    marginLeft: 7,
    gap: 20,
  },
  quizContentButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: width + 8,
    height: 400,
    borderRadius: 10,
    borderColor: Colors.LIGHT_PRIMARY,
    borderWidth: 1,
    padding: '4%',
    gap: 20,
    marginBottom: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    margin: -4
  },
  quizOptions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  quizHeading: {
    borderColor: 'black',
    alignItems: 'center',
    width: 300,
    height: 40,
    backgroundColor: '#F8743c',
    borderTopRightRadius: 7,
    borderTopLeftRadius: 6,
    borderBottomWidth: 2,
  },
  quizOption: {
    width: 240,
    height: 40,
    justifyContent: 'center',
    backgroundColor: '#F16C30',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    marginLeft: 50,
  },
  quizView: {
    borderColor: 'black',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    width: 300,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 0,
    backgroundColor: "#FFFF",
    paddingLeft: 5,
    paddingRight: 5
  },
  quizContainer: {
    borderColor: 'black',
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  quizQuestion: {
    fontSize: 20,
    color: Colors.PRIMARY,

  },
  correctOption: {
    backgroundColor: "#03fc5a",
  },
  wrongOption: {
    backgroundColor: 'red',
  },
  reattemptButton: {
    backgroundColor: Colors.LIGHT_PRIMARY,
    width: 330,
    borderRadius: 10,
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    padding: '4%',
    marginVertical: 10,
    alignItems: 'center',
  },
  reattemptBox: {
    borderWidth: 2,
    width: 330,
    height: 170,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    backgroundColor: '#F8743c'
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
  Icon: {
    position: 'absolute',
    left: 10,
    color: 'red'
  },
  darkIcon: {
  },
  portrairButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: Colors.WHITE,
    borderRadius: 50,
    padding: 5
  },
  landscapeButtonContainer: {
    position: 'absolute',
    bottom: 10,
    right: 18,
    backgroundColor: Colors.WHITE,
    borderRadius: 50,
    padding: 5
  },
  webViewStyle: {
    flex: 1,
    resizeMode: 'contain',
    height: 300,
    width: "100%"
  },
  webViewStyle2: {
    flex: 1,
    resizeMode: 'contain',
    height: 200,
    width: '100%'
  },
  verticalLine: {
    borderStyle: "dashed",
    borderLeftWidth: 2,
    marginRight: 40,
    marginLeft: 4
  } as ViewStyle,
  circle: {
    borderRadius: 50,
    marginLeft: -5,
  } as ViewStyle,
  rotatedStyle: {
    height: height - 50,
  }
});