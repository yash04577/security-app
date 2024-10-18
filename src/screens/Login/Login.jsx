import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { FontFamily, FontSize, Border, Padding, Color } from "./GlobalStyles";
import { Dimensions } from "react-native";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../Navbar/Navbar";
import Feather from 'react-native-vector-icons/Feather';
import FlashMessage from "react-native-flash-message";
const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state variable
  const { login } = React.useContext(AuthContext);
  const handleEmailChange = (text) => {
    setEmail(text);
  };
  const handlePasswordChange = (text) => {
    setPassword(text);
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = () => {
    // Regular expression to check if the input is either a phone number or an email
    login(email, password)
    // Clear email and password fields after login attempt
    setEmail('');
    setPassword('');
    // Navigate to the 'Splash' screen
    navigation.navigate('Splash');
  };
  return (
    <View style={styles.container}>
      <FlashMessage />
      <Navbar />
      <View style={styles.wrapper}>
        <View style={{ justifyContent: 'center' }}>
          <Text style={{
            color: 'black',
            fontFamily: 'Inter',
            fontWeight: '700',
            paddingVertical: 30,
            fontSize: 30,
          }}>Security Login</Text>
        </View>
        <View style={{ paddingBottom: 15 }}>
          <Text style={styles.labelTxt}>Email or Phone Number</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={handleEmailChange}
          />
        </View>
        <View style={{ paddingBottom: 15 }}>
          <Text style={styles.labelTxt}>Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword state
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={togglePasswordVisibility}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color={'black'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <View style={{ flexDirection: 'row' }}>
            <Feather name="log-in" size={18} color={'white'} />
            <Text style={[styles.buttonText, { color: "white" }]}>Login</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const { width } = Dimensions.get("window");
const isSmallDevice = width < 375; // Adjust the width as needed for small devices
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.neutralN10,
  },
  wrapper: {
    width: '90%',
    marginLeft: 20,
    marginTop: 44
  },
  labelTxt: {
    color: 'black',
    fontWeight: '400',
    fontFamily: 'Inter',
    paddingBottom: 10,
    marginRight: 12,
    paddingTop: 12,
  },
  buttonText: {
    color: 'white',
    paddingLeft: 10,
    fontSize: 18
    // textAlign: 'center',
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 5,
    paddingHorizontal: 14,
    color: 'black'
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 5,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 5,
    color: 'black',
    marginBottom: 12,
  },
  eyeButton: {
    padding: 8,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Padding.p_xl,
    paddingTop: isSmallDevice ? 8 : 80,
    paddingBottom: 180,
    justifyContent: "center", // Center the content vertically
  },
  textInput: {
    color: 'black',
    marginTop: isSmallDevice ? 8 : 12,
    height: isSmallDevice ? 32 : 40,
    marginTop: isSmallDevice ? 8 : 12,
    height: 40, // Set a minimum height for the text input containers
    minHeight: 40, // Set a minimum height for the text input containers
    borderRadius: Border.br_9xs,
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "#dedede",
    borderStyle: "solid",
    paddingHorizontal: Padding.p_xs,
  },
  securityLoginWrapper: {
    alignSelf: "center",
    marginTop: isSmallDevice ? 20 : 40, // Add vertical spacing for small and large devices
  },
  securityLogin: {
    fontSize: isSmallDevice ? 34 : 54,
    lineHeight: isSmallDevice ? 42 : 62, // Adjust the lineHeight for proper spacing for cutting the text
    fontWeight: "700",
    fontFamily: FontFamily.interBold,
    color: Color.neutralN600,
    textAlign: "center",
    marginBottom: isSmallDevice ? 70 : 85,
  },
  labelTypo: {
    textAlign: "center",
    color: 'black',
    letterSpacing: 0,
    fontSize: 20,
  },
  text: {
    alignSelf: "stretch",
    marginBottom: isSmallDevice ? 50 : 60,
  },
  text1: {
    marginTop: isSmallDevice ? 16 : 24,
    alignSelf: "stretch",
  },
  textParent: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  button1: {
    fontFamily: FontFamily.uIMedium1,
    fontWeight: "500",
    paddingLeft: '5%'
  },
  button: {
    backgroundColor: '#283093',
    // padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // width:102,
    height: 45,
    // padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '30%',
    paddingHorizontal: 5,
    paddingVertical: 3
    // height: '20%',
  },
  buttonWrapper: {
    marginTop: isSmallDevice ? 24 : 48,
    alignSelf: "stretch",
  },
});

export default Login;
