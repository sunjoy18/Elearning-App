import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../assets/utils/Colors';

const { width, height } = Dimensions.get('window');

const DisplayVideo = () => {
  const route: any = useRoute();
  const { vidUrl } = route.params;

  const [isRotated, setIsRotated] = useState(false);

  const toggleRotation = () => {
    setIsRotated(!isRotated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.webViewContainer}>
        <WebView
          style={[
            styles.webViewStyle,
            isRotated && { transform: [{ rotate: '90deg' }] },
            { width: isRotated ? height : width },
            { alignSelf: isRotated ? 'center' : 'stretch' },
          ]}
          source={{ uri: vidUrl }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
      {isRotated ?
        <View style={styles.portrairButtonContainer}>
          <MaterialCommunityIcons name="phone-rotate-landscape" size={24} color={Colors.Green_Light} onPress={toggleRotation} />
        </View>
        :
        <View style={styles.landscapeButtonContainer}>
          <MaterialCommunityIcons name="phone-rotate-portrait" size={24} color={Colors.Green_Light} onPress={toggleRotation} />
        </View>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewStyle: {
    flex: 1,
    resizeMode: 'contain',
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
  }
});

DisplayVideo .navigationOptions = {
  tabBarStyle: {
    display: "none",
  },
};

export default DisplayVideo;



{/* <Video
        ref={video}
        style={[styles.video, color.mode === 'dark' && styles.darkvideo,]}
        source={{
          uri: `http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        onFullscreenUpdate={toggleOrientation}
        /> */}

// uri: `http://${api}/api/getFile/${vidName}`,