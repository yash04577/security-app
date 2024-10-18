import { StyleSheet, Text, View, Image, TouchableOpacity, Vibration, Modal, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import Navbar from './Navbar/Navbar';
import { RBASE_URL } from '../config';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
const MarkPunchin = ({ navigation }) => {
    Sound.setCategory('Playback');
    const [punch, setPunch] = useState('')
    const [timeLeft, setTimeLeft] = useState(null);
    const route = useRoute();
    const [isModalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { total, picture, show, shift, attendanceRecord, message } = route.params || {};
    // const timeArray = attendanceRecord ? ((attendanceRecord[attendanceRecord.length - 1].punchIn)) : null
    console.log("Hellow meoow", message);

    function hasTwoMinutesPassed(timeArray) {
        console.log("One minute have passed!", timeArray);
        const [dateString, timeString] = timeArray.split('T');
        const [year, month, day] = dateString.split('-').map(Number);
        const [hours, minutes, seconds] = timeString.split('.')[0].split(':').map(Number);
        const currentTime = new Date();
        const currentYear = currentTime.getFullYear();
        const currentMonth = currentTime.getMonth() + 1; // Months are zero-based
        const currentDay = currentTime.getDate();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const currentSeconds = currentTime.getSeconds();
        if (currentYear === year && currentMonth === month && currentDay === day) {
            const totalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
            console.log(totalSeconds);
            const targetTotalSeconds = hours * 3600 + minutes * 60 + seconds;
            console.log(targetTotalSeconds);
            const timeDifference = totalSeconds - targetTotalSeconds;
            console.log(timeDifference);
            const twoMinutesInSeconds = 60; // Two minutes in seconds
            const timeLeftInSeconds = twoMinutesInSeconds - timeDifference;
            return {
                timePassed: timeDifference >= twoMinutesInSeconds,
                timeLeft: timeLeftInSeconds
            };
        } else {
            // Different date, two minutes haven't passed
            return {
                timePassed: true,
                timeLeft: 0 // or you can use a different value to indicate a different day
            };
        }
    }
    if (attendanceRecord != null) {
        if (attendanceRecord && attendanceRecord[attendanceRecord.length - 1].punchIn && attendanceRecord[attendanceRecord.length - 1].punchOut == null) {
            const timeArray = attendanceRecord ? ((attendanceRecord[attendanceRecord.length - 1].punchIn)) : null
            useEffect(() => {
                const calculateTimeLeft = () => {
                    const { timeLeft, timePassed } = hasTwoMinutesPassed(timeArray);
                    if (timePassed) {
                        setTimeLeft("One minute have passed!");
                    } else {
                        const minutes = Math.floor(timeLeft / 60);
                        const seconds = timeLeft % 60;
                        setTimeLeft(`Time left: ${minutes} minutes and ${seconds} seconds`);
                    }
                };
                calculateTimeLeft();
                // Update the timer every second (1000 milliseconds)
                const timerInterval = setInterval(calculateTimeLeft, 1000);
                // Clean up the interval when the component unmounts
                return () => clearInterval(timerInterval);
            }, [timeArray]);
        } else {
            const timeArray = attendanceRecord ? ((attendanceRecord[attendanceRecord.length - 1].punchOut)) : null
            useEffect(() => {
                const calculateTimeLeft = () => {
                    const { timeLeft, timePassed } = hasTwoMinutesPassed(timeArray);
                    if (timePassed) {
                        setTimeLeft("One minute have passed!");
                    } else {
                        const minutes = Math.floor(timeLeft / 60);
                        const seconds = timeLeft % 60;
                        setTimeLeft(`Time left: ${minutes} minutes and ${seconds} seconds`);
                    }
                };
                calculateTimeLeft();
                // Update the timer every second (1000 milliseconds)
                const timerInterval = setInterval(calculateTimeLeft, 1000);
                // Clean up the interval when the component unmounts
                return () => clearInterval(timerInterval);
            }, [timeArray]);
        }

    }
    console.log("I am calling from mark Punch", attendanceRecord)
    let str1 = 'Mark'
    console.log(total);
    let id = total._id;
    const apiUrl = `https://www.lohawalla.com/api/v2/attendance/v2/addAttendance`;
    const profilePicSource = picture && picture.length > 0
        ? { uri: picture } // Use the first image URI from the 'picture' array
        : { uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' };
    const nUrl = `${RBASE_URL}/notifications`
    console.log(profilePicSource);
    const playOutSound = () => {
        // Load the audio file (replace 'your_sound.mp3' with your audio file path) Sound is played in the context of Punch-Ou
        const sound = new Sound('punch_inn.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.error('Failed to load the sound', error);
                return;
            }
            // Loaded successfully, now play the sound
            sound.play((success) => {
                if (success) {
                    console.log('Sound played successfully');
                } else {
                    console.error('Sound did not play');
                }
            });
        });
    }
    const playInSound = () => {
        // Load the audio file (replace 'your_sound.mp3' with your audio file path)
        const sound = new Sound('punch_out.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.error('Failed to load the sound', error);
                return;
            }
            // Loaded successfully, now play the sound sound is played successfully in the context of Punch-In
            sound.play((success) => {
                if (success) {
                    console.log('Sound played successfully');
                } else {
                    console.error('Sound did not play');
                }
            });
        });
    }
    const handleYes = async () => {
        setModalVisible(false);
        if (attendanceRecord && attendanceRecord[attendanceRecord.length - 1].punchIn && attendanceRecord[attendanceRecord.length - 1].punchOut == null) {
            const timeArray = (attendanceRecord[attendanceRecord.length - 1].punchIn)
            console.log("2222222222111111111", hasTwoMinutesPassed(timeArray).timePassed);
            console.log("2222222222111111111", hasTwoMinutesPassed(timeArray).timeLeft);
            if (hasTwoMinutesPassed(timeArray).timePassed == true) {
                setLoading(true)
                try {
                    const response = await axios.post(apiUrl, { id, shift });
                    console.log("Calling from Mark Punch In", response.data);
                    const { success, message } = response.data;
                    if (success) {
                        Vibration.vibrate();
                        showMessage({
                            message: message,
                            type: 'success',
                            duration: 5000,
                            floating: true
                        });
                        show == 'punch out' || show == 'Punch Out after 1 min' ? playOutSound() : playInSound();
                        // const notificationData = { id, notificationType: 'Attendance', message: `Attendance of ${total.name} ${show}` };
                        // await axios.post(nUrl, notificationData);
                        setLoading(false);
                        navigation.navigate('Home');
                    } else {
                        alert('Login first as Security.');
                    }
                } catch (error) {
                    showMessage({
                        message: error.response?.data?.message || 'An error occurred',
                        type: 'info',
                        duration: 5000,
                        floating: true
                    });
                    setLoading(false);
                    console.error('Error:', error);
                }
            } else {
                alert("Please Wait For " + timeLeft + " Seconds.पंच-इन और पंच-आउट के बीच का अंतर 1 मिनट होना चाहिए")
                showMessage({
                    message: hasTwoMinutesPassed(timeArray).timeLeft,
                    type: 'info',
                    duration: 5000,
                    floating: true
                });
            }
        } else if (attendanceRecord && attendanceRecord[attendanceRecord.length - 1].punchOut && attendanceRecord[attendanceRecord.length - 1].punchOut !== null) {
            const timeArray = (attendanceRecord[attendanceRecord.length - 1].punchOut)
            console.log("2222222222111111111", hasTwoMinutesPassed(timeArray).timePassed);
            console.log("2222222222111111111", hasTwoMinutesPassed(timeArray).timeLeft);
            if (hasTwoMinutesPassed(timeArray).timePassed == true) {
                setLoading(true);
                try {
                    const response = await axios.post(apiUrl, { id, shift });
                    console.log("Calling from Mark Punch In", response.data);
                    const { success, message } = response.data;
                    if (success) {
                        Vibration.vibrate();
                        showMessage({
                            message: message,
                            type: 'success',
                            duration: 5000,
                            floating: true
                        });
                        show == 'punch out' || show == 'Punch Out after 1 min' ? playOutSound() : playInSound();
                        // const notificationData = { id, notificationType: 'Attendance', message: `Attendance of ${total.name} ${show}` };
                        // await axios.post(nUrl, notificationData);
                        setLoading(false);
                        navigation.navigate('Home');
                    } else {
                        setLoading(false);
                        alert('Login first as Security.');
                    }
                } catch (error) {
                    showMessage({
                        message: error.response?.data?.message || 'An error occurred',
                        type: 'info',
                        duration: 5000,
                        floating: true
                    });
                    setLoading(false);
                    console.error('Error:', error);
                }
            } else {
                alert("Please Wait For " + timeLeft + " Seconds.पंच-इन और पंच-आउट के बीच का अंतर 1 मिनट होना चाहिए")
                showMessage({
                    message: hasTwoMinutesPassed(timeArray).timeLeft,
                    type: 'info',
                    duration: 5000,
                    floating: true
                });
            }
        } else {
            setLoading(true);
            try {
                const response = await axios.post(apiUrl, { id, shift });
                console.log("Calling from Mark pUnch in ", response.data);
                const { success, message } = response.data;
                if (success) {
                    Vibration.vibrate();
                    showMessage({
                        message: message,
                        type: 'success',
                        duration: 5000,
                        floating: true
                    });
                    show == 'punch out' ? playOutSound() : playInSound();
                    // const notificationData = { id, notificationType: 'Attendance', message: `Attendance of ${total.name} ${show}` };
                    // axios.post(nUrl, notificationData);
                    setLoading(false);
                    navigation.navigate('Home');
                } else {
                    setLoading(false);
                    alert('Login first as Security.');
                }
            } catch (error) {
                showMessage({
                    message: error.response?.data?.message || 'An error occurred',
                    type: 'info',
                    duration: 5000,
                    floating: true
                });
                setLoading(false);
                console.error('Error:', error);
            }
        }
    };

    const handleNo = () => {
        setModalVisible(false);
        navigation.navigate('Home')
    };
    const handleConfirm = async () => {
        if (shift === 'day' && message === "punch out night" || shift === 'night' && message === "punch out day") {
            setModalVisible(true)
            return
        }
        console.log({ id, shift });
        if (attendanceRecord && attendanceRecord[attendanceRecord.length - 1].punchIn && attendanceRecord[attendanceRecord.length - 1].punchOut == null) {
            const timeArray = (attendanceRecord[attendanceRecord.length - 1].punchIn)
            console.log("2222222222111111111", hasTwoMinutesPassed(timeArray).timePassed);
            console.log("2222222222111111111", hasTwoMinutesPassed(timeArray).timeLeft);
            if (hasTwoMinutesPassed(timeArray).timePassed == true) {
                setLoading(true)
                try {
                    const response = await axios.post(apiUrl, { id, shift });
                    console.log("Calling from Mark Punch In", response.data);
                    const { success, message } = response.data;
                    if (success) {
                        Vibration.vibrate();
                        showMessage({
                            message: message,
                            type: 'success',
                            duration: 5000,
                            floating: true
                        });
                        show == 'punch out' || show == 'Punch Out after 1 min' ? playOutSound() : playInSound();
                        // const notificationData = { id, notificationType: 'Attendance', message: `Attendance of ${total.name} ${show}` };
                        // await axios.post(nUrl, notificationData);
                        setLoading(false);
                        navigation.navigate('Home');
                    } else {
                        alert('Login first as Security.');
                    }
                } catch (error) {
                    showMessage({
                        message: error.response?.data?.message || 'An error occurred',
                        type: 'info',
                        duration: 5000,
                        floating: true
                    });
                    setLoading(false);
                    console.error('Error:', error);
                }
            } else {
                alert("Please Wait For " + timeLeft + " Seconds.पंच-इन और पंच-आउट के बीच का अंतर 1 मिनट होना चाहिए")
                showMessage({
                    message: hasTwoMinutesPassed(timeArray).timeLeft,
                    type: 'info',
                    duration: 5000,
                    floating: true
                });
            }
        } else if (attendanceRecord && attendanceRecord[attendanceRecord.length - 1].punchOut && attendanceRecord[attendanceRecord.length - 1].punchOut !== null) {
            const timeArray = (attendanceRecord[attendanceRecord.length - 1].punchOut)
            console.log("2222222222111111111", hasTwoMinutesPassed(timeArray).timePassed);
            console.log("2222222222111111111", hasTwoMinutesPassed(timeArray).timeLeft);
            if (hasTwoMinutesPassed(timeArray).timePassed == true) {
                setLoading(true);
                try {
                    const response = await axios.post(apiUrl, { id, shift });
                    console.log("Calling from Mark Punch In", response.data);
                    const { success, message } = response.data;
                    if (success) {
                        Vibration.vibrate();
                        showMessage({
                            message: message,
                            type: 'success',
                            duration: 5000,
                            floating: true
                        });
                        show == 'punch out' || show == 'Punch Out after 1 min' ? playOutSound() : playInSound();
                        // const notificationData = { id, notificationType: 'Attendance', message: `Attendance of ${total.name} ${show}` };
                        // await axios.post(nUrl, notificationData);
                        setLoading(false);
                        navigation.navigate('Home');
                    } else {
                        setLoading(false);
                        alert('Login first as Security.');
                    }
                } catch (error) {
                    showMessage({
                        message: error.response?.data?.message || 'An error occurred',
                        type: 'info',
                        duration: 5000,
                        floating: true
                    });
                    setLoading(false);
                    console.error('Error:', error);
                }
            } else {
                alert("Please Wait For " + timeLeft + " Seconds.पंच-इन और पंच-आउट के बीच का अंतर 1 मिनट होना चाहिए")
                showMessage({
                    message: hasTwoMinutesPassed(timeArray).timeLeft,
                    type: 'info',
                    duration: 5000,
                    floating: true
                });
            }
        } else {
            setLoading(true);
            try {
                const response = await axios.post(apiUrl, { id, shift });
                console.log("Calling from Mark pUnch in ", response.data);
                const { success, message } = response.data;
                if (success) {
                    Vibration.vibrate();
                    showMessage({
                        message: message,
                        type: 'success',
                        duration: 5000,
                        floating: true
                    });
                    show == 'punch out' ? playOutSound() : playInSound();
                    // const notificationData = { id, notificationType: 'Attendance', message: `Attendance of ${total.name} ${show}` };
                    // axios.post(nUrl, notificationData);
                    setLoading(false);
                    navigation.navigate('Home');
                } else {
                    setLoading(false);
                    alert('Login first as Security.');
                }
            } catch (error) {
                showMessage({
                    message: error.response?.data?.message || 'An error occurred',
                    type: 'info',
                    duration: 5000,
                    floating: true
                });
                setLoading(false);
                console.error('Error:', error);
            }
        }
    };
    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, color: 'black', marginBottom: 20 }}>Processing Request......</Text>
                <ActivityIndicator color={'blue'} size={20} />
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <FlashMessage />
            {/* Navbar with Metalogo Image */}
            <Navbar navigation={navigation} />
            {/* Main Content */}
            <View style={styles.content}>
                <Text style={{ color: 'black', fontSize: 22, marginBottom: 10, fontWeight: '700' }}>Confirm To {show} for {shift} </Text>
                <Text style={{ color: 'black', fontSize: 15, marginBottom: 8, fontWeight: '600', textDecorationLine: "underline", color: "#283093" }}>{timeLeft}</Text>
                <View style={styles.boxCard}>
                    {/* Render ProfilePic */}
                    <Image style={styles.profilePic} source={profilePicSource} />
                    {/* Render Name */}
                    <Text style={styles.name}>Name: {total.name}</Text>
                    {/* Render Department Name */}
                    <Text style={styles.departmentName}>Department Role:{total.role}</Text>
                    {/* Render Department ID */}
                    <Text style={styles.departmentId}>Department ID: {total._id}</Text>
                </View>
                {/* ConfirmButton */}
                <TouchableOpacity disabled={loading} onPress={handleConfirm} style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>Confirm Employee {show}</Text>
                </TouchableOpacity>
            </View>
            <View>
                <Modal
                    visible={isModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ backgroundColor: 'white', padding: 40, borderRadius: 10 }}>
                            {/* Display the message in the modal */}
                            <Text style={{ fontSize: 18, color: 'black', marginBottom: 20 }}>{message} Pending</Text>
                            <Text style={{ fontSize: 12, color: 'red', marginBottom: 20, textAlign: 'center' }}>Do you want to Proceed Punch?</Text>
                            {/* Yes and No buttons */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <TouchableOpacity onPress={handleYes} style={{ borderWidth: 1, width: 60, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#f87171' }}>
                                    <Text style={{ color: 'white' }}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleNo} style={{ borderWidth: 1, width: 60, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#22c55e' }}>
                                    <Text style={{ color: 'white' }}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#283093',
        marginLeft: 30
    },
    frameParent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 80,
        paddingVertical: 20,
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
        marginLeft: "auto",
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
        width: '98%',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 4,
        alignItems: 'center',
        flex: 1
    },
    profilePic: {
        width: '90%', // Adjust the width to your desired percentage
        aspectRatio: 1, // To maintain aspect ratio and make the image circular
        borderRadius: 150, // To make it circular
        marginBottom: '4%',
    },
    name: {
        color: 'black',
        fontWeight: '580',
        fontSize: 20,
        marginBottom: '4%',
    },
    departmentName: {
        color: 'black',
        marginBottom: '4%',
        fontSize: 16,
    },
    departmentId: {
        color: 'black',
        fontSize: 15.5,
        marginBottom: '4%',
    },
    confirmButton: {
        backgroundColor: '#283093',
        paddingHorizontal: 30,
        paddingVertical: '8%',
        borderRadius: 5,
        marginBottom: 10,
    },
    confirmButtonText: {
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        fontSize: 16
    },
});
export default MarkPunchin