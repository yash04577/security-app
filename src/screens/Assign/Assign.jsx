import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, Text, TouchableOpacity, ScrollView, RefreshControl, KeyboardAvoidingView, Vibration, FlatList } from 'react-native';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import AwesomeAlert from 'react-native-awesome-alerts';
import { RBASE_URL } from '../../config';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import FlashMessage from 'react-native-flash-message';
import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
const Assign = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedOptions1, setSelectedOptions1] = useState("");
  const [selectedOptions2, setSelectedOptions2] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isEmployeeSelected, setIsEmployeeSelected] = useState(false);
  const [selectJobProfile, setSelectJobProfile] = useState();
  const [jobProfiles, setJobProfiles] = useState([]);
  const [groupProfiles, setGroupProfiles] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState({ id: '', name: '', email: '', dId: '', dName: '', Profile: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recognized, setRecognized] = useState('');
  const [volume, setVolume] = useState('');
  const [error, setError] = useState('');
  const [end, setEnd] = useState('');
  const [started, setStarted] = useState('');
  const [results, setResults] = useState('');
  const [partialResults, setPartialResults] = useState([]);
  const [speak,setSpeak] = useState(false);
  // ... your other state declarations
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const handlePress = () => {
    console.log("6546644811611894", selectedEmployee);
    if (isEmployeeSelected) {
      navigation.navigate('Qr', { selectedEmployee });
    } else {
      // Show an alert or take appropriate action when no employee is selected
      // For example:
      setShowAlert(true);
      setAlertMessage('Please select an employee before proceeding.');
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
    setRefreshing(false);
  };
  const handleSearchInputChange = (text) => {
    if (text.trim() !== '') {
      setShowSuggestions(true);
      // Make the API call to fetch suggestions based on the input
      axios
        .get(`${RBASE_URL}/employee?name=${encodeURIComponent(text)}`)
        .then((response) => {
          const employees = response.data.employees;
          if (employees?.length > 0) {
            setSuggestions(employees);
          } else {
            setSuggestions([]);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setSearchResults([]); // Clear the search results when input text is empty
    }
  };
  const handleSuggestionPress = (suggestion) => {
    console.log("i AM from here", suggestion);
    setSearchQuery(suggestion.name); // Set the search query to the selected suggestion
    setSelectedSuggestion(suggestion); // Store the selected suggestion in state
    setShowSuggestions(false); // Hide the suggestions after selecting one
  };
  console.log('SELECTION HERE', selectedOptions2);
  useEffect(() => {
    fetchJobProfile();
    fetchGroup();
    fetchData()
  }, [selectedOptions2, selectedOptions1]);
  useEffect(() => {
    debounceFetchData();
  }, [searchQuery])
  useEffect(() => {
    // Clear previous event listeners when the component mounts
    Voice.removeAllListeners();
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;
    return () => {
      // Clear event listeners when the component unmounts
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  const onSpeechStart = (e) => {
    console.log('onSpeechStart: ', e);
    setStarted('√');
    setSpeak(true)
  };
  const onSpeechRecognized = (e) => {
    console.log('onSpeechRecognized: ', e);
    setRecognized('√');
  };
  const onSpeechEnd = (e) => {
    console.log('onSpeechEnd: ', e);
    setEnd('√');
    setSpeak(false)
  };
  const onSpeechError = (e) => {
    console.log('onSpeechError: ', e);
    setError(JSON.stringify(e.error));
  };
  const onSpeechResults = (e) => {
    console.log('onSpeechResults: ', e);
    setResults(e.value);
  };
  const onSpeechPartialResults = (e) => {
    console.log('onSpeechPartialResults: ', e);
    setPartialResults(e.value);
  };
  const onSpeechVolumeChanged = (e) => {
    console.log('onSpeechVolumeChanged: ', e);
    setVolume(e.value);
  };
  const _startRecognizing = async () => {
    _clearState();
    try {
      setLoading(true)
      await Voice.start('en-US');
      console.log('called start');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  const _stopRecognizing = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };
  const _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };
  const _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    _clearState();
  };
  const _clearState = () => {
    setRecognized('');
    setVolume('');
    setError('');
    setEnd('');
    setStarted('');
    setResults('');
    setPartialResults([]);
  };
  useEffect(() => {
      const combinedResults = results[0] // Combine all results into a single string
      setSearchQuery(combinedResults);
    
  }, [results]);
  console.log("45466666455544545", results[0]);
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    }
  }
  const fetchData = async () => {
    try {
      setLoading(true); // Set loading to true before making the API request
      console.log('SELECTION HERE', selectedOptions1 !== "Any" ? [selectedOptions1] : [""], selectedOptions2 !== "Any" ? [selectedOptions2] : [""]);
      if (searchQuery && searchQuery.length !== 0 || (selectedOptions1 && selectedOptions1 !== "Any" && selectedOptions1 !== "") || (selectedOptions2 && selectedOptions2 !== "Any" && selectedOptions2 !== ""))
        {
        const response = await axios.post(`${RBASE_URL}/employee`, {
          name: searchQuery,
          groupName: selectedOptions1 !== "Any" ? [selectedOptions1] : [""],
          jobProfileName: selectedOptions2 !== "Any" ? [selectedOptions2] : [""],
        });
        const employees = response.data.employees;
        console.log("EEEEEEEEEEEEE", employees);
        console.log(selectedSuggestion);
        console.log(selectedOptions1);
        console.log(selectedOptions2);
        // Filter the search results based on the selected suggestion
        if (selectedSuggestion && (selectedOptions1 == "Any" || selectedOptions1 == null) && (selectedOptions2 == "Any" || selectedOptions2 == null)) {
          const filteredResults = selectedSuggestion
            ? employees.filter((result) => result._id === selectedSuggestion._id)
            : employees;
          if (filteredResults?.length > 0) {
            setSearchResults(filteredResults);
          } else {
            setSearchResults([]);
          }
        } else {
          setSearchResults(employees);
        }
      } else {
        // Clear the search results when searchQuery is empty
        setSearchResults([]);
      }
    } catch (error) {
      console.error("1212121221212121212121211", error);
    } finally {
      setLoading(false); // Set loading to false after the request is processed
    }
  };
  const debounceFetchData = debounce(fetchData, 800);
  console.log("HII HERO ", searchResults);
  const fetchJobProfile = async () => {
    try {
      setLoading(true); // Set loading to true before making the API request
      const res = await axios.get(`${RBASE_URL}/jobProfile`);
      setJobProfiles(res.data.docs);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false); // Set loading to false after the request is processed
    }
  };
  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${RBASE_URL}/group`);
      console.log("group profile", res.data.docs)
      setGroupProfiles(res.data.docs);
      //console.log(jobProfiles.length)
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };
  const handleCardClick = (id, name, email, dId, dName, Profile) => {
    setSelectedEmployee({ id, name, email, dId, dName, Profile });
    setShowAlert(true);
    Vibration.vibrate();
    setAlertMessage(`Your Selections: ${name}`);
    setIsEmployeeSelected(true); // Set the selection status to true
    console.log("222222222222222222222222222222222222", id, name, email, dId, dName, Profile);
  };
  if (loading) {
    return (
      <View style={styles.container55}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  if(speak){
    return (
      <View style={styles.container55}>
        <Text style={styles.loadingText}>Speak Please.......</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlashMessage />
      <View style={styles.securityAdmin}>
        <Navbar navigation={navigation} />
        <AwesomeAlert
          show={showAlert}
          title='Alert!'
          showConfirmButton={true}
          confirmText='ok'
          onConfirmPressed={() => setShowAlert(false)}
          onCancelPressed={() => setShowAlert(false)}
          showCancelButton={true}
          cancelText='cancel'
          onDismiss={() => console.log('dismissed')}
          message={alertMessage}
        />
        <View style={styles.containerStyle}>
          <View style={styles.dropdownStyle}>
            <Picker
              style={{ ...styles.picker, zIndex: 1 }} // Apply a higher zIndex to the Picker
              selectedValue={selectedOptions1}
              onValueChange={itemValue => setSelectedOptions1(itemValue)}
              itemStyle={{ color: 'black' }}
              mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
              dropdownIconColor="black"
            >
              <Picker.Item label="Groups" value="Any" />
              {groupProfiles.map((item, index) => (
                console.log(item),
                <Picker.Item
                  key={index}
                  label={item.groupName}
                  value={item.groupName}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.dropdown2Style}>
            <Picker
              style={{ ...styles.picker, zIndex: 1 }} // Apply a higher zIndex to the Picker
              selectedValue={selectedOptions2}
              onValueChange={itemValue => setSelectedOptions2(itemValue)}
              itemStyle={{ color: 'black' }} // Set text color for Picker items
              mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
              dropdownIconColor="black"
            >
              <Picker.Item label="Job Profile" value="Any" />
              {jobProfiles.map((item, index) => (
                // console.log(item),
                <Picker.Item
                  key={index}
                  label={item.jobProfileName}
                  value={item.jobProfileName}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View><TouchableOpacity onPress={() => navigation.navigate('Machine')}><View style={{ borderWidth: 1, width: '35%', marginLeft: "33%", backgroundColor: '#f5f5f5', borderRadius: 8, marginTop: -15, marginBottom: 10 }}><Text style={{ paddingHorizontal: 20, paddingVertical: 14, color: '#000' }}>Machines</Text></View></TouchableOpacity></View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={styles.searchBarContainer}>
              <Icon name="search" style={styles.searchIcon} />
              <TextInput
                style={{ ...styles.searchInput, color: 'black' }}
                placeholder="Search..."
                value={searchQuery}
                placeholderTextColor="black"
                onChangeText={text => {
                  handleSearchInputChange(text),
                    setSearchQuery(text)
                }}
              />
            </View>
            <TouchableOpacity onPress={_startRecognizing}>
              <Icon name="microphone" style={styles.searchIcon1} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={true} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
            {/* Your suggestions container */}
            {showSuggestions && (
              <View style={{ ...styles.suggestionsContainer, zIndex: 1 }}>
                {suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion._id}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion.name}</Text>
                    <Text style={{ ...styles.suggestionText, marginLeft: 20 }}>
                      {suggestion.employeeCode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {(searchResults?.length > 0 || selectedOptions1 != 'Any' || selectedOptions2 !== 'Any') && (
              <View style={{ ...styles.mahesh, zIndex: 2 }}>
                <Text style={styles.searchResultsTitle}>Search Results:</Text>
                {searchResults?.map((result) => (
                  console.log(result),
                  <TouchableOpacity
                    key={result._id}
                    style={styles.card}
                    onPress={() =>
                      handleCardClick(
                        result?._id,
                        result?.name,
                        result?.email,
                        result?.groupId?._id,
                        result?.groupId?.groupName,
                        {
                          uri: result.profilePicture
                            ? result.profilePicture
                            : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                        }
                      )
                    }
                  >
                    {/* Render ProfilePic */}
                    <Image
                      style={styles.profilePic}
                      source={{
                        uri: result.profilePicture
                          ? result.profilePicture
                          : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                      }}
                    />
                    {/* Render Name */}
                    <View style={styles.cardContent}>
                      <Text style={styles.name}>{result?.name}</Text>
                      {/* Render Department Name */}
                      <Text style={styles.departmentName}>
                        Department Name: {result?.groupId?.groupName}
                      </Text>
                      <Text style={styles.departmentName}>
                        Job Profile Name: {result?.jobProfileId?.jobProfileName}
                      </Text>
                      <Text style={styles.departmentId}>
                        Employee Code: {result?.employeeCode}
                      </Text>
                      <Text style={styles.departmentId}>
                        QR_Code:{' '}
                        {result.permanentBarCodeNumber?.length >= 4
                          ? result?.permanentBarCodeNumber.substring(
                            result.permanentBarCodeNumber.length - 4
                          )
                          : result?.permanentBarCodeNumber}
                      </Text>
                      <Text style={styles.departmentId}>
                        Phone Number: {result?.contactNumber}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        {searchResults?.length > 0 && (
          <View style={styles.confirmButtonContainer}>
            <TouchableOpacity
              onPress={handlePress}
              style={[
                styles.confirmButton,
                { backgroundColor: isEmployeeSelected ? '#283093' : '#ccc' }, // Enable or disable button based on selection
              ]}
              disabled={!isEmployeeSelected} // Disable the button when no employee is selected
            >
              <Text style={styles.confirmButtonText}>Confirm Employee</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mahesh: {
    marginBottom: '40%',
  },
  suggestionsContainer: {
    borderWidth: 2,
    elevation: 2,
    borderColor: 'white',
    borderBlockColor: 'black',
    width: '95%',
    marginLeft: '2.5%'
  },
  suggestionItem: {
    flexDirection: 'row', // Arrange suggestion text in a row
    alignItems: 'center', // Align suggestion text vertically in the center
    paddingVertical: 10, // Add vertical padding for each suggestion
    paddingHorizontal: 15, // Add horizontal padding for each suggestion
    backgroundColor: '#f0f0f0', // Add background color for each suggestion
    borderRadius: 5, // Add border radius to style the suggestion box
    marginVertical: 5,
  },
  suggestionText: {
    fontSize: 16,
    color: 'black',
  },
  cardContent: {
    flex: 1, // Allow the cardContent view to take the remaining space
    marginLeft: '5%'
  },
  containerStyle: {
    flexDirection: 'row', // Set flexDirection to 'row' to align the dropdowns horizontally
    justifyContent: 'center',
    marginTop: '3%'
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    width: '47%', // Set the width to a small value to make the dropdown small
    height: '60%',
    flexWrap: 'wrap',
    marginBottom: '2%',
  },
  dropdown2Style: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    width: '47%', // Set the width to a small value to make the dropdown small
    height: '60%',
    flexWrap: 'wrap',
    marginLeft: '2%', // Change the marginLeft to align the second dropdown next to the first one
  },
  picker: {
    height: '15%',
    width: '100%',
    color: '#000',

  },
  columnRowTxt: {
    color: 'black',
    flex: 1, // Set each column to occupy an equal portion of the row
    textAlign: "center",
  },
  arrowIcon: {
    marginRight: '20%'
  },
  arrowContainer: {
    position: 'absolute',
    right: '50%',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  departmentName: {
    color: "black",
    marginBottom: 4,
  },
  departmentId: {
    color: "black",
    marginBottom: 4,
  },
  securityAdmin: {
    backgroundColor: "#fff",
    flex: 1,
  },
  frameParent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#dedede",
    backgroundColor: "#F4F4F4",
  },
  metalogoParent: {
    flexDirection: "row",
    alignItems: "center",
  },
  metalogoIcon: {
    width: 28,
    height: 28,
  },
  chawlaIspatWrapper: {
    marginLeft: 6.13,
  },
  chawlaIspat: {
    fontSize: 18,
    color: "#0366D6",
  },
  security: {
    marginLeft: "auto",
  },
  searchBarContainer: {
    backgroundColor: 'white',
    paddingHorizontal: '4%',
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    height: 50,
    borderWidth: 2,
    elevation: 2,
    borderColor: '#F0F0F0',
    marginLeft: '2.6%',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: '9%',
    color: '#333',
  },
  searchIcon1: {
    fontSize: 40,
    marginRight: '6%',
    color: '#333',
  },
  searchInput: {
    fontSize: 16,
    height: 40,
    flex: 1,
  },
  searchResultsTitle: {
    color: "black",
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 8

  },
  card: {
    flexDirection: 'row', // Set the direction of elements to row
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
    width: '95%',
    marginLeft: '2.6%'
  },
  name: {
    color: "black",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
  },
  confirmButtonContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
  },
  confirmButton: {
    backgroundColor: "#283093",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 5,
  },
  confirmButtonText: {
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
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

export default Assign;
