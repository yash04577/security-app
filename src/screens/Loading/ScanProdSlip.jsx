import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Alert, BackHandler, TouchableOpacity, Text, Vibration, FlatList, Modal } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { RNHoleView } from 'react-native-hole-view';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import axios from 'axios';
import { err } from 'react-native-svg/lib/typescript/xml';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const ScanProdSlip = ({ navigation }) => {
    const devices = useCameraDevices();
    const device = devices.front;
    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.ALL_FORMATS]);
    const [barcode, setBarcode] = useState(''); // Provide a default value of an empty string
    const [hasPermission, setHasPermission] = useState(false);
    const [isScanned, setIsScanned] = useState(false);
    const [scannedBarcodes, setScannedBarcodes] = useState([]);
    const [isScanning, setIsScanning] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [data, setData] = useState(null);
    const route = useRoute();
    const {item} = route.params;
    const [items, setItems] = useState(item?.item !== null && item?.item !== undefined ? item?.item : '');
    useEffect(() => {
        checkCameraPermission();
    }, []);
    useEffect(() => {
        AsyncStorage.getItem('scannedEmployeesData')
            .then((data) => {
                if (data) {
                    const scannedDataFromStorage = JSON.parse(data);
                    setScannedBarcodes(scannedDataFromStorage)
                    console.log('scannedEData retrieved from AsyncStorage:', scannedDataFromStorage);
                } else {
                    console.log('No scannedEData found in AsyncStorage');
                }
            })
            .catch((error) => {
                console.error('Error retrieving scannedEData from AsyncStorage:', error);
            });
            AsyncStorage.getItem('scanneditemData')
            .then((data) => {
                if (data) {
                    const scannedDataFromStorage = JSON.parse(data);
                    setItems(scannedDataFromStorage)
                    console.log('scannedEData retrieved from AsyncStorage:', scannedDataFromStorage);
                } else {
                    console.log('No scannedEData found in AsyncStorage');
                }
            })
            .catch((error) => {
                console.error('Error retrieving scannedEData from AsyncStorage:', error);
            });
    }, [])
    const checkCameraPermission = async () => {
        const status = await Camera.getCameraPermissionStatus();
        setHasPermission(status === 'authorized');
    };
    useEffect(() => {
        toggleActiveState();
    }, [barcodes]);
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
        };
    }, []);
    const options = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    };
    const toggleActiveState = () => {
        if (barcodes && barcodes.length > 0 && isScanning) {
            barcodes.forEach(async (scannedBarcode) => {
                if (scannedBarcode.rawValue && scannedBarcode.rawValue !== '') {
                    const data = scannedBarcode.rawValue;
                    if (scannedBarcodes.includes(data)) {
                        console / warn("Barcode already scanned")
                        return;
                    }
                    setBarcode(data);
                    setIsScanning(false);
                    try {
                        const updatedScannedData = [...scannedBarcodes, data];
                        setScannedBarcodes(updatedScannedData);
                        setData(data)
                        setModalVisible(true);
                        await AsyncStorage.setItem('scannedEmployeesData', JSON.stringify(updatedScannedData));
                        items!==''&&await AsyncStorage.setItem('scanneditemData', JSON.stringify(items));
                        console.log('scannedEData stored in AsyncStorage');
                    } catch (error) {
                        console.error('Error storing scannedEData in AsyncStorage:', error);
                    }
                }
            })
        }
    };
    const handleBackButton = () => {
        navigation.navigate("AddProd");
        return true;
    };
    const scanMore = () => {
        setIsScanning(true);
        setBarcode('');
        setModalVisible(false); // Hide the modal
    };
    console.log("Scanned Slip Data", scannedBarcodes);
    const finishAllotment = () => {
        console.log("Finish Allotment back button pressed");
        navigation.navigate("AddProd");
    };
    return (
        device != null &&
        hasPermission && (
            <>
                <StatusBar barStyle="light-content" backgroundColor="#000000" />
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        zIndex: 1,
                    }}
                    onPress={() => handleBackButton()}
                >
                </TouchableOpacity>
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={isScanning}
                    frameProcessor={frameProcessor}
                    frameProcessorFps="auto"
                    audio={false}
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
                {isScanning ? (
                    <Text style={styles.instructions}>Scanning...</Text>
                ) : (
                    <View style={{ marginBottom: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.loginButton} onPress={scanMore} ><Text style={styles.buttonText}>Scan More</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.loginButton} onPress={() => finishAllotment()} ><Text style={styles.buttonText}>Finish Allotment</Text></TouchableOpacity>
                    </View>
                )}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Scan Successful!</Text>
                        {data && (
                            <View style={styles.container}>
                                <Text style={{ color: '#312e81', fontSize: 18 ,fontWeight:'800'}}>{data}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.loginButton1} onPress={() => setModalVisible(false)}  ><Text style={{ color: 'white', paddingLeft: 3, fontSize: 30 }}>OK</Text></TouchableOpacity>
                    </View>
                </Modal>
            </>
        )
    );
};
export default ScanProdSlip

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
    container: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F0F0',
        marginLeft: '5%',
        marginRight: '5%',
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#DEDEDE',
    }
    ,
    loginButton: {
        backgroundColor: '#283093',
        justifyContent: 'center',
        alignItems: 'center',
        height: '18%',
        borderRadius: 10,
        width: '90%',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        paddingLeft: 10,
        fontSize: 20
    },
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalText: {
        fontSize: 20,
        color: 'white',
        marginBottom: 20,
    },container: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F0F0',
        marginLeft: '5%',
        marginRight: '5%',
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#DEDEDE',
    }
    ,
    loginButton1: {
        backgroundColor: '#283093',
        justifyContent: 'center',
        alignItems: 'center',
        height: '10%',
        borderRadius: 10,
        width: '90%',
        marginTop: 10,
    }
});
