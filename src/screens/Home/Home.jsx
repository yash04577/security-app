import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ToastAndroid,
} from 'react-native';
import { Padding, FontFamily, Color, FontSize } from './GlobalStyles';
import Navbar from '../Navbar/Navbar';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import axios from 'axios';
import { RBASE_URL } from '../../config';
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Fontisto';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { Camera } from 'react-native-vision-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Modal from 'react-native-modal';
import { useAuthContext } from '../../auth/AuthGuard';
import LoadingButton from '../../components/loading/LoadingButton';
const Button = ({ children, ...props }) => (
  <TouchableOpacity style={styles.button1} {...props}>
    <Text style={styles.buttonText1}>{children}</Text>
  </TouchableOpacity>
);
const NoInternetModal = ({ show, onRetry, isRetrying }) => (
  <Modal isVisible={show} style={styles.modal} animationInTiming={600}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Connection Error</Text>
      <Text style={styles.modalText}>
        Oops! Looks like your device is not connected to the Internet. ( उफ़! ऐसा लगता है कि आपका उपकरण इंटरनेट से कनेक्ट नहीं है. )
      </Text>
      <Button onPress={onRetry} disabled={isRetrying}>
        Check your Connectivity
      </Button>
    </View>
  </Modal>
);
const Home = ({ navigation }) => {
  const currentTime = new Date();
  const [numberOfPunchIns, setNumberOfPunchIns] = useState(0);
  const [numberOfPunchedOut, setNumberOfPunchedOut] = useState(0);
  // const { loginres } = React.useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isOffline, setOfflineStatus] = useState(false);
  const auth = useAuthContext();
  const [isDayButtonDisabled, setIsDayButtonDisabled] = useState(true);
  const [isNightButtonDisabled, setIsNightButtonDisabled] = useState(true);
  const enableDayButton = () => {
    setIsDayButtonDisabled(false);
  };
  const disableDayButton = () => {
    setIsDayButtonDisabled(true);
  };
  const enableNightButton = () => {
    setIsNightButtonDisabled(false);
  };
  const disableNightButton = () => {
    setIsNightButtonDisabled(true);
  };
  function getCurrentTime() {
    const current = new Date();
    const hours = current.getHours();
    const minutes = current.getMinutes();
    const seconds = current.getSeconds();
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  const updateButtonStatus = () => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isDayButtonDisabled = currentHour < 6 || currentHour >= 23;
    const isNightButtonDisabled = currentHour < 19 && currentHour >= 9
    setIsDayButtonDisabled(isDayButtonDisabled);
    setIsNightButtonDisabled(isNightButtonDisabled);
  };
  useEffect(() => {
    const updateButtonStatusWithSeconds = () => {
      updateButtonStatus();
    };
    const timerInterval = setInterval(() => {
      updateButtonStatusWithSeconds();
    }, 1000);
    updateButtonStatusWithSeconds();
    return () => clearInterval(timerInterval);
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    updateButtonStatus();
    setRefreshing(false);
  };
  useEffect(() => {
    const fetchDataAndUpdateStatus = () => {
      fetchData();
      updateButtonStatus();
    };
    const timerInterval = setInterval(() => {
      fetchDataAndUpdateStatus();
    }, 6 * 60 * 60 * 1000);
    fetchDataAndUpdateStatus();
    return () => clearInterval(timerInterval);
  }, []);
  const checkCameraPermission = async () => {
    let status = await Camera.getCameraPermissionStatus();
    if (status !== 'authorized') {
      await Camera.requestCameraPermission();
      status = await Camera.getCameraPermissionStatus();
      if (status === 'denied') {
        showToast(
          'You will not be able to scan if you do not allow camera access',
        );
      }
    }
  };
  useEffect(() => {
    checkCameraPermission();
  }, []);
  console.log(auth.authData);
  const handleLogout = () => {
    auth.actions.logout()
    // alert('Logout successful');
    // ToastAndroid.show('Logout successful!', ToastAndroid.SHORT)
    ToastAndroid.showWithGravityAndOffset(
      'Logout successful!',
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      0,
      50
    )
    showMessage({
      message: "Logout successful",
      type: 'success',
      floating: true
    })
    // navigation.navigate('Login');
  };
  useLayoutEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setOfflineStatus(offline);
    });
    fetchData();
    return () => removeNetInfoSubscription();
  }, [numberOfPunchIns, numberOfPunchedOut]);
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://www.lohawalla.com/api/v2/attendance/getPunchInPunchOut?date=${new Date().toISOString().split('T')[0]}`);
      const jsonData = await response.json();
      // console.log("7080149094",new Date().toISOString().split('T')[0]);
      console.log("7080149094", await AsyncStorage.getItem("userInfo"));
      const userData = jsonData.punchIn.length;
      const logoutData = jsonData.punchOut.length;
      console.log(userData, logoutData);
      setNumberOfPunchIns(userData);
      setNumberOfPunchedOut(logoutData);
      isOffline && setOfflineStatus(false);
    } catch (err) {
      console.error('Error fetching data:', err.response.data.message);
    }
    setLoading(false);
  };
  return (
    <View style={styles.container}>
      <FlashMessage />
      <Navbar navigation={navigation} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <SafeAreaView>
          {/* Parent View to contain the "Logs" text and "See all records" button */}
          <View style={styles.logsContainer}>
            <Text style={styles.logsText}>Logs</Text>
            <View>
              <TouchableOpacity style={{ marginBottom: 10 }} onPress={() => navigation.navigate('Logs')}>
                <Text style={styles.seeAllText}>See all records{<Icon name='chevron-right' />}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardNumber}>{numberOfPunchIns}</Text>
              </View>
              <Text style={styles.cardText}>Punch-ins</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, styles.cardMargin]}>
              <View style={styles.cardContent}>
                <Text style={styles.cardNumber}>{numberOfPunchedOut}</Text>
              </View>
              <Text style={styles.cardText}>Punch-outs</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            {(auth.authData?.role?.toLowerCase() === 'admin' ||
              auth.authData?.jobProfileId?.jobProfileName?.toLowerCase() === 'security head' ||
              auth.authData?.jobProfileId?.jobProfileName?.toLowerCase() === 'hr') ? (
              <>
                <TouchableOpacity style={styles.assignButton} onPress={() => navigation.navigate('Assign')}>
                  <Image style={styles.plusIcon} resizeMode="cover" source={require('../../../assets/plus.png')} />
                  <Text style={[styles.buttonText, styles.assignText]}>Assign QR Code</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={[styles.punchButton, isDayButtonDisabled && styles.disabledButton]}
                    onPress={() => {
                      if (!isDayButtonDisabled) {
                        navigation.navigate('Punchin', { "shift": "day" });
                      }
                    }}
                  >
                    <Entypo name='day-haze' color={isDayButtonDisabled ? 'gray' : 'white'} size={25} style={{ marginLeft: -10 }} />
                    <View style={{ flexDirection: 'column', alignItems: "center" }}>
                      <Text style={[styles.buttonText, styles.punchText, isDayButtonDisabled && styles.disabledButtonText]}>दिन (IN/OUT)</Text>
                      <Text style={{ color: 'white' }}>(6am-11pm)</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.punchButton, { width: 150 }, isNightButtonDisabled && styles.disabledButton]}
                    onPress={() => {
                      if (!isNightButtonDisabled) {
                        navigation.navigate('Punchin', { "shift": "night" });
                      }
                    }}
                  >
                    <Entypo name='night-clear' color={isNightButtonDisabled ? 'gray' : 'white'} size={25} style={{ marginLeft: -10 }} />
                    <View style={{ flexDirection: 'column', alignItems: "center" }}>
                      <Text style={[styles.buttonText, styles.punchText, isDayButtonDisabled && styles.disabledButtonText]}>रात (IN/OUT)</Text>
                      <Text style={{ color: 'white' }}>(7pm-9am)</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[styles.punchButton, isDayButtonDisabled && styles.disabledButton]}
                  onPress={() => {
                    if (!isDayButtonDisabled) {
                      navigation.navigate('Punchin', { "shift": "day" });
                    }
                  }}
                >
                  <Entypo name='day-haze' color={isDayButtonDisabled ? 'gray' : 'white'} size={25} style={{ marginLeft: -10 }} />
                  <View style={{ flexDirection: 'column', alignItems: "center" }}>
                    <Text style={[styles.buttonText, styles.punchText, isDayButtonDisabled && styles.disabledButtonText]}>दिन (IN/OUT)</Text>
                    <Text style={{ color: 'white' }}>(6am-11pm)</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.punchButton, { width: 150 }, isNightButtonDisabled && styles.disabledButton]}
                  onPress={() => {
                    if (!isNightButtonDisabled) {
                      navigation.navigate('Punchin', { "shift": "night" });
                    }
                  }}
                >
                  <Entypo name='night-clear' color={isNightButtonDisabled ? 'gray' : 'white'} size={25} style={{ marginLeft: -10 }} />
                  <View style={{ flexDirection: 'column', alignItems: "center" }}>
                    <Text style={[styles.buttonText, styles.punchText, isDayButtonDisabled && styles.disabledButtonText]}>रात (IN/OUT)</Text>
                    <Text style={{ color: 'white' }}>(7pm-9am)</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View>
            <LoadingButton
              title='Loading'
              onPress={() => navigation.navigate('Loading')}
              buttonStyle={styles.customButtonStyle}
              textStyle={styles.customButtonTextStyle} />
          </View>
        </SafeAreaView>
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Image
            style={styles.signoutIcon}
            resizeMode="cover"
            source={require('../../../assets/signout.png')}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <NoInternetModal
        show={isOffline}
        onRetry={fetchData}
        isRetrying={isLoading}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  disabledButtonText: {
    color: 'gray',
  },
  disabledButton: {
    opacity: 0.5,
  },
  ScrollView: {
    height: '100%'
  },
  logsContainer: {
    paddingHorizontal: Padding.p_xl,
    marginTop: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logsText: {
    color: 'black',
    fontSize: 24,
    fontFamily: FontFamily.interMedium,
    fontWeight: '700'
  },
  seeAllText: {
    color: '#666666',
    fontSize: 14,
    fontFamily: FontFamily.interMedium,
    textDecorationLine: 'underline',
    fontWeight: '500'
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Padding.p_xl,
    marginTop: Dimensions.get('window').height * 0.02,
    marginBottom: Dimensions.get('window').height * 0.13,
  },
  card: {
    flex: 1,
    paddingVertical: verticalScale(Padding.p_xl),
    borderRadius: 8,
    paddingHorizontal: Padding.p_base,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dedede',
    backgroundColor: Color.neutralN10,
  },
  cardMargin: {
    marginLeft: Dimensions.get('window').width * 0.05,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cardNumber: {
    fontSize: FontSize.size_5xl,
    fontWeight: '600',
    fontFamily: FontFamily.interSemibold,
    color: Color.blueMainM500,
  },
  cardText: {
    fontSize: FontSize.size_sm,
    color: Color.neutralN600,
    marginTop: 8,
    fontFamily: FontFamily.interMedium,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Padding.p_base,
    marginLeft: '0.8%'
  },
  assignButton: {
    flexDirection: 'row',
    backgroundColor: '#ecedfe',
    height: 88,
    width: '95%',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: '5%',
    paddingHorizontal: '8%'
  },
  punchButton: {
    flexDirection: 'row',
    backgroundColor: Color.blueMainM500,
    height: 70,
    width: '45%',
    borderRadius: 5,
    alignItems: 'center',
    paddingHorizontal: '5%',
    // justifyContent:'space-between'
    margin: 4
  },
  plusIcon: {
    width: '17%',
    height: '57%',
  },
  // plusIcon1: {
  //   width: '20%',
  //   height: '38%',
  //   marginLeft:-5
  // },
  buttonText: {
    fontFamily: FontFamily.interMedium,
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500'
  },
  assignText: {
    color: Color.blueMainM500,
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '500'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: Dimensions.get('window').height * 0.02,
    paddingBottom: Padding.p_5xs,
    borderWidth: 1,
    borderColor: '#dedede',
    backgroundColor: Color.neutralN10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '38%',
  },
  signoutIcon: {
    width: 25,
    height: 25,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 20,
    color: Color.blueMainM500,
    fontFamily: FontFamily.interMedium,
  }, container: {
    ...StyleSheet.absoluteFillObject,
  },
  user: {
    width: Dimensions.get('screen').width - 32,
    alignSelf: 'center',
    marginVertical: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    marginLeft: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  name: {
    color: '#424242',
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    marginTop: 6,
    color: '#888',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  button1: {
    backgroundColor: Color.blueMainM500,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText1: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  punchText: {
    color: 'white',
  },
  customButtonStyle: {
    width: '85%',
    alignSelf: 'center',
    backgroundColor: '#283093'
  },
  customButtonTextStyle: {
    paddingVertical: 15
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default Home;











































