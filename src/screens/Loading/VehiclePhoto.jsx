import { decode, encode } from 'base-64';
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Button, Image, StatusBar, Alert, TouchableOpacity, Vibration } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useRoute } from '@react-navigation/native';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import FlashMessage from 'react-native-flash-message';
import { requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';

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
const VehiclePhoto = ({ navigation }) => {
    const route = useRoute();
    const { image, billName } = route.params || {};
    const [image2, setImage2] = useState(null);
    const [showPhoto, setShowPhoto] = useState(false);
    const cameraRef = useRef(null);
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
                setImage2(data.uri);
                Vibration.vibrate();
                setShowPhoto(true);
            } catch (error) {
                console.log('Error taking photo:', error);
            }
        }
    };
    const handleRetake = () => {
        setShowPhoto(false);
        setImage2(null);
    };
    const handleOk = () => {
    };
    const handleConfirm = () => {
        console.log(image);
    }
    return (
        <View style={{ flex: 1 }}>
            <FlashMessage />
            {showPhoto && image2 && <Image source={{ uri: image2 }} style={{ flex: 1 }} />}
            {!showPhoto && (
                <RNCamera
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    type={RNCamera.Constants.CaptureTarget}
                    autoFocus={RNCamera.Constants.AutoFocus.on}
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
                        <TouchableOpacity onPress={() => navigation.navigate('FinalLoading', { image, billName, image2 })} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    )
};
// Styles:
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

export default VehiclePhoto