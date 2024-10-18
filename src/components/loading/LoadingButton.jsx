import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native"
const LoadingButton = ({ title, onPress, isLoading, buttonStyle, textStyle }) => {
    return (
        <TouchableOpacity
            style={[styles.button, buttonStyle]}
            onPress={!isLoading ? onPress : null}
            disabled={isLoading}
        >
            {
                isLoading ? (
                    <ActivityIndicator size='small' color='white' />
                ) : (
                    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
                )
            }
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    button: {
        backgroundColor: '#005D7F',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoadingButton;