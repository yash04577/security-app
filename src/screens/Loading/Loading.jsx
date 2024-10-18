import { ActivityIndicator, BackHandler, FlatList, Image, Modal, RefreshControl, StyleSheet, Text, TextInput, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Navbar from '../Navbar/Navbar'
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'react-query';

const Loading = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [billName, setBillName] = useState('');
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selected, setSelected] = useState('');
    const [show1, setShow1] = useState(false);
    const clearScannedEmployeesDataFromStorage = async () => {
        try {
            await AsyncStorage.removeItem('scannedEmployeesData');
            await AsyncStorage.removeItem('scanneditemData');
        } catch (error) {
            console.error('Error clearing scannedEData from AsyncStorage:', error);
        }
    };
    const fetchData = async () => {
        return await axios.post('https://www.lohawalla.com/api/v1/loadingBill/getAllBills', { "date": selected, "sort": "new" });
    };
    const { data: Dated, isLoading, isError, refetch, isFetching } = useQuery('someQueryKey', fetchData, {
        onSuccess: (data) => {
            console.log('Data fetched successfully:', data);
            setData(data.data.allBills);
            clearScannedEmployeesDataFromStorage()
        },
        onError: (error) => {
            console.error('Error fetching data:', error);
        }
    });
    console.log(Dated, isLoading, isError);

    console.log(selected)
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [selected])
    );
    console.log(billName);
    const searchData = (searchQuery) => {
        console.log(searchQuery)
        if (!searchQuery) {
            return data;
        }
        searchQuery = searchQuery.toLowerCase();
        const filteredList = data.filter((item) => {
            const part = (item.billNumber || '').toString().toLowerCase();
            return part.includes(searchQuery);
        });
        if (filteredList.length === 0) {
            return [];
        }
        return filteredList;
    };
    const handleConfirm = (date) => {
        const sendingDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        setSelected(sendingDate)
    }
    console.log(data);
    const handleRefresh = () => {
        setRefreshing(true);
        refetch();
        setSelected('');
        setRefreshing(false);
    };
    if (isLoading || isFetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }
    return (
        <View>
            <Navbar navigation={navigation} />
            <View style={{ height: '88%' }} >
                <View style={{ flexDirection: 'row', alignItems: 'center', margin: 20 }} >
                    <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'space-evenly' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5, justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Icon
                                    name='arrow-left'
                                    size={20}
                                    color={'#000000'}
                                />
                            </TouchableOpacity>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 20, fontFamily: 'Inter', marginLeft: 15, color: '#000000' }} >
                                    Choose Bill Number
                                </Text>
                            </View>
                        </View>
                        <View style={{ alignSelf: 'center', marginLeft: 50 }}>
                            <TouchableOpacity onPress={() => setShow1(!show1)}>
                                <Icon
                                    name='calendar'
                                    size={40}
                                    color={'#000000'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <DateTimePickerModal
                        isVisible={show1}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={() => setShow1(false)}
                    />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignContent: 'center' }}>
                    <TextInput
                        style={{ width: '60%', padding: 8, borderWidth: 1, borderRadius: 5 }}
                        placeholder='Choices Order Number......'
                        onChangeText={text => {
                            setSearchQuery(text)
                        }}
                    />
                    <TouchableOpacity style={{ borderWidth: 1, borderRadius: 8, width: '28%', backgroundColor: '#005D7F', }} onPress={() => setModalVisible(true)}>
                        <Text style={{ textAlign: 'center', textAlignVertical: 'center', marginTop: '12%', color: 'white' }}>Add New Bill</Text>
                    </TouchableOpacity>
                    <Modal
                        visible={modalVisible}
                        animationType='slide'
                        onRequestClose={() => setModalVisible(false)}
                        transparent={true}
                    >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View
                                style={{
                                    width: '80%',
                                    padding: 20,
                                    backgroundColor: 'white',
                                    borderRadius: 10,
                                    elevation: 5,
                                }}
                            >
                                <Text style={{ fontSize: 18, marginBottom: 10 }}>Add a Bill Number</Text>
                                <View style={{ marginBottom: 10 }}>
                                    <TextInput
                                        style={{
                                            width: '100%',
                                            padding: 10,
                                            borderWidth: 1,
                                            borderRadius: 5,
                                        }}
                                        placeholder='Enter Bill Number...'
                                        onChangeText={(text) => setBillName(text)}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity
                                        style={{
                                            padding: 10,
                                            backgroundColor: '#005D7F',
                                            borderRadius: 5,
                                        }}
                                        onPress={() => {
                                            navigation.navigate('LoadingQr', { billName })
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={{ color: 'white' }}>Ok</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            padding: 10,
                                            backgroundColor: '#E74C3C',
                                            borderRadius: 5,
                                        }}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={{ color: 'white' }}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
                {
                    data &&
                    <FlatList
                        data={searchData(searchQuery)}
                        renderItem={({ item }) => (
                            console.log(item),
                            <TouchableOpacity onPress={() => navigation.navigate('AddProd', { item })}>
                                <View style={{ width: 320, borderRadius: 8, borderWidth: 1, padding: 16, marginTop: 12, alignSelf: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontWeight: '500', fontSize: 14, lineHeight: 19.6, fontFamily: "Inter", color: '#172B4D' }}>Bill Number:</Text>
                                            <Text style={{ fontWeight: '700', fontSize: 17, lineHeight: 19.6, color: '#005D7F' }} >{item.billNumber}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image
                                                source={{ uri: item.billPicture }}
                                                style={{ borderRadius: 50, width: 30, height: 30 }}
                                            />
                                            <Image
                                                source={{ uri: item.vehiclePicture ? item.vehiclePicture : "" }}
                                                style={{ borderRadius: 50, width: 30, height: 30 }}
                                            />
                                        </View>
                                    </View>
                                    <TouchableOpacity style={{ flexDirection: 'row', borderWidth: 1, borderRadius: 8, width: '30%', paddingVertical: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#005D7F' }} onPress={() => setShow(!show)}>
                                        <Text style={{ color: 'white' }}>{show ? "Less" : "More"}</Text>
                                        {show ?
                                            (
                                                <Icon
                                                    name='chevron-circle-down'
                                                    size={20}
                                                    color={'white'}
                                                    style={{ alignSelf: 'center', marginLeft: 3 }}
                                                />
                                            ) :
                                            (
                                                <Icon
                                                    name='chevron-circle-up'
                                                    size={20}
                                                    color={'white'}
                                                    style={{ alignSelf: 'center', marginLeft: 3 }}
                                                />
                                            )
                                        }
                                    </TouchableOpacity>
                                    {
                                        show &&
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignContent: 'center', margin: 5 }}>
                                            <Image
                                                source={{ uri: item.billPicture }}
                                                style={{ borderRadius: 8, width: 100, height: 100 }}
                                            />
                                            <Image
                                                source={{ uri: item.vehiclePicture ? item.vehiclePicture : "" }}
                                                style={{ borderRadius: 8, width: 100, height: 100 }}
                                            />
                                        </View>
                                    }
                                    <View >
                                        <Text style={{ fontWeight: '700', fontSize: 17, lineHeight: 19.6, color: '#005D7F', marginLeft: '60%', marginTop: '2%' }}>{item.createdAt.split("T")[0]}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                        }
                    />
                }
            </View>
        </View>
    )
}

export default Loading

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})