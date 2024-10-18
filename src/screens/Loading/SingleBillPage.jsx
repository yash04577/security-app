import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useRoute } from '@react-navigation/native'
import Navbar from '../Navbar/Navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import LoadingButton from '../../components/loading/LoadingButton';

const SingleBillPage = ({ navigation }) => {
    const route = useRoute();
    const { image, billName } = route.params || {};
    console.log(image, billName);
    const [show, setShow] = useState(false);
    return (
        <View>
            <Navbar navigation={navigation}/>
            <View style={{  }} >
                <View style={{ flexDirection: 'row', alignItems: 'center', margin: 20 }} >
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon
                            name='arrow-left'
                            size={20}
                            color={'#000000'}
                        />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '500', lineHeight: 20, fontFamily: 'Inter', marginLeft: 15, color: '#000000' }} >
                        Bill Details
                    </Text>
                </View>
                <View style={{ width: 320, borderRadius: 8, borderWidth: 1, padding: 16, marginTop: 12, alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontWeight: '500', fontSize: 14, lineHeight: 19.46, fontFamily: 'Inter', color: '#172B4D' }}>Bill Number</Text>
                        <Text style={{ fontWeight: '700', fontSize: 17, lineHeight: 19.46, color: '#005D7F' }} >{billName}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', margin: 8 }}>
                        <View>
                            <Text style={{ fontWeight: '700', fontSize: 13, lineHeight: 19.46, color: '#005D7F' }}>Clicked Bill</Text>
                            <Image
                                source={{ uri: image }}
                                style={{ borderRadius: 8, width: 104, height: 104 }}
                            />
                        </View>
                        <View>
                            <Text style={{ fontWeight: '700', fontSize: 13, lineHeight: 19.46, color: '#005D7F' }}>Clicked Vehicle</Text>
                            <View style={{ borderWidth: 1, borderRadius: 8, width: 104, height: 104 }}>
                                <Icon
                                    name='plus'
                                    size={20}
                                    color={'#000000'}
                                    style={{ alignSelf: 'center', marginVertical: 36 }}
                                />
                            </View>
                        </View>
                    </View>
                    {/* <TouchableOpacity onPress={() => setShow(!show)} style={{ marginTop: '5%' }} >
                        <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'flex-start' }}>
                            <Text style={{ fontWeight: '500', fontSize: 16, lineHeight: 19.8, color: '#172B4D80' }}>ProductionSlips with this Bill</Text>
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
                        {show && item.productionSlipNumbers &&
                            <FlatList
                                data={item.productionSlipNumbers}
                                renderItem={({ item, index }) => (
                                    <View style={{ margin: 10 }}>
                                        <Text style={{ fontWeight: '600', fontSize: 12, color: '#000' }}>{item}</Text>
                                    </View>
                                )}
                            />
                        }
                    </TouchableOpacity> */}
                </View>
                <LoadingButton
                    title='Loading Vehicle'
                    onPress={() => navigation.navigate('VehiclePhoto', { billName, image })}
                    buttonStyle={styles.customButtonStyle}
                    textStyle={styles.customButtonTextStyle}
                />
            </View>
        </View>
    )
}

export default SingleBillPage

const styles = StyleSheet.create({
    customButtonStyle: {
        width:'95%',
        alignSelf:'center',
        marginTop: '20%',
    },
    customButtonTextStyle: {
        paddingVertical: 8
    }
})