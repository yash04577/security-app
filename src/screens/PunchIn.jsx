import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Alert, Vibration, ToastAndroid } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { RNHoleView } from 'react-native-hole-view';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { captureRef } from 'react-native-view-shot';
import axios from 'axios';
import { RBASE_URL } from '../config';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { Button } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { trigger } from "react-native-haptic-feedback";
const QRScanner = ({ navigation }) => {
  const route = useRoute();
  const { shift } = route.params;
  console.log("555555555555588888888888555555555555", shift);
  const devices = useCameraDevices();
  const device = devices.front;
  const [torchOn, setTorchOn] = useState(false);
  const [isFocused, setIsFocused] = useState(true); // Track screen focus
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.ALL_FORMATS]);
  const [barcode, setBarcode] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  useEffect(() => {
    checkCameraPermission();
  }, []);
  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    setHasPermission(status === 'authorized');
  };
  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };
  useEffect(() => {
    toggleActiveState();
  }, [barcodes]);
  const toggleActiveState = () => {
    if (barcodes && barcodes.length > 0 && !isScanned) {
      setIsScanned(true);
      barcodes.forEach(async (scannedBarcode) => {
        if (scannedBarcode.rawValue !== '') {
          setBarcode(scannedBarcode.rawValue);
          console.log(scannedBarcode.rawValue);
          let data = scannedBarcode.rawValue;
          try {
            let call = await axios.post(`https://www.lohawalla.com/api/v2/attendance/v2/find-employee-by-Qr`, { data, shift })
            let attend = await call;
            console.log("Data i got from scanning", attend.data.punch)
            console.log("Employee DOcs", attend.data);
            let show = attend?.data?.punch
            let picture = attend?.data?.docs?.profilePicture
            console.log('Picture Data', picture);
            let total = attend.data.employee;
            let message = attend.data.message;
            const attendanceRecord = attend.data?.attendanceRecord[0]?.punches
            console.log("impactHeavy", attendanceRecord);
            Vibration.vibrate();
            trigger("impactHeavy", options);
            ToastAndroid.showWithGravityAndOffset(
              'QR Scanned Successfully',
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              0,
              50
            )
            showMessage({
              message: 'QR Scanned Successfully',
              floating: true,
              duration: 5000,
            })
            trigger("impactLight", options);
            console.log('QR Scanned Successfully', attendanceRecord);
            navigation.navigate('MarkPunchin', { total, picture, show, shift, attendanceRecord, message })
            // alert('QR Scanned Successfully');
            console.log("Data i got2e2424242", total, picture, show);
          } catch (error) {
            console.log(error);
            showMessage({
              message: error.response.data.message,
              floating: true,
              duration: 5000,
            })
            navigation.navigate("Home")
            // alert(error.message)
          }
        }
      });
    }
  };
  ;
  return (
    device != null &&
    hasPermission && (
      <>
        <FlashMessage />
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!isScanned}
          frameProcessor={frameProcessor}
          frameProcessorFps='auto'
          audio={false}
          enableZoomGesture
          hasFlash='true'
        />
        <RNHoleView
          holes={[
            {
              x: widthPercentageToDP('10.5%'),
              y: heightPercentageToDP('25%'),
              width: widthPercentageToDP('80%'),
              height: heightPercentageToDP('30%'),
              borderRadius: 10,
            },
          ]}
          style={styles.rnholeView}
        />
      </>
    )
  );
};

// Styles:
const styles = StyleSheet.create({
  rnholeView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default QRScanner;
