import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect, useRoute } from '@react-navigation/native'
import Navbar from '../Navbar/Navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios';
import LoadingButton from '../../components/loading/LoadingButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'react-query';
const AddProd = ({ navigation }) => {
    const route = useRoute();
    const item = route.params;
    const [show, setShow] = useState(false);
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const [checkboxStates, setCheckboxStates] = useState(null)
    const [checkboxStates1, setCheckboxStates1] = useState(null)
    const [barCodes, setBarcodes] = useState([])
    const [items, setItems] = useState(item?.item !== null && item?.item !== undefined ? item?.item : '');
    console.log(items)
    const fetchData = async () => {
        return await axios.post('https://www.lohawalla.com/api/v1/loadingBill/getAllLoadingSlips');
    };
    const { isLoading, isError, refetch, isFetching } = useQuery('loadingQueryKey', fetchData, {
        onSuccess: ({ data }) => {
            console.log('Data fetched successfully:', data);
            setData(data.data);
            setCheckboxStates(() => {
                const result = data && data.data?.slipsWithoutBill.reduce((acc, val) => {
                    acc[val.productionSlipNumber] = false;
                    return acc;
                }, {});
                return result;
            });
        },
        onError: (error) => {
            console.error('Error fetching data:', error);
        }
    });
    console.log(isLoading, isError, refetch, isFetching);
    useFocusEffect(
        React.useCallback(() => {
            const fetchScannedData = async () => {
                try {
                    const data = await AsyncStorage.getItem('scannedEmployeesData');
                    const item = await AsyncStorage.getItem('scanneditemData');
                    if (data) {
                        const scannedDataFromStorage = JSON.parse(data);
                        console.log(scannedDataFromStorage);
                        setBarcodes(scannedDataFromStorage);
                        setCheckboxStates1(() => {
                            const result = scannedDataFromStorage && scannedDataFromStorage.reduce((acc, val) => {
                                acc[val] = true;
                                return acc;
                            }, {});
                            return result;
                        })
                        console.log('Scanned data retrieved from AsyncStorage:', scannedDataFromStorage);
                    } else {
                        console.log('No scanned data found in AsyncStorage');
                    }
                    if (item) {
                        const dataFromStorage = JSON.parse(item);
                        console.log(dataFromStorage);
                        setItems(dataFromStorage);
                    }
                    else {
                        console.log('No scanned data found in AsyncStorage');
                    }
                } catch (error) {
                    console.error('Error retrieving scanned data from AsyncStorage:', error);
                }
            };
            fetchScannedData();
        }, [])
    );
    console.log(checkboxStates1);
    const handleCheckboxChange = (value) => {
        setCheckboxStates((prevStates) => ({
            ...prevStates,
            [value]: !prevStates[value],
        }));
    };
    console.log(barCodes);
    const handleCheckboxChange1 = (value) => {
        setCheckboxStates1((prevStates) => ({
            ...prevStates,
            [value]: !prevStates[value],
        }));
    };
    const filteredKeys = checkboxStates && Object.keys(checkboxStates).filter((key) => checkboxStates[key]) || [];
    const filteredKeys1 = checkboxStates1 && Object.keys(checkboxStates1).filter((key) => checkboxStates1[key]) || [];
    console.log(filteredKeys, filteredKeys1);
    if (isLoading || isFetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }
    return (
        <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
            <Navbar navigation={navigation} />
            <View style={{ marginTop: 20 }}>
                <View style={{ borderWidth: 1, width: 320, height: 81, borderRadius: 8, padding: 16, alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontWeight: '500', fontSize: 14, lineHeight: 19.6, fontFamily: "Inter", color: '#172B4D' }}>Bill Number:</Text>
                            <Text style={{ fontWeight: '700', fontSize: 17, lineHeight: 19.6, color: '#005D7F' }} >{items.billNumber ? items.billNumber : items.items.billNumber}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                source={{ uri: items.billPicture ? items.billPicture : '' }}
                                style={{ borderRadius: 50, width: 30, height: 30 }}
                            />
                            <Image
                                source={{ uri: items.vehiclePicture ? items.vehiclePicture : "" }}
                                style={{ borderRadius: 50, width: 30, height: 30 }}
                            />
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setShow(!show)} style={{ margin: '5%' }} >
                    <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'flex-start' }}>
                        <Text style={{ fontWeight: '500', fontSize: 16, lineHeight: 19.8, color: '#172B4D80' }}>Present Items with this Bill</Text>
                        <Text>-----</Text>
                        {show ?
                            (
                                <Icon
                                    name='chevron-circle-down'
                                    size={20}
                                    color={'#000000'}
                                    style={{ alignSelf: 'center', marginLeft: 3 }}
                                />
                            ) :
                            (
                                <Icon
                                    name='chevron-circle-up'
                                    size={20}
                                    color={'#000000'}
                                    style={{ alignSelf: 'center', marginLeft: 3 }}
                                />
                            )
                        }
                    </View>
                    {show && (items.productionSlipNumbers ? items.productionSlipNumbers : items.item.productionSlipNumbers) &&
                        <FlatList
                            data={items.productionSlipNumbers ? items.productionSlipNumbers : items.item.productionSlipNumbers}
                            renderItem={({ item, index }) => (
                                <View style={{ margin: 10, flexDirection: 'row', alignContent: 'center', justifyContent: 'space-around' }}>
                                    <Text style={{ fontWeight: '600', fontSize: 15, color: '#000' }}>{item}</Text>
                                </View>
                            )}
                        />
                    }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShow1(!show1)} style={{ margin: '5%' }} >
                    <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'flex-start' }}>
                        <Text style={{ fontWeight: '500', fontSize: 16, lineHeight: 19.8, color: '#172B4D80' }}>Available Items</Text>
                        <Text>-----</Text>
                        {show1 ?
                            (
                                <Icon
                                    name='chevron-circle-down'
                                    size={20}
                                    color={'#000000'}
                                    style={{ alignSelf: 'center', marginLeft: 3 }}
                                />
                            ) :
                            (
                                <Icon
                                    name='chevron-circle-up'
                                    size={20}
                                    color={'#000000'}
                                    style={{ alignSelf: 'center', marginLeft: 3 }}
                                />
                            )
                        }
                    </View>
                </TouchableOpacity>
                <View>
                    {show1 && data &&
                        <FlatList
                            data={Object.keys(checkboxStates)}
                            renderItem={({ item, index }) => (
                                <View style={{ margin: 10, flexDirection: 'row', alignContent: 'center', justifyContent: 'space-around' }}>
                                    <Text style={{ fontWeight: '600', fontSize: 15, color: '#000' }}>{item}</Text>
                                    <CheckBox
                                        disabled={false}
                                        value={checkboxStates[item]}
                                        onValueChange={() => handleCheckboxChange(item)}
                                        style={{ marginTop: -8 }}
                                    />
                                </View>
                            )}
                        />
                    }
                </View>
                <TouchableOpacity onPress={() => setShow2(!show2)} style={{ margin: '5%' }} >
                    <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'flex-start' }}>
                        <Text style={{ fontWeight: '500', fontSize: 16, lineHeight: 19.8, color: '#172B4D80' }}>QR Scanned</Text>
                        <Text>-----</Text>
                        {show2 ?
                            (
                                <Icon
                                    name='chevron-circle-down'
                                    size={20}
                                    color={'#000000'}
                                    style={{ alignSelf: 'center', marginLeft: 3 }}
                                />
                            ) :
                            (
                                <Icon
                                    name='chevron-circle-up'
                                    size={20}
                                    color={'#000000'}
                                    style={{ alignSelf: 'center', marginLeft: 3 }}
                                />
                            )
                        }
                    </View>
                </TouchableOpacity>
                <View>
                    {show2 && barCodes.length > 0 &&
                        <FlatList
                            data={Object.keys(checkboxStates1)}
                            renderItem={({ item, index }) => (
                                <View style={{ margin: 10, flexDirection: 'row', alignContent: 'center', justifyContent: 'space-around' }}>
                                    <Text style={{ fontWeight: '600', fontSize: 15, color: '#000' }}>{item}</Text>
                                    <CheckBox
                                        disabled={false}
                                        value={checkboxStates1[item]}
                                        onValueChange={() => handleCheckboxChange1(item)}
                                        style={{ marginTop: -8 }}
                                    />
                                </View>
                            )}
                        />
                    }
                </View>
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('ScanProdSlip', { item })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 5 }}>
                    <Text style={[styles.buttonText]}>Scan Slip</Text>
                </View>
            </TouchableOpacity>
            <View style={{ bottom: 0 }}>
                <LoadingButton
                    title='Move to cart'
                    onPress={() => navigation.navigate('LoadingFinal', { items, filteredKeys, filteredKeys1 })}
                    buttonStyle={styles.customButtonStyle}
                    textStyle={styles.customButtonTextStyle}
                />
            </View>
        </SafeAreaView>
    )
}

export default AddProd

const styles = StyleSheet.create({
    loginButton: {
        backgroundColor: '#005D7F',
        justifyContent: 'center',
        alignItems: 'center',
        height: '5%',
        borderRadius: 14,
        bottom: 0,
        width: '25%',
        position: 'absolute',
        marginLeft: '55%',
        marginBottom: '40%'
    },
    buttonText: {
        color: 'white',
        paddingLeft: '2%',
        fontSize: 17
    },
    customButtonStyle: {
        width: '95%',
        alignSelf: 'center',
        marginTop: '20%',
    },
    customButtonTextStyle: {
        paddingVertical: 8
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})