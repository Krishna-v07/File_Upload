import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView, Text, View, ScrollView, Modal, FlatList, StyleSheet, StatusBar,
  TouchableOpacity, Button,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
import axios from 'axios';
import Upload from 'react-native-vector-icons/FontAwesome5'
import RBSheet from "react-native-raw-bottom-sheet";
import {
  launchCamera,
  launchImageLibrary
} from 'react-native-image-picker';
import { RadioButton } from 'react-native-paper';
import { SpeedDial } from 'react-native-elements/dist/buttons/SpeedDial';

import ImageViewer from 'react-native-image-zoom-viewer';

const App = () => {
  const [filePath, setFilePath] = useState({});
  const [checked, setChecked] = React.useState('first');
  const [uploadedata, setuploadedata] = useState(null);
  const [zoome, setzoome] = useState(null)
  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    BindImages();
  }, [])




  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission',
          },
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };


  const requestExternalWritePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs write permission',
          },
        );
        // If WRITE_EXTERNAL_STORAGE Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Write permission err', err);
      }
      return false;
    } else return true;
  };



  const captureImage = async (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      videoQuality: 'low',
      durationLimit: 30, //Video max duration in seconds
      saveToPhotos: true,
    };
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();
    if (isCameraPermitted && isStoragePermitted) {
      launchCamera(options, (response) => {
        //console.log('Response = ', response);
        // if (response.didCancel) {
        //   alert('User cancelled camera picker');
        //   return;
        // } else

        if (response.errorCode == 'camera_unavailable') {
          alert('Camera not available on device');
          return;
        } else if (response.errorCode == 'permission') {
          alert('Permission not satisfied');
          return;
        } else if (response.errorCode == 'others') {
          alert(response.errorMessage);
          return;
        }
        // console.log('base64 -> ', response.base64);
        // console.log('uri -> ', response.uri);
        // console.log('width -> ', response.width);
        // console.log('height -> ', response.height);
        // console.log('fileSize -> ', response.fileSize);
        // console.log('type -> ', response.type);
        // console.log('fileName -> ', response.fileName);
        setFilePath(response);
      });
    }
  };



  const chooseFile = (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      // console.log('Response = ', response);
      // if (response.didCancel) {
      //   alert('User cancelled camera picker');
      //   return;
      // } else 
      if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      // console.log('base64 -> ', response.base64);
      // console.log('uri -> ', response.uri);
      // console.log('width -> ', response.width);
      // console.log('height -> ', response.height);
      // console.log('fileSize -> ', response.fileSize);
      // console.log('type -> ', response.type);
      // console.log('fileName -> ', response.fileName);
      setFilePath(response);
    });
  };


  const refRBSheet = useRef();


  const handelupload = async () => { 
    var res = filePath.uri.replace("rn_image_picker_lib_temp_", "");
    RNFetchBlob.fetch('POST', 'http://103.74.227.235:8090/fileinsert', {
      'Content-Type': 'multipart/form-data',
    }, [
      //--------1 line------//
      { name: 'doc', filename: res, type: "data.type", data: RNFetchBlob.wrap(filePath.uri) },
      //--------2 line------//
      {
        name: 'info', data: JSON.stringify({
          type: checked,
        })
      },

    ]).then((resp) => {
      BindImages();
      //console.log(resp)
      refRBSheet.current.close()

      // ...
    }).catch((err) => {
      // ...
      refRBSheet.current.close()
      console.log(err)
    })


  }



  const BindImages = () => {
    axios.get("http://103.74.227.235:8090/fileupload").then((response) => {
      if (response.data.length !== 0) {
        var datas = [];
        for (var i = 0; i < response.data.length; i++) {
          datas.push({ id: response.data[i].id, filename: "http://103.74.227.235:8090/images/" + response.data[i].filenane })
        }
        setuploadedata(datas)
      } else {
        setuploadedata("No Data")
      }
    }).catch((error) => {
      console.log(error)
      setuploadedata(DATA)
    })
  }




  const ZoomImages = (e) => {
    var urlimages = [{ url: e, }]
    setzoome(urlimages);
    setModalVisible(true);
  }


  const Item = ({ title }) => (
    console.log(title),
    <TouchableOpacity
      onPress={() => ZoomImages(title)}
      style={styles.item}>
      <Image
        resizeMethod="auto"
        resizeMode="cover"
        style={{ height: "100%", width: "100%", borderRadius: 2 }}
        source={
          {
            uri: title
            //uri: 'https://thumbs.dreamstime.com/b/environment-earth-day-hands-trees-growing-seedlings-bokeh-green-background-female-hand-holding-tree-nature-field-gra-130247647.jpg',
          }
        }
      />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Item title={item.filename} />
  );





  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#ffa000"
        barStyle="dark-content"
      />
      <View style={{ flexDirection: "row", backgroundColor: "#ffa000" }}>
        <View style={{ width: "50%", paddingVertical: 20 }}>
          <Text style={{ marginLeft: 20, fontSize: 18, fontWeight: "bold" }}>File Upload</Text>
        </View>
        <View style={{ width: "50%", justifyContent: "center", }}>
          <TouchableOpacity onPress={() => { refRBSheet.current.open() }}>
            <Upload size={30} name="file-upload" style={{ textAlign: "right", paddingRight: 50 }} />
          </TouchableOpacity>
        </View>
      </View>


      <View>

        {
          uploadedata !== null ? <FlatList
            data={uploadedata}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          /> :
            <Text>Loading..</Text>
        }

      </View>




      <RBSheet
        ref={refRBSheet}
        height={350}
        closeOnDragDown={true}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent"
          },
          draggableIcon: {
            backgroundColor: "#000"
          }
        }}>

        {/* <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 15 }}>Select a Photo</Text> */}

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <View
            // onPress={() => {
            //   chooseFile('photo')
            // }}
            style={{
              height: 100, width: 200, backgroundColor: "red", alignItems: "center", borderRadius: 2,
              borderWidth: 2
            }}>
            <Image
              resizeMethod="auto"
              resizeMode="cover"
              style={{ height: "100%", width: "100%", borderRadius: 2 }}
              source={
                {
                  uri: filePath.uri
                  //uri: 'https://thumbs.dreamstime.com/b/environment-earth-day-hands-trees-growing-seedlings-bokeh-green-background-female-hand-holding-tree-nature-field-gra-130247647.jpg',
                }
              }
            />
          </View>
        </View>


        <View style={{ flexDirection: "row", marginTop: 5, }}>

          <View style={{ width: "50%", height: 50, flexDirection: "row" }}>
            <View style={{ width: "70%", justifyContent: "center" }}>
              <Text style={{ textAlign: "right" }}>Tagged Bills</Text>
            </View>
            <View style={{ width: "30%", alignItems: "center", justifyContent: "center" }}>
              <RadioButton
                value="first"
                status={checked === 'first' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('first')}
              />
            </View>
          </View>
 

          <View style={{ width: "50%", height: 50, flexDirection: "row" }}>
            <View style={{ width: "60%", justifyContent: "center" }}>
              <Text style={{ textAlign: "right" }}>Other Document</Text>
            </View>
            <View style={{ width: "30%", alignItems: "center", justifyContent: "center" }}>
              <RadioButton
                value="second"
                status={checked === 'second' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('second')}
              />
            </View>
          </View>
          {/* <RadioButton
            value="first"
            status={checked === 'first' ? 'checked' : 'unchecked'}
            onPress={() => setChecked('first')}
          />
          <RadioButton
            value="second"
            status={checked === 'second' ? 'checked' : 'unchecked'}
            onPress={() => setChecked('second')}
          /> */}
        </View>


        <View style={{ flexDirection: "row", paddingHorizontal: 10 }}>
          <TouchableOpacity style={{ ...styles.buttond, marginTop: 10, width: "50%" }}
            onPress={() => {
              captureImage('photo')
            }}
          >
            <Text style={{ textAlign: "center", fontSize: 13, fontWeight: "bold" }}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ ...styles.buttond, marginTop: 10, width: "48%", marginLeft: 5 }}
            onPress={() => {
              chooseFile('photo')
            }}
          >
            <Text style={{ textAlign: "center", fontSize: 13, fontWeight: "bold" }}>Choose From Library..</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity style={{ ...styles.buttond, marginTop: 20, marginHorizontal: 15 }}
          onPress={() => {
            handelupload()
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 13, fontWeight: "bold" }}>Upload</Text>
        </TouchableOpacity>




      </RBSheet>




      <Modal visible={modalVisible} transparent={true}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>

        <ImageViewer imageUrls={zoome} />
      </Modal>



     



    </SafeAreaView>
  )
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttond: {
    backgroundColor: "#ffa000",
    paddingVertical: 15,
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 18,
  },
  item: {
    backgroundColor: '#f9c2ff',
    //padding: 20,
    borderWidth: 2,
    marginVertical: 8,
    marginHorizontal: 16,
    height: 150,
  },
  title: {
    fontSize: 32,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    width: "90%",
    margin: 10,
    backgroundColor: "white",
    borderRadius: 2,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
})