import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { database, storage } from './Firebase'
import { collection, addDoc, getDocs} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 

export default function App() {
  const [markers, setMarkers] = useState([])
  const [imagePath, setImagePath] = useState(null)
  const locationSubscription = useRef(null)
  const [region, setRegion] = useState(null)

  useEffect(() => {
    async function startListener() {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if(status !== 'granted') {
        alert("Location access denied!")
        return
      }
      locationSubscription.current = await Location.watchPositionAsync({
        distanceInterval: 100,
        accuracy: Location.Accuracy.High
      }, (location) => {
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 5,
          longitudeDelta: 5
        };
        setRegion(newRegion)
        if(MapView.current) {
          MapView.current.animateToRegion(newRegion)
        }
      })
    }
    startListener()
    return () => {
      if(locationSubscription.current) return locationSubscription.current.remove()
    }
  }, [])

  async function loadMarkers() {
    console.log("loading markers...")
    const markersList = collection(database, 'markers');
    const docs = await getDocs(markersList);
    const markersTemp = [];
    docs.forEach((doc) => {
      let markerData = doc.data();
      markersTemp.push({
        id: markerData.id,
        latitude: markerData.latitude,
        longitude: markerData.longitude
      });
    });
    setMarkers(markersTemp);
  }

  useEffect(() => {
    loadMarkers();
  }, []);

  async function saveMarker(marker) {
    try {
      addDoc(collection(database, "markers"), {
        id: marker.id,
        latitude: marker.coordinate.latitude,
        longitude: marker.coordinate.longitude
      })
      loadMarkers();
    } catch (error) {
      alert("Failed to save marker!");
    }
  }

  async function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate
    const timeStamp = data.timeStamp
    const imageResult = await selectImage()
    await uploadImage(imageResult, timeStamp)
    const newMarker = {
      coordinate: {latitude, longitude},  
      id: timeStamp,
      image: imageResult
    }
    saveMarker(newMarker)
  }

  async function uploadImage(imageUri, timeStamp) {
    const image = await fetch(imageUri)
    const blob = await image.blob();
    const newImageRef = ref(storage, `${timeStamp}.jpg`);
    try {
      await uploadBytes(newImageRef, blob);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  async function getImage(id) {
    getDownloadURL(ref(storage, id + ".jpg"))
    .then((url) => {
      setImagePath(url)
    })
    .catch(error => {
      alert("Error trying to get image!")
    })
  }

  async function selectImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true })
    if(!result.canceled) {
      const imageResult = result.assets[0].uri
      return imageResult
    }
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        region={region}
        onLongPress={addMarker}>
        
        {markers.map(marker => (
          <Marker
            coordinate={{latitude: marker.latitude, longitude: marker.longitude}}
            key={marker.id}
            onPress={() => getImage(marker.id)}
          />
        ))}
      </MapView>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{uri: imagePath}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '60%'
  },
  imageContainer: {
    margin: 15,
    alignItems: 'center',
  },
  image: {
    borderRadius: '8',
    width: 250, 
    height: 250,
  }
});
