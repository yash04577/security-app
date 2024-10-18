// NoInternetModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useConnectivity } from '../../context/ConnectivityContext';
const NoInternetModal = ({ isVisible, onRetry }) => {
    const { isOffline } = useConnectivity(); // Access the connectivity state
    return (
        <Modal isVisible={isVisible}>
            <View>
                <Text>Connection Error</Text>
                <Text>Oops! Looks like your device is not connected to the Internet.</Text>
                <TouchableOpacity onPress={onRetry} disabled={!isOffline}>
                    <Text>Check your Connectivity</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};
export default NoInternetModal;
