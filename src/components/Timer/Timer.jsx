import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
const ButtonTimer = ({ isDisabled, onEnable, onDisable }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        const timerInterval = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (newTimeLeft.total <= 0) {
                clearInterval(timerInterval);
                // Timer has reached its target time, you can trigger some action here if needed
                if (isDisabled) {
                    onEnable(); // Enable the button
                } else {
                    onDisable(); // Disable the button
                }
            }
        }, 1000);
        return () => clearInterval(timerInterval);
    }, []);
    function calculateTimeLeft() {
        const currentTime = new Date().getTime();
        const targetTime = isDisabled ? getNextActivationTime() : getNextDeactivationTime();
        const targetTimeInMilliseconds = targetTime.getTime();
        const timeDifference = targetTimeInMilliseconds - currentTime;
        if (timeDifference <= 0) {
            return { total: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        const seconds = Math.floor((timeDifference / 1000) % 60);
        const minutes = Math.floor((timeDifference / 1000 / 60) % 60);
        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        return { total: timeDifference, hours, minutes, seconds };
    }
    function getNextActivationTime() {
        const currentTime = new Date();
        const nextActivationTime = new Date(currentTime);
        if (currentTime.getHours() < 7 || currentTime.getHours() >= 22) {
            // If the current time is before 7 am or after 10 pm, set activation time to 7 am of the next day
            nextActivationTime.setHours(7, 0, 0, 0);
            nextActivationTime.setDate(nextActivationTime.getDate() + 1);
        } else {
            // Otherwise, set activation time to 10 pm of the current day
            nextActivationTime.setHours(22, 0, 0, 0);
        }
        return nextActivationTime;
    }
    function getNextDeactivationTime() {
        const currentTime = new Date();
        const nextDeactivationTime = new Date(currentTime);
        if (currentTime.getHours() < 19 || currentTime.getHours() >= 10) {
            // If the current time is before 7 pm or after 10 am, set deactivation time to 7 pm of the current day
            nextDeactivationTime.setHours(19, 0, 0, 0);
        } else {
            // Otherwise, set deactivation time to 10 am of the next day
            nextDeactivationTime.setHours(10, 0, 0, 0);
            nextDeactivationTime.setDate(nextDeactivationTime.getDate() + 1);
        }
        return nextDeactivationTime;
    }
    const { hours, minutes, seconds } = timeLeft;
    return (
        <Text>
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Text>
    );
};
export default ButtonTimer;
