import React, { useEffect, useState } from 'react';
import {
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  ToastAndroid,
} from 'react-native';
import axios from 'axios';
import login from './fetch/services/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import { useAuthContext } from '../../auth/AuthGuard';
import Feather from 'react-native-vector-icons/Feather';
import NetInfo from '@react-native-community/netinfo';
import Modal from 'react-native-modal';
import LoadingScreen from '../loading/LoadingScreen';
import DeviceInfo from 'react-native-device-info';
import { useAuth } from '../../context/AuthProvider';
import Sound from 'react-native-sound';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOffline, setOfflineStatus] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const { userAgent, ipAddress, platform } = useAuth();
  console.log(userAgent, ipAddress, platform);
  const auth = useAuthContext();
  const playInSound = () => {
    // Load the audio file (replace 'your_sound.mp3' with your audio file path)
    const sound = new Sound('welcome.mp3', Sound.MAIN_BUNDLE, (error) => {
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
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  async function fetchIpAddress() {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      const ipAddress = response.data.ip;
      const userAgent = DeviceInfo.getUserAgent();
      const platform = DeviceInfo.getSystemName();
      // Now you can use the ipAddress variable
      console.log('IP Address:', ipAddress, userAgent, platform);
    } catch (error) {
      console.error('Error fetching IP address:', error);
    }
  }
  fetchIpAddress();
  const handleLogin = async () => {
    const isEmail = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      email
    );
    console.log(userAgent, ipAddress, platform);
    const data = isEmail ? { email, password, userAgent, ipAddress, platform } : { phone: +email, password, userAgent, ipAddress, platform };
    console.log("I am data", data);
    try {
      const res = await login(data);
      auth.actions.login(res.data.user)
      console.log("78941796525", res.data.user);
      console.log("Calling Auth", auth.actions.login(res.data.user));
      // ToastAndroid.show('Login sent successfully!', ToastAndroid.SHORT);
      isOffline && setOfflineStatus(false);
      showMessage({
        message: "Login Success",
        type: "success",
        duration: 5000,
        floating: true
      });
      playInSound()
    } catch (error) {
      console.error("Login error:", error?.response.data.success);
      if (error?.response.data.success == false) {
        showMessage({
          message: "Login failed",
          type: "danger",
          duration: 5000,
          floating: true
        });
      }
    }
    setLoading(false);
  };
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
  useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setOfflineStatus(offline);
    });
    return () => removeNetInfoSubscription();
  }, [])
  if (!isLoading) {
    return (
      <View style={styles.container55}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlashMessage />
      <View style={styles.wrapper}>
        <View style={styles.loginForm}>
          <Text style={styles.heading}>Security Login</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email or Phone Number</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={text => setEmail(text)}
              placeholder='Email or Phone Number....'
              placeholderTextColor={'#B0B0B0'}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry={!showPassword}
                placeholder='Password'
                placeholderTextColor={'#B0B0B0'}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={togglePasswordVisibility}
              ><Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={'black'}
                /></TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
        <NoInternetModal
          show={isOffline}
          isRetrying={isLoading}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    width: '90%',
  },
  loginForm: {
    justifyContent: 'center',
  },
  heading: {
    color: 'black',
    fontFamily: 'Inter',
    fontWeight: '700',
    paddingVertical: 30,
    fontSize: 25,
  },
  inputContainer: {
    paddingBottom: 15,
  },
  label: {
    color: 'black',
    fontWeight: '400',
    fontFamily: 'Inter',
    paddingBottom: 10,
    marginRight: 12,
    paddingTop: 12,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 5,
    paddingHorizontal: 14,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    color: 'black',
  },
  eyeButton: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: '#283093',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    borderRadius: 5,
    marginTop: 10,
    width: '30%',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  buttonText: {
    color: 'white',
    paddingLeft: 10,
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
    backgroundColor: "#283093",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText1: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
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
export default Login;
