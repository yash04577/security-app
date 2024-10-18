import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import PunchIn from '../screens/PunchIn';
import Home from '../screens/Home/Home';
import Login from '../screens/Login/Login';
import SplashScreen from '../screens/SplashScreen';
import Assign from '../screens/Assign/Assign';
import Qr from '../screens/Qr';
import Pic from '../screens/Pic';
import MarkPunchin from '../screens/MarkPunchin';
import Final from '../screens/Final';
import Logs from '../screens/Logs';
import { useTheme } from '../theme/ThemeContext';
import FlashMessage from 'react-native-flash-message';
import machine from '../screens/Assign/machine/machines'
import MachineQr from '../screens/Assign/machine/machineQr';
import machinePic from '../screens/Assign/machine/machinePic';
import machineFinal from '../screens/Assign/machine/machineFinal';
import VoiceRecognitionComponent from '../components/VoiceScreen/Voice';
import Loading from '../screens/Loading/Loading';
import LoadingQr from '../screens/Loading/LoadingQr';
import VehiclePhoto from '../screens/Loading/VehiclePhoto';
import FinalLoading from '../screens/Loading/FinalLoadng';
import AddProd from '../screens/Loading/AddProd';
import ScanProdSlip from '../screens/Loading/ScanProdSlip';
import SingleBillPage from '../screens/Loading/SingleBillPage';
import LoadingFinal from '../screens/Loading/LoadingFinal';

const Routes = () => {
    const config = {
        animation: 'spring',
        config: {
            stiffness: 1000,
            damping: 500,
            mass: 3,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
        },
    };
    const Stack = createNativeStackNavigator();
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Home'>
                {/* <Stack.Screen
                    name="Login"
                    options={{ headerShown: false }}
                    component={Login}
                /> */}
                <Stack.Screen name="Home" component={Home} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="Punchin" component={PunchIn} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="Logs" component={Logs} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="Assign" component={Assign} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                        headerShown: false
                    },
                }} />
                <Stack.Screen name="Splash" component={SplashScreen} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                        headerShown: false
                    },
                }} />
                <Stack.Screen name="Qr" component={Qr} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="Pic" component={Pic} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="MarkPunchin" component={MarkPunchin} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="Final" component={Final} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="Machine" component={machine} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="machineQr" component={MachineQr} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="machinePic" component={machinePic} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="machineFinal" component={machineFinal} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="Voice" component={VoiceRecognitionComponent} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="Loading" component={Loading} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="LoadingQr" component={LoadingQr} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="SingleBillPage" component={SingleBillPage} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="VehiclePhoto" component={VehiclePhoto} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="FinalLoading" component={FinalLoading} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="AddProd" component={AddProd} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="ScanProdSlip" component={ScanProdSlip} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
                <Stack.Screen name="LoadingFinal" component={LoadingFinal} options={{
                    headerShown: false,
                    transitionSpec: {
                        open: config,
                        close: config,
                    },
                }} />
            </Stack.Navigator>
            <FlashMessage position="top" />
        </NavigationContainer>
    );
}
export default Routes

const styles = StyleSheet.create({})


