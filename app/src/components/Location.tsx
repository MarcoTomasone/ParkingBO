import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Geolocation from '@react-native-community/geolocation'

interface IProps{}
interface IState {
  latitude: number,
  longitude: number,
  error:string
}
class Location extends Component<IProps,IState> {
  watchId : any;

  constructor(props: any) {
    super(props);

   this.state= {
      latitude: 0,
      longitude: 0,
      error:""
    };

   setInterval(this.getLocation.bind(this),3000)
  }

 getLocation(){
    this.watchId = Geolocation.getCurrentPosition(
      (position) => {
        let obj = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: ""
        }
        this.setState(obj);
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 2000, maximumAge : 1000},
    );
  }

 componentDidMount() {
    this.getLocation()
  }

 componentWillUnmount() {
    Geolocation.clearWatch(this.watchId);
  }

 render() {
    return (

             <View style={{ position: 'relative', top: 70, flexGrow: 1, 
alignItems: 'center', justifyContent: 'center'} }>
              <Text style={{color:'red'}}> Latitude: {this.state.latitude}</Text>
              <Text style={{color:'red'}}>Longitude: {this.state.longitude}</Text>
                {this.state.error ? <Text>Error: {this.state.error}</Text> : null}
             </View>

    );
  }
}

export default Location;