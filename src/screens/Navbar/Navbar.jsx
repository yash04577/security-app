import React, { useContext, useState } from "react";
import { Image, StyleSheet, Text, View, Dimensions, TouchableOpacity } from "react-native";
import { Color, FontFamily } from "./GlobalStyles";
import { AuthContext } from "../../context/AuthContext";
import { useNetInfo } from "@react-native-community/netinfo";
import Feather from 'react-native-vector-icons/Feather';
import { useAuthContext } from "../../auth/AuthGuard";
import FlashMessage from "react-native-flash-message";
const Navbar = ({ navigation }) => {
  const netInfo = useNetInfo();
  const auth = useAuthContext();
  let userInfo = auth?.authData;
  console.log(userInfo);
  console.log("sssaasasas", auth?.authData?.role);
  const isUserAdmin = auth?.authData?.role;
  const jobProfileName = userInfo?.jobProfileId?.jobProfileName;
  const displayName = isUserAdmin == 'admin' ? userInfo?.name : userInfo?.name;
  const displayText = isUserAdmin == 'admin' ? 'Admin' : jobProfileName;
  console.log(displayName);
  const windowHeight = Dimensions.get("window").height;
  const isNetworkConnected = netInfo.details;
  return (
    <View style={[styles.header, { height: windowHeight * 0.1 }]}>
      <FlashMessage />
      <View style={{ flexDirection: "row" }}>
        <View style={styles.logoWrapper}>
          <Image
            style={styles.logoIcon}
            resizeMode="cover"
            source={require("../../../assets/metalogo.png")}
          />
          <View style={{}}>
            <TouchableOpacity style={styles.companyNameWrapper} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.companyName}>Chawla Ispat</Text>
              <View style={styles.versionTextWrapper}>
                <Text style={styles.versionText}>Version 2.1.2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.name}>
        <Text style={styles.securityText}>{displayText}</Text>
        <Text style={styles.securityName}>{displayName}</Text>
        <Text style={styles.securityName}>
          {netInfo.type}{'  '}
          {netInfo.type !== 'none' ? (
            <Feather name="wifi" size={18} color={'green'} />
          ) : (
            <Feather name="wifi-off" size={18} color={'red'} />
          )}
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Dimensions.get("window").width * 0.04,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dedede",
    borderStyle: "solid",
    backgroundColor: "#f7f7f7",
  },
  securityName: {
    color: 'black',
    textAlign: 'center'
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: Dimensions.get("window").height * 0.04,
    height: Dimensions.get("window").height * 0.04,
  },
  companyNameWrapper: {
    paddingHorizontal: Dimensions.get("window").width * 0.02,
  },
  companyName: {
    fontSize: Dimensions.get("window").height * 0.025,
    color: Color.blueMainM500,
    fontFamily: FontFamily.interMedium,
  },
  securityText: {
    fontSize: Dimensions.get("window").height * 0.02,
    color: "black",
    fontFamily: FontFamily.interMedium,
    fontWeight: "bold",
  },
  name: {
    textAlign: 'right',
    color: 'black',
  },
  versionText: {
    fontSize: 16, // Customize the font size
    color: 'black', // Customize the text color
    // marginTop: 8, // Adjust the margin as needed
    marginLeft: 5,
  },
  versionTextWrapper: {
    alignItems: 'center', // Center the version text horizontally
    marginTop: 5, // Adjust the margin as needed
  },
});

export default Navbar;
