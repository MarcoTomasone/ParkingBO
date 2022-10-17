import React, { Component } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import MapboxGL from "@rnmapbox/maps";
import Geolocation from '@react-native-community/geolocation'

const ACCESS_TOKEN: string = "sk.eyJ1IjoibHVjYWpldHQiLCJhIjoiY2w5YnBxYjZlMGIyejNwbzAxaDgyanh1dSJ9.o9IxOf7DSZpBPirPkoTUFQ"

MapboxGL.setWellKnownTileServer('Mapbox');
MapboxGL.setAccessToken(ACCESS_TOKEN);

interface IProps{}
interface IState {
    coordinates: [number, number ] , req: boolean
}
class Map extends Component<IProps,IState> {
    constructor(props: any) {
        super(props);
        
       this.state= {
          coordinates: [11.346597927619127, 44.49422570257762], //coordinate base Bologna
          req : false
        };
        this.location();
       setInterval(this.location.bind(this),3000)
    }

    location(){
      Geolocation.getCurrentPosition(
        (position) => {
          let arr: [number,number] = [position.coords.longitude,position.coords.latitude]
          let obj ={ coordinates : arr , req: true};
          this.setState(obj);
        },
        (error) => {Alert.alert("Error in getCurrentPosition")},
        { enableHighAccuracy: (this.state.req ? false : true), timeout: 3000, maximumAge : 10000},
      );
    }

    componentDidMount() {
      MapboxGL.setTelemetryEnabled(false);
      this.location();
    }
  
    render() {
      return (
        <View style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView style={styles.map}>
            <MapboxGL.Camera
              zoomLevel={this.state.req ? 15 : 6}
              centerCoordinate={this.state.coordinates}
            />
            <MapboxGL.PointAnnotation coordinate={this.state.coordinates} />
          </MapboxGL.MapView>
        </View>
      </View>
      );
    }
  }
  const styles = StyleSheet.create({
    page: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5FCFF"
    },
    container: {
      height: 600,
      width: 300,
      backgroundColor: "tomato"
    },
    map: {
      flex: 1
    }
  });
  export default Map;