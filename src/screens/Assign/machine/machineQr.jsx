import { decode, encode } from 'base-64';
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Button, Image, StatusBar, Alert, TouchableOpacity, Vibration } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useRoute } from '@react-navigation/native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { RNHoleView } from 'react-native-hole-view';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { trigger } from "react-native-haptic-feedback";
import FlashMessage from 'react-native-flash-message';
const MachineQr = ({ navigation }) => {
    const devices = useCameraDevices();
    const device = devices.front;
    const route = useRoute();
    const { selectedMachine } = route.params || {}                      //Taking alll data
    const machineId = selectedMachine.id; // Replace 'your_id_here' with the desired ID
    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.ALL_FORMATS]);
    const [data, setData] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isScanned, setIsScanned] = useState(false);
    const options = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    };
    useEffect(() => {
        checkCameraPermission();
    }, []);
    const checkCameraPermission = async () => {
        const status = await Camera.getCameraPermissionStatus();
        setHasPermission(status === 'authorized');
    };
    useEffect(() => {
        toggleActiveState();
    }, [barcodes]);
    const toggleActiveState = async () => {
        if (barcodes && barcodes.length > 0 && isScanned === false) {
            Vibration.vibrate();
            setIsScanned(true);
            barcodes.forEach(async (scannedBarcode) => {
                if (scannedBarcode.rawValue !== '') {
                    setData(scannedBarcode.rawValue);
                    trigger("impactLight", options);
                }
            });
        }
    };
    const handleScanAgain = () => {
        setIsScanned(false);
        setData(null);
    };
    const handleOk = () => {
        if (data) {
            const requestBody = {
                data,
                machineId
            }
            let total = { selectedMachine, requestBody }
            console.log("8080808808080990909606064040404044",total);
            navigation.navigate('machineFinal', { total })
        } else {
            alert('Scanned data is not available.');
        }
    };
    // Replace with the data you want to send in the body
    const cameraRef = useRef(null);
    return (
        device != null &&
        hasPermission && (
            <>
                <FlashMessage />
                <StatusBar barStyle="light-content" backgroundColor="#000000" />
                {!isScanned ? (
                    <>
                        <Camera
                            ref={cameraRef}
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={true}
                            frameProcessor={frameProcessor}
                            audio={false}
                            frameProcessorFps='auto'
                            enableZoomGesture
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
                ) : (
                    <View style={styles.confirmButtonContainer}>
                        <Text style={styles.scanResultText}>Scanned Data: {data}</Text>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity onPress={handleScanAgain} style={styles.confirmButton}>
                                <Text style={styles.confirmButtonText}>Scan Again</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleOk} style={styles.confirmButton}>
                                <Text style={styles.confirmButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
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
    confirmButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
    scanResultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanResultText: {
        fontSize: 18,
        marginBottom: 20,
        color: 'black'
    },
});

export default MachineQr