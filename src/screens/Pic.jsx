import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { Image } from 'react-native';
import { RBASE_URL } from '../config';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
const checkAndRequestPermissions = async () => {
  let cameraPermission, storagePermission;
  if (Platform.OS === 'android') {
    cameraPermission = PERMISSIONS.ANDROID.CAMERA;
    storagePermission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
  } else {
    cameraPermission = PERMISSIONS.IOS.CAMERA;
    storagePermission = PERMISSIONS.IOS.PHOTO_LIBRARY;
  }
  try {
    const [cameraStatus, storageStatus] = await requestMultiple([cameraPermission, storagePermission]);
    if (cameraStatus === RESULTS.GRANTED && storageStatus === RESULTS.GRANTED) {
      console.log('You can use the camera');
    } else {
      console.log('Camera permission denied');
    }
  } catch (error) {
    console.log('Error checking or requesting permissions:', error);
  }
};
const CameraScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const cameraRef = useRef(null);
  const route = useRoute();
  const { total } = route.params || {};
  const employeeId = total.requestBody.employeeId;
  const qrData = total.requestBody.data;
  console.log(employeeId);
  console.log('I am QR data', qrData);
  useEffect(() => {
    checkAndRequestPermissions();
  }, []);
  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 0.5,
        width: 1500,
        height: 1500,
        base64: true,
      };
      try {
        const data = await cameraRef.current.takePictureAsync(options);
        setImage(data.uri);
        Vibration.vibrate();
        setShowPhoto(true);
      } catch (error) {
        console.log('Error taking photo:', error);
      }
    }
  };
  const handleConfirm = () => {
    if (image) {
      imageUpload(image);
    }
  };
  const handleRetake = () => {
    setShowPhoto(false);
    setImage(null);
  };
  if (image) {
    total.selectedEmployee.Profile.uri = image
  }
  console.log("Remembering.......................", total.selectedEmployee.Profile);
  console.log('image is here ', image);
  const imageUpload = async (data) => {
    const apiUrl = `${RBASE_URL}/employee/docs/uploadproofImage`;
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: data,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });
      formData.append('employeeId', employeeId);
      formData.append('data', qrData)
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      console.log("I am Form Data", formData);
      let res = await axios.post(apiUrl, formData, { headers, withCredentials: true });
      alert('image uploaded successfully')
      navigation.navigate('Final', { total });
      console.log('Data', res.data);
    } catch (err) {
      // navigation.navigate('Final', { total });
      // console.log('Error uploading image:', err.response.data.messgae);
      showMessage({
        message: err.response.data.message, // Typo fix: 'messgae' to 'message'
        type: 'info',
        floating: true,
        duration: 5000,
        messageStyle: { width: 300 },
      });
      navigation.navigate('Home')
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <FlashMessage />
      {showPhoto && image && <Image source={{ uri: image }} style={{ flex: 1 }} />}
      {!showPhoto && (
        <RNCamera
          ref={cameraRef}
          style={{ flex: 1 }}
          type={RNCamera.Constants.CaptureTarget}
        />
      )}
      {!showPhoto && (
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity onPress={handleTakePhoto} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}
      {showPhoto && (
        <View style={styles.confirmButtonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleRetake} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  confirmButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#283093',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  confirmButtonText: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
  },
});

export default CameraScreen;