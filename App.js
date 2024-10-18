import React, { useEffect } from 'react';
import { BackHandler, ToastAndroid, View } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { AuthProvider } from './src/context/AuthProvider';
import { ConnectivityProvider } from './src/context/ConnectivityContext';
import AuthGuard from './src/auth/AuthGuard';
import Routes from './src/navigation/Routes';
import FlashMessage from 'react-native-flash-message';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
const App = () => {
  const queryClient = new QueryClient();
  // Function to schedule the app refresh
  const scheduleAppRefresh = () => {
    const currentHour = new Date().getHours();
    if (currentHour === 19 || currentHour === 22 || currentHour === 7 || currentHour === 10) { // 6 pm
      // Refresh the app
      ToastAndroid.show('Refreshing app...', ToastAndroid.SHORT); // Show a toast message (optional)
      BackgroundTimer.setTimeout(() => {
        // Reload the app
        BackHandler.exitApp(); // Close the app (you can also use other methods to reload your app)
      }, 1000); // Delay for 1 second (adjust as needed)
    }
  };
  // Fetch IP address and user agent when the app starts
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        const ipAddress = response.data.ip;
        const { _j } = DeviceInfo.getUserAgent();
        const platform = DeviceInfo.getSystemName();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);
  // Set up a timer to periodically check for app refresh at 6 pm
  useEffect(() => {
    const timerInterval = BackgroundTimer.setInterval(() => {
      scheduleAppRefresh();
    }, 6 * 60 * 60 * 1000); // Refresh every 6 hours
    // Clean up the timer when the component unmounts
    return () => BackgroundTimer.clearInterval(timerInterval);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1 }}>
        <AuthProvider>
          <AuthGuard>
            <ConnectivityProvider>
              <View style={{ flex: 1 }}>
                <Routes />
                <FlashMessage position={'top'} />
              </View>
            </ConnectivityProvider>
          </AuthGuard>
        </AuthProvider>
      </View>
    </QueryClientProvider>
  );
}
export default App;
