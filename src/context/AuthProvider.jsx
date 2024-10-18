import { createContext, useContext, useState, useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import UserAgent from 'react-native-user-agent';
const AuthContext1 = createContext({
    userAgent: '',
    ipAddress: '',
    platform: ''
});
export function AuthProvider({ children }) {
    const [userAgent, setUserAgent] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [platform, setPlatform] = useState('');
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('https://api.ipify.org?format=json');
                const ipAddress = response.data.ip;
                const  _j  = UserAgent.getUserAgent();
                const platform = DeviceInfo.getSystemName();
                setIpAddress(ipAddress);
                setUserAgent(_j);
                setPlatform(platform);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);
    (async () => {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            const ipAddress = response.data.ip;
            const  _j  = UserAgent.getUserAgent();
            const platform = DeviceInfo.getSystemName();
            console.log(ipAddress, _j, platform);
            setIpAddress(ipAddress);
            setUserAgent(_j);
            setPlatform(platform);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    })();
    return (
        <AuthContext1.Provider value={{ userAgent, ipAddress, platform }}>
            {children}
        </AuthContext1.Provider>
    );
}
export function useAuth() {
    return useContext(AuthContext1);
}
