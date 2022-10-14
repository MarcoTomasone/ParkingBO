import React, {useState} from 'react';
import { View, Text ,Alert} from 'react-native';

import Geolocation from '@react-native-community/geolocation';


const Location = () => {

    const [
        currentLongitude,
        setCurrentLongitude
      ] = useState(Number);
      const [
        currentLatitude,
        setCurrentLatitude
      ] = useState(Number);
     
    Geolocation.getCurrentPosition(
        //Will give you the current location
        (position) => {
        
        //Setting Longitude state
        setCurrentLongitude(position.coords.longitude);
        
        //Setting Longitude state
        setCurrentLatitude(position.coords.latitude);
            }, (error) => Alert.alert(error.message), { 
            enableHighAccuracy: false,timeout :200 ,maximumAge: 1000 
            //if we enableHighaccuracy the time of response might be longer than false & increased power consumption
            }
        );

    return (
        <View>
            <Text>Position: Long:{currentLongitude} Lat:{currentLatitude} </Text>
        </View>
    );

}
export default Location;
