// ConnectivityContext.js used to check if data is avialable or connected to a active internet connection ,if not connected it will give a Modal.
import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
const ConnectivityContext = createContext();
export const ConnectivityProvider = ({ children }) => {
    const [isOffline, setIsOffline] = useState(false);
    useEffect(() => {
        const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
            const offline = !(state.isConnected && state.isInternetReachable);
            setIsOffline(offline);
        });
        return () => removeNetInfoSubscription();
    }, []);
    return (
        <ConnectivityContext.Provider value={{ isOffline }}>
            {children}
        </ConnectivityContext.Provider>
    );
};
export const useConnectivity = () => {
    return useContext(ConnectivityContext);
};
