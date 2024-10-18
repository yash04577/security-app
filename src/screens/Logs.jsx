import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Text, FlatList, RefreshControl, TouchableOpacity, Image, Modal } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import Navbar from './Navbar/Navbar';
import { Picker } from '@react-native-picker/picker';
import { RBASE_URL } from '../config';
import ImageModal from 'react-native-image-modal';
import Feather from 'react-native-vector-icons/Feather';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import FlashMessage from 'react-native-flash-message';
const Logs = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState('QR Punches');
  const [selectedOptionsForSorting, setSelectedOptionsForSorting] = useState('Ascending');
  const [refreshing, setRefreshing] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isShowingImage, setShowingImage] = React.useState(false)

  const [columns, setColumns] = useState([
    "Sequence",
    "Date",
    "Name",
    "Time",
  ]);
  const [acolumns, setAcolumns] = useState([
    "Date",
    "Name",
    "Time",
    "Photo"
  ])
  const [data, setData] = useState([]);
  const [dataq, setDataq] = useState([])
  const [searchText, setSearchText] = useState(''); // State variable to store the search text
  const [filteredData, setFilteredData] = useState([]); // State variable to store the filtered data
  const [filteredDataq, setFilteredDataq] = useState([]); // State variable to store the filtered data
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date()); // State variable to store the selected date
  // console.log("Akansha Doubt", selectedOptions);
  useEffect(() => {
    fetchData();
    fetchQdata();
  }, [selectedDate, selectedOptionsForSorting]); // Add selectedDate as a dependency to trigger the effect when the date changes.
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  console.log("Akash is asking Questions..........................", formatDate(selectedDate));
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(); // Call the fetchData function again to refresh the data
    fetchQdata();
    setRefreshing(false);
  };
  const handleSearch = () => {
    const filtered = data.filter((item) => {
      console.log(item);
      const searchTextLower = searchText.toLowerCase();
      const name = item.Name.toLowerCase();

      return name.includes(searchTextLower);
    });

    setFilteredData(filtered);
  };
  const handleSearch1 = () => {
    const filtered = dataq.filter((item) => {
      console.log(item);
      const searchTextLower = searchText.toLowerCase();
      const name = item.Name.toLowerCase();

      return name.includes(searchTextLower);
    });

    setFilteredDataq(filtered);
  };
  const handlePrevDate = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };
  console.log("Date", selectedDate);
  const handleNextDate = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  };
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://www.lohawalla.com/api/v2/attendance/getPunchInPunchOut?date=${formatDate(selectedDate)}`
      );
      const parsedData = res?.data;
      console.log("Logs", parsedData);
      const userData = parsedData.punchIn;
      const logoutData = parsedData.punchOut;
      console.log(userData);
      let value = 1;
      const mappedData = userData.map((item, index) => {
        console.log("993656251", item.punchIn)
        const punchInDateTime = new Date(item.punchIn);
        punchInDateTime.setMinutes(punchInDateTime.getMinutes() - 330);
        console.log("From QRrrrrr12345679000000000000000 Punches", punchInDateTime);
        console.log(punchInDateTime);
        if (!isNaN(punchInDateTime)) {
          const punchInDate = punchInDateTime.toISOString().split('T')[0];
          const punchInTime = punchInDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          return {
            Sequence: value++,
            Date: punchInDate,
            Name: item.employee ? item.employee.name : "ashok",
            Time: punchInTime || '',
            Type: "Punch-In",
          };
        } else {
          return {
            Sequence: value++,
            Date: "Invalid Date",
            Name: item.employee ? item.employee.name : "ashok",
            Time: "Invalid Time",
            Type: "Punch-In",
          };
        }
      });
      const mappedData1 = logoutData.map((item, index) => {
        console.log(item);
        const punchOutDateTime = new Date(item.punchOut);
        punchOutDateTime.setMinutes(punchOutDateTime.getMinutes() - 330);
        console.log("From QR Punch Out", punchOutDateTime);
        if (!isNaN(punchOutDateTime)) {
          const punchOutDate = punchOutDateTime.toISOString().split('T')[0];
          const punchOutTime = punchOutDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          return {
            Sequence: value++,
            Date: punchOutDate,
            Name: item.employee ? item.employee.name : "ashok",
            Time: punchOutTime || '',
            Type: "Punch-Out",
          };
        } else {
          console.log("Invalid Punch-Out Date Time:", item.punch.punchOut);
          return {
            Sequence: value++,
            Date: "Invalid Date",
            Name: item.employee ? item.employee.name : "ashok",
            Time: "Invalid Time",
            Type: "Punch-Out",
          };
        }
      });
      console.log("Mapped Data11111", selectedOptionsForSorting);
      console.log("Mapped Data", mappedData);
      const combinedData = [...mappedData1, ...mappedData].sort((a, b) => a.Time - b.Time);
      console.log('combined Data  dddddddddddddaa', combinedData);
      combinedData.forEach((item) => {
        const [time, period] = item.Time.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        item.Time = new Date();
        item.Time.setHours(hours, parseInt(minutes), 0, 0);
      });
      combinedData.sort((a, b) => a.Time - b.Time);
      console.log('combined Data  aaaaaaaaaaaaa', combinedData);
      setData(combinedData);
      setIsLoading(false);
      setIsLogin(true);
    } catch (err) {
      console.log(`API Error: ${err}`);
      setIsLoading(false);
    }
  };
  const fetchQdata = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${RBASE_URL}/employee/qrAssignedByMe`
      );
      const parsedData = res?.data;
      console.log('QR Assigned', parsedData);
      console.log('QR Assigned', parsedData.employee);
      const qdata = parsedData.employee;
      const qmappedData = qdata.map((item, index) => {
        console.log(item.proofPicture)
        const qDateTime = new Date(item.createdAt);
        if (!isNaN(qDateTime)) {
          const qDate = qDateTime.toISOString().split('T')[0];
          const qTime = qDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          return {
            Date: qDate,
            Name: item.employeeId ? item.employeeId.name : "ashok",
            Time: qTime || '',
            Photo: 'open',
            Type: "qTime",
            ProofPictureURL: item.proofPicture,
          };
        } else {
          // Invalid date/time value, handle the error
          // console.log("Invalid Punch-In Date Time:", item.punch.punchIn);
          // Set default or placeholder values
          return {
            Date: "Invalid Date",
            Name: item.employeeId ? item.employeeId.name : "ashok",
            Time: "Invalid Time",
            Photo: 'open',
            Type: "Punch-In",
            ProofPictureURL: item.proofPicture,
          };
        }
      });
      console.log("I am calling from Q mapped Data", qmappedData);
      setDataq(qmappedData);
      setIsLoading(false);
      setIsLogin(true);
    } catch (error) {
      console.log(`API Error: ${error}`);
      setIsLoading(false);
    }
  }
  const handleOpenButtonPress = (imageUrl) => {
    console.log("im from here", imageUrl);
    setSelectedImageUrl(imageUrl)
  };
  const closeModal = () => {
    setSelectedImageUrl(null);
    setIsImageModalVisible(false);
  };
  const filterLogsByDate = (logs, selectedDate) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    return logs.filter(item => item.Date === formattedDate);
  };
  const filteredLogs = filteredData.length > 0 ? filteredData : data;
  // console.log("Look me here", filteredLogs)
  const filteredLogsByDate = filterLogsByDate(filteredLogs, selectedDate);
  if (selectedOptionsForSorting === 'Ascending') {
    filteredLogsByDate.sort((a, b) => a.Time.getTime() - b.Time.getTime());
  } else {
    filteredLogsByDate.sort((a, b) => b.Time.getTime() - a.Time.getTime());
  }
  console.log("Look me here", filteredLogsByDate)
  const tableHeader = () => (
    <View style={styles.header}>
      {columns.map((column, index) => (
        <Text style={styles.text} key={index}>{column}</Text>
      ))}
    </View>
  );
  const filteredLogsq = filteredDataq.length > 0 ? filteredDataq : dataq;
  const filteredLogsByDateq = filterLogsByDate(filteredLogsq, selectedDate);
  const tableHeader1 = () => (
    <View style={styles.header}>
      {acolumns.map((column, index) => (
        <Text style={styles.text} key={index}>{column}</Text>
      ))}
    </View>
  );
  const renderSkeletonItem = () => {
    const skeletonCount = 50;
    const skeletonItems = Array.from({ length: skeletonCount }, (_, index) => (
      <SkeletonPlaceholder key={index}>
        <View style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: '20%', height: 20, borderRadius: 4 }} />
            <View style={{ width: '20%', height: 20, marginLeft: '8%', borderRadius: 4 }} />
            <View style={{ width: '20%', height: 20, marginLeft: '8%', borderRadius: 4 }} />
            <View style={{ width: '20%', height: 20, marginLeft: '8%', borderRadius: 4 }} />
          </View>
        </View>
      </SkeletonPlaceholder>
    ));
    return skeletonItems;
  };
  return (
    <View style={styles.container}>
      <FlashMessage />
      <Navbar navigation={navigation} />
      <View >
        <View style={{ marginTop: '5%', flex: 1, marginLeft: '5%', flexDirection: 'column' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 25, fontWeight: '700', color: 'black', marginBottom: '0%' }}>Security Logs</Text>
              <Text style={{ fontSize: 15, fontWeight: '500', color: 'black' }}>{selectedOptions}</Text>
            </View>
            <View style={styles.dropdown1}>
              <Picker
                selectedValue={selectedOptionsForSorting}
                onValueChange={itemValue => setSelectedOptionsForSorting(itemValue)}
                itemStyle={{ color: 'black' }} // Set text color for Picker items
              >
                <Picker.Item label="ASCE" value="Ascending" />
                <Picker.Item label="DSCE" value="Descending" />
              </Picker>
            </View>
          </View>
        </View>
        <View horizontal={true}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
            {/* Picker */}
            <View style={styles.dropdown}>
              <Picker
                style={styles.picker}
                selectedValue={selectedOptions}
                onValueChange={itemValue => setSelectedOptions(itemValue)}
                itemStyle={{ color: 'black' }} // Set text color for Picker items
              >
                <Picker.Item label="QR Punches" value="QR Punches" />
                <Picker.Item label="QR Assigns" value="QR Assigns" />
              </Picker>
              {/* Custom Arrow Icon */}
              <View style={styles.arrowContainer}>
                <Icon name="caret-down" size={25} color="black" />
              </View>
            </View>
            {/* Search bar */}
            <View style={styles.searchBarContainer}>
              <Icon name="search" style={styles.searchIcon} />
              <TextInput
                style={{ ...styles.searchInput, color: 'black' }}
                placeholder="Search..."
                placeholderTextColor="black"
                onChangeText={text => {
                  setSearchText(text); // Update the searchText state variable on text change
                  handleSearch() || handleSearch1(); // Call the handleSearch function on text change
                }}
                onSubmitEditing={handleSearch || handleSearch1}
                value={searchText}
              />
            </View>
          </View>
          <View style={styles.securityLogsContainer}>
            {selectedOptions === 'QR Punches' ? (
              <FlatList
                data={filteredLogsByDate}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={renderSkeletonItem}
                ListHeaderComponent={tableHeader}
                stickyHeaderIndices={[0]}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                renderItem={({ item, index }) => (
                  // console.log("123456", item.Time),
                  <View style={styles.tableRow}>
                    <Text style={styles.columnRowTxt}>{++index}</Text>
                    <Text style={{ ...styles.columnRowTxt, marginLeft: '4%' }}>{item.Date}</Text>
                    <Text style={{ ...styles.columnRowTxt, marginLeft: '2%' }}>{item.Name}</Text>
                    <Text style={{ ...styles.columnRowTxt, marginLeft: '0%' }}>
                      {item.Type === 'Punch-In' ? (
                        <Feather name="log-in" style={{ ...styles.searchIcon, color: 'green' }} />
                      ) : (
                        <Feather name="log-out" style={{ ...styles.searchIcon, color: 'orange' }} />
                      )}
                      {new Date(item.Time).toLocaleString('en-US', {
                        timeZone: 'Asia/Kolkata', // Set the timezone to IST
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}
                    </Text>
                  </View>
                )}
              />
            ) : (
              <FlatList
                data={filteredLogsByDateq}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={renderSkeletonItem}
                ListHeaderComponent={tableHeader1}
                stickyHeaderIndices={[0]}
                refreshControl={
                  <RefreshControl refreshing={isLoading} onRefresh={fetchQdata} />
                }
                renderItem={({ item, index }) => (
                  console.log(item.Time),
                  <View style={styles.tableRow}>
                    <Text style={{ ...styles.columnRowTxt, margin: '0%' }}>{item.Date}</Text>
                    <Text style={{ ...styles.columnRowTxt, margin: '1%' }}>{item.Name}</Text>
                    <Text style={{ ...styles.columnRowTxt, paddingRight: '11%' }}>{item.Time}</Text>
                    <TouchableOpacity style={{ marginTop: '2.5%', paddingRight: '2%' }} onPress={() => handleOpenButtonPress(item.ProofPictureURL)}>
                      <Text style={{ ...styles.columnRowTxt, marginRight: 8, textDecorationLine: 'underline' }}>Open</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
            {selectedImageUrl && (
              <TouchableOpacity
                style={styles.overlayContainer}
                onPress={() => setSelectedImageUrl(null)}
              >
                <Image
                  style={styles.overlayImage}
                  source={{ uri: selectedImageUrl }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.dateFilterContainer}>
            <TouchableOpacity onPress={handlePrevDate}>
              <Icon name="arrow-left" size={20} color="black" />
            </TouchableOpacity>
            <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
            <TouchableOpacity onPress={handleNextDate}>
              <Icon name="arrow-right" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop:16,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayImage: {
    width: 400,
    height: 400,
  },
  dataWrapper: {
    borderRadius: 8,
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 10,
  },
  arrowIcon: {
    marginRight: '20%'
  },
  arrowContainer: {
    position: 'absolute',
    right: '50%',
  },
  text: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    padding: 10, // Reduce the padding for better fitting in table cells
    textAlign: 'center', // Center the text within each cell
    fontFamily: 'Inter',
    fontWeight: "bold",
    marginLeft: '2%'
  },
  Bodytext: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    padding: 6,
  },
  header: {
    backgroundColor: '#ECEDFE',
    paddingVertical: '4%',
    marginBottom: '2%',
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
  row: {
    borderBottomColor: '#C1C0B9',
    borderBottomWidth: 1,
  },
  searchBarContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: '4%',
    marginBottom: '1%',
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    // height:40,
    marginTop: '5%',
    borderWidth: 2,
    elevation: 2,
    borderRadius: 15,
    borderColor: '#F0F0F0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: '9%',
    color: '#333',
  },
  searchInput: {
    fontSize: 16,
    height: 40,
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    width: '100%', // Set the row width to the screen width
    color: 'black',
    justifyContent: 'space-around',
    flex: 1,
    borderWidth: 1
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    width: '16%', // Set the width to a small value to make the dropdown small
    height: '34%',
    flexWrap: 'wrap',
  },
  dropdown1: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    width: '40%', // Set the width to a small value to make the dropdown small
    // padding: '2%',
    marginRight: 5,
  },
  picker: {
    height: '14%',
    width: '100%',
    color: '#000',
  },
  columnRowTxt: {
    color: 'black',
    flex: 1, // Set each column to occupy an equal portion of the row
    textAlign: "center",
    fontSize: 13
  },
  securityLogsContainer: {
    backgroundColor: '#fff',
    height: '75%'
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderColor: '#283093',
    borderWidth: 1,
    borderRadius: 10, // Adjust the border radius as needed
    paddingHorizontal: 12,
    paddingVertical: '2.5%',
    maxWidth: 200,
    marginLeft: '25%'
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#283093'
  },
});

export default Logs;



/*

// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Text, TouchableOpacity, Dimensions, TextInput } from 'react-native';
// import { FlatList } from 'react-native';
// import axios from 'axios';
// import Navbar from './Navbar/Navbar';

// const Logs = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchText, setSearchText] = useState('');
//   const [isLogin, setIsLogin] = useState(false);
//   const [columns, setColumns] = useState([
//     "Sequence",
//     "Date",
//     "Name",
//     "Time",
//   ]);

//   const [data, setData] = useState([]);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setIsLoading(true);

//     try {
//       const res = await axios.get(
//         'https://hrms-backend-04fw.onrender.com/api/v1/attendance/getPunchInPunchOut'
//       );
//       const parsedData = res?.data;
//       console.log("Logs", parsedData);
//       const userData = parsedData.punchIn;
//       console.log("UserData", userData);

//       // Map the data to add the required fields
//       const mappedData = userData.map((item, index) => {
//         console.log(item);
//         const punchInDateTime = new Date(item.punch.punchIn);
//         console.log(punchInDateTime);
//         const punchInDate = punchInDateTime.toISOString().split('T')[0];
//         const punchInTime = punchInDateTime.toISOString().split('T')[1].split('.')[0];
//         return {
//           Sequence: index + 1,
//           Date: punchInDate,
//           Name: item.employee ? item.employee.name : "ashok",
//           Time: punchInTime
//         };
//       });
//       console.log("Mapped Data", mappedData);
//       setData(mappedData);
//       setIsLoading(false);
//       setIsLogin(true);
//       alert('Attendance successful');
//     } catch (err) {
//       console.log(`API Error: ${err}`);
//       setIsLoading(false);
//     }
//   };

//   const tableHeader = () => (
//     <View style={styles.tableHeader}>
//       {columns.map((column, index) => (
//           <Text style={styles.columnHeaderTxt}>{column + " "}</Text>
//       ))}
//     </View>
//   );

//   return (
//     <View style={styles.container}>
    // {/* Navbar at the top */
//       <Navbar />

//       <View style={styles.securityLogsContainer}>
//         {/* "Security Logs" text */}
//         <Text style={styles.securityLogsText}>Security Logs</Text>

//         {/* Search bar */}
//         <View style={styles.searchBarContainer}>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search..."
//             onChangeText={(text) => setSearchText(text)}
//             value={searchText}
//           />
//         </View>
//       </View>

//       <View style={styles.logListContainer}>
//         <FlatList
//           data={data}
//           keyExtractor={(item, index) => index.toString()}
//           ListHeaderComponent={tableHeader}
//           stickyHeaderIndices={[0]}
//           renderItem={({ item, index }) => (
//             <View style={{ ...styles.tableRow, backgroundColor: index % 2 == 1 ? "#F0FBFC" : "white" }}>
//               <Text style={styles.columnRowTxt}>{item.Sequence}</Text>
//               <Text style={styles.columnRowTxt}>{item.Date}</Text>
//               <Text style={{ ...styles.columnRowTxt, fontWeight: "bold" }}>{item.Name}</Text>
//               <Text style={styles.columnRowTxt}>{item.Time}</Text>
//             </View>
//           )}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },

//   securityLogsContainer: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//   },

//   securityLogsText: {
//     fontSize: 19,
//     fontWeight: '700',
//     color: 'black',
//     textAlign: 'center',
//   },

//   searchBarContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     paddingTop: 10,
//   },

//   searchInput: {
//     width: Dimensions.get('window').width * 0.6,
//     height: 30,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     paddingHorizontal: 8,
//   },

//   logListContainer: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//   },

//   tableHeader: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     alignItems: "center",
//     backgroundColor: "#37C2D0",
//     borderTopEndRadius: 10,
//     borderTopStartRadius: 10,
//     height: 50,
//   },

//   tableRow: {
//     flexDirection: "row",
//     height: 40,
//     alignItems: "center",
//     width: '100%', // Set the row width to the screen width
//   },

//   columnHeader: {
//     flex: 1, // Set each column to occupy an equal portion of the row
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   columnHeaderTxt: {
//     color: "white",
//     fontWeight: "bold",
//   },

//   columnRowTxt: {
//     color: 'black',
//     flex: 1, // Set each column to occupy an equal portion of the row
//     textAlign: "center",
//   },
// });

// export default Logs;
