import React, {useState,useEffect} from 'react';
import { View, Text} from 'react-native';


import Geolocation from '@react-native-community/geolocation';


const Location = () => {
    const [position, setPosition] = useState({
        latitude: 10,
        longitude: 10,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    
      useEffect(() => {
        Geolocation.getCurrentPosition((pos) => {
          var crd = pos.coords;
          setPosition({
            latitude: crd.latitude,
            longitude: crd.longitude,
            latitudeDelta: 0.0421,
            longitudeDelta: 0.0421,
          });
        })
      }, []);
    
      return (
        <View>
            <Text>Longitudine: {position.longitude}; Latitudine:{position.latitude}</Text>
        </View>
      );
    };
     
export default Location;
