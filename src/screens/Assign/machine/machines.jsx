import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TextInput, TouchableOpacity, Vibration } from 'react-native';
import axios from 'axios';
import Navbar from '../../Navbar/Navbar';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Picker } from '@react-native-picker/picker';
const Machines = ({ navigation }) => {
    const [originalMachineData, setOriginalMachineData] = useState([]); // Store the original data
    const [machineData, setMachineData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMachineSelected, setIsMachineSelected] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState({ id: '', Name: '', ProcessName: '', ShopName: '' })
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [processName, setprocessName] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [loading, setLoading] = useState(false);
    const fetchMachineData = async () => {
        try {
            const { data } = await axios.post(`https://www.lohawalla.com/api/v1/machine`);
            setOriginalMachineData(data?.machine); // Store the original data
            setMachineData(data?.machine);
        } catch (error) {
            console.error(error);
        }
    };
    const fetchShop = async () => {
        try {
            const res = await axios.post(`https://www.lohawalla.com/api/v1/globalProcess`);
            console.log('processs', res.data.process);
            setprocessName(res.data.process);
            //console.log(jobProfiles.length)
        } catch (err) {
            console.log(err);
        }
    };
    console.log(machineData);
    useEffect(() => {
        fetchMachineData();
        fetchShop();
    }, []);
    const searchData = (searchQuery) => {
        console.log(searchQuery);
        if (!searchQuery) {
            return machineData; // Return all data if no search query
        }
        searchQuery = searchQuery.toLowerCase(); // Convert the search query to lowercase for case-insensitive search
        return machineData.filter((machine) => {
            const machineNameMatch = machine.machineName.toLowerCase().includes(searchQuery);
            const processNameMatch = machine.process[0].processName.toLowerCase().includes(searchQuery);
            return machineNameMatch || processNameMatch
        });
    };

    const searchResults = selectedOption.length > 1 ? searchData(selectedOption) : searchData(searchQuery)
    console.log(searchResults);
    const handleCardClick = (id, Name, ProcessName, ShopName) => {
        console.log(id, Name, ProcessName, ShopName);
        setSelectedMachine({ id, Name, ProcessName, ShopName });
        setShowAlert(true);
        Vibration.vibrate();
        setAlertMessage(`Your Selections: ${Name}`);
        setIsMachineSelected(true);
    }
    const handlePress = () => {
        console.log("6546644811611894", selectedMachine);
        if (isMachineSelected) {
            navigation.navigate('machineQr', { selectedMachine });
            console.log(selectedMachine);
        } else {
            // Show an alert or take appropriate action when no employee is selected
            // For example:
            setShowAlert(true);
            setAlertMessage('Please select an employee before proceeding.');
        }
    };
    if (loading) {
        return (
            <View style={styles.container55}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }
    return (
        <View>
            <Navbar  navigation={navigation}/>
            <AwesomeAlert
                show={showAlert}
                title='Alert!'
                showConfirmButton={true}
                confirmText='ok'
                onConfirmPressed={() => setShowAlert(false)}
                onCancelPressed={() => {
                    setSelectedMachine({ id: '', Name: '', ProcessName: '', ShopName: '' })
                    setShowAlert(false)
                    setIsMachineSelected(false)
                }}
                showCancelButton={true}
                cancelText='cancel'
                onDismiss={() => console.log('dismissed')}
                message={alertMessage}
            />
            <View style={{ backgroundColor: 'white'}}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', }}>
                    <View><Text style={{ fontSize: 20, color: '#000', marginLeft: "1.5%", marginBottom: "2%" }}>Machines:</Text></View>
                    <View style={{
                        width: '42%',
                        backgroundColor: 'white',
                        borderColor: '#DEDEDE',
                        borderRadius: 10,
                        borderWidth: 1,
                    }}>
                        <Picker
                            style={{
                                color: 'black',
                                fontWeight: '600',
                            }}
                            selectedValue={selectedOption}
                            onValueChange={(itemValue) => setSelectedOption(itemValue)}
                        >
                            <Picker.Item label="Process" value='' />
                            {processName.map((item, index) => (
                                <Picker.Item
                                    label={item.processName}
                                    value={item.processName}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>
                <View style={{ marginTop: "3%", width: "98%", marginLeft: "1.1%" }}>
                    <TextInput
                        placeholder="Search by machine name"
                        value={searchQuery}
                        onChangeText={text => setSearchQuery(text)}
                        style={styles.searchInput}
                    />
                </View>
                <View style={{ maxHeight: '78%' }}>
                    <FlatList
                        data={searchResults}
                        renderItem={({ item }) => (
                            <View>
                                <TouchableOpacity onPress={() => handleCardClick(item._id, item.machineName, item.process[0]?.processName, item.process[0]?.shop.shopName)}>
                                    <View style={styles.card}>
                                        <Text style={{ fontSize: 20, color: '#000' }}>Machine Name: {item.machineName}</Text>
                                        <Text style={{ color: '#000' }}>Process Name: {item.process[0]?.processName}</Text>
                                        <Text style={{ color: '#000' }}>Shop Name: {item.process[0]?.shop.shopName}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    <View style={styles.confirmButtonContainer}>
                        <TouchableOpacity
                            onPress={handlePress}
                            style={[
                                styles.confirmButton,
                                { backgroundColor: isMachineSelected ? '#283093' : '#ccc' }, // Enable or disable button based on selection
                            ]}
                            disabled={!isMachineSelected} // Disable the button when no employee is selected
                        >
                            <Text style={styles.confirmButtonText}>Confirm Machine</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
    },
    searchButton: {
        backgroundColor: '#283093',
        color: 'white',
        padding: 8,
        borderRadius: 8,
        textAlign: 'center',
        marginBottom: 8,
    },
    confirmButtonContainer: {
        justifyContent: "flex-end",
        alignItems: "center",
        padding: 20,
    },
    confirmButton: {
        backgroundColor: "#283093",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 5,
    },
    confirmButtonText: {
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
    },
    container55: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // Background color
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333', // Text color
    },
    container55: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // Background color
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333', // Text color
    },
});
export default Machines;
