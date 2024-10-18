import { StyleSheet, Text, View, Image, TouchableOpacity, Vibration } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import AwesomeAlert from 'react-native-awesome-alerts';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { RBASE_URL } from '../../../config';
import Navbar from '../../Navbar/Navbar';
const machineFinal = ({ navigation }) => {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false); // New state to track confirmation
    const route = useRoute();
    const { total } = route.params || {};
    console.log(total.requestBody.data);
    const machineId = total.requestBody.machineId
    console.log('Final', total.requestBody);
    const apiUrl = `${RBASE_URL}/machine/assignQr`;
    console.log("IM calling from Final", total);
    const handleConfirm = async () => {
        Vibration.vibrate();
        setShowAlert(true);
        setAlertMessage(`Press ok to Assign`);
    }
    console.log(total.requestBody.data);
    const handleAlertConfirm = async () => {
        // This function will be called when the user presses "ok" on the AwesomeAlert
        setIsConfirmed(true);
        setShowAlert(false);
        try {
            await axios.post(`${apiUrl}/${machineId}`, { data: total.requestBody.data });
            // Comment out the alert('Assigneed Successfully') line
            showMessage({
                message: "Assigned Successfully,Welcome to Chawla Ispat Team!",
                type: "success",
                floating: true
            })
            Vibration.vibrate();
            navigation.navigate('Home');
        } catch (err) {
            // alert('Error:',err.response.data.message );
            showMessage({
                message: err.response.data.message, // Typo fix: 'messgae' to 'message'
                type: 'info',
                duration: 5000,
                floating: true,
            });
            navigation.navigate("Home")
            console.log("Error during Assign ", err.response.data.message);
        }
    };
    // console.log(total.selectedEmployee.Profile.uri);
    return (
        <View style={styles.container}>
            <FlashMessage/>
            {/* Navbar with Metalogo Image */}
            <Navbar navigation={navigation} />
            {/* Main Content */}
            <AwesomeAlert
                show={showAlert}
                title='Alert!'
                showConfirmButton={true}
                confirmText='ok'
                onConfirmPressed={handleAlertConfirm}
                onCancelPressed={() => setShowAlert(false)}
                showCancelButton={true}
                cancelText='cancel'
                onDismiss={() => console.log('dismissed')}
                message={alertMessage}
                alertContainerStyle={styles.alertContainer}
                confirmButtonStyle={styles.confirmButtonStyle}
                cancelButtonStyle={styles.cancelButtonStyle}
                style={{ width: '50%' }}
            />
            <View style={styles.content}>
                <Text style={{ color: 'black', fontSize: 30, marginBottom: 30 }}>Assign this QR to:{total.selectedMachine.Name}</Text>
                {/* Box Card */}
                <View style={styles.boxCard}>
                    {/* Render ProfilePic */}
                    {/* <Image style={styles.profilePic} source={{ uri: total.selectedEmployee.Profile.uri }} /> */}
                    {/* Render Name */}
                    <Text style={styles.name}>Name: {total.selectedMachine.Name}</Text>
                    {/* Render Department Name */}
                    <Text style={styles.departmentName}>Process Name: {total.selectedMachine.ProcessName}</Text>
                    {/* Render Department ID */}
                    <Text style={styles.departmentId}>
                        Shop Name: {total.selectedMachine.ShopName ? total.selectedMachine.ShopName : "Not present"}
                    </Text>
                </View>
                {/* ConfirmButton */}
                <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>Confirm Machine</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Center contents vertically
        padding: 16,
        backgroundColor: '#283093',
    },
    frameParent: {
        flexDirection: "row", // Added to position contents to the extreme ends
        paddingHorizontal: 40,
        paddingVertical: 40,
        borderWidth: 1,
        borderColor: "#dedede",
        backgroundColor: "#F4F4F4",
    },
    metalogoParent: {
        flexDirection: "row",
        alignItems: "center",
    },
    metalogoIcon: {
        width: 28,
        height: 28,
    },
    chawlaIspatWrapper: {
        marginLeft: 6.13,
    },
    chawlaIspat: {
        fontSize: 18,
        color: "#0366D6",
    },
    security: {
        marginLeft: "auto", // Remove this line to position "Security" on the extreme right
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    boxCard: {
        backgroundColor: '#F4F4F4',
        padding: '2%',
        width: '100%',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 4,
        alignItems: 'center',
        flex: 1
    },
    profilePic: {
        width: '100%', // Adjust the width to your desired percentage
        aspectRatio: 1, // To maintain aspect ratio and make the image circular
        borderRadius: 150, // To make it circular
        marginBottom: '4%',
    },
    name: {
        color: 'black',
        fontWeight: '580',
        fontSize: 25,
        marginBottom: '4%',
    },
    departmentName: {
        color: 'black',
        marginBottom: '4%',
        fontSize: 16,
        marginBottom: '4%',
    },
    departmentId: {
        color: 'black',
        fontSize: 15.5,
        marginBottom: '4%',
    },
    confirmButton: {
        backgroundColor: '#283093',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 5,
        marginTop: 20,
    },
    confirmButtonText: {
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
});
export default machineFinal