import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useRoute } from '@react-navigation/native';
import Navbar from '../Navbar/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoadingButton from '../../components/loading/LoadingButton';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from '../../auth/AuthGuard';

const LoadingFinal = ({ navigation }) => {
    const auth = useAuthContext();
    const route = useRoute();
    const [show, setShow] = useState(false)
    const { items, filteredKeys, filteredKeys1 } = route.params;
    console.log(items, filteredKeys, filteredKeys1);
    const totalData = [...filteredKeys, ...filteredKeys1];
    const [isButtonLoading, setButtonLoading] = useState(false);
    const clearScannedEmployeesDataFromStorage = async () => {
        try {
            await AsyncStorage.removeItem('scannedEmployeesData');
            await AsyncStorage.removeItem('scanneditemData');
        } catch (error) {
            console.error('Error clearing scannedEData from AsyncStorage:', error);
        }
    };
    console.log(`Slip Added By ${auth?.authData?.name}`);
    const handleComplete = () => {
        const formData = {
            'billNumber': items.billNumber,
            'productionSlipNumbers': totalData,
            'remark': `Slip Added By ${auth?.authData?.name}`
        }
        console.log(formData);
        setButtonLoading(true);
        try {
            axios.patch(
                'https://www.lohawalla.com/api/v1/loadingBill/updateBill',
                formData,
            )
                .then((res) => {
                    clearScannedEmployeesDataFromStorage();
                    console.log(res);
                    Alert.alert(res.data.message)
                    Dialog.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: "Success",
                        textBody: res.data.message,
                        button: 'close',
                    })
                })
        } catch (error) {
            navigation.navigate('Loading')
            console.log(error);
        }
        finally {
            navigation.navigate('Loading')
            setButtonLoading(false);
        }
    }
    return (
        <View style={{ height: '100%' }}>
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
                                    source={{ uri: items.billPicture ? items.billPicture : items.items.billPicture }}
                                    style={{ borderRadius: 50, width: 30, height: 30 }}
                                />
                                <Image
                                    source={{ uri: items.vehiclePicture ? items.vehiclePicture : "" }}
                                    style={{ borderRadius: 50, width: 30, height: 30 }}
                                />
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setShow(!show)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', margin: '5%' }}>
                            <Text style={{ fontSize: 20, fontWeight: '700' }}>Your Cart</Text>
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
                    </TouchableOpacity>
                    <View style={{ marginLeft: '5%' }}>
                        {show &&
                            <FlatList
                                data={totalData}
                                renderItem={({ item, index }) => (
                                    <View style={{ margin: 10 }}>
                                        <Text style={{ fontWeight: '600', fontSize: 12, color: '#000' }}>{item}</Text>
                                    </View>
                                )}
                            />
                        }
                    </View>
                </View>
                <View style={{ bottom: 0, }}>
                    <LoadingButton
                        title='Complete Transaction'
                        onPress={() => handleComplete()}
                        buttonStyle={styles.customButtonStyle}
                        textStyle={styles.customButtonTextStyle}
                    />
                </View>
            </SafeAreaView>
        </View>
    )
}

export default LoadingFinal

const styles = StyleSheet.create({
    customButtonStyle: {
        width: '95%',
        alignSelf: 'center',
        marginTop: '20%',
    },
    customButtonTextStyle: {
        paddingVertical: 8
    }
})