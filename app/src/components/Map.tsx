import React, { Component } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapboxGL from "@rnmapbox/maps";
import Geolocation from '@react-native-community/geolocation'
import { zone } from '../support/utils';

const ACCESS_TOKEN: string = "sk.eyJ1IjoibHVjYWpldHQiLCJhIjoiY2w5YnBxYjZlMGIyejNwbzAxaDgyanh1dSJ9.o9IxOf7DSZpBPirPkoTUFQ"


MapboxGL.setWellKnownTileServer('Mapbox');
MapboxGL.setAccessToken(ACCESS_TOKEN);

interface IProps{}
interface IState {
    coordinates: [number, number],
    req: boolean
}
class Map extends Component<IProps,IState> {
    constructor(props: any) {
        super(props);
        
       this.state= {
          coordinates: [11.346597927619127, 44.49422570257762], //coordinate base Bologna
          req : false
        };
        //setInterval(this.getCurrentLocation.bind(this),3000)
    }

    private getCurrentLocation = async () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [position.coords.longitude,position.coords.latitude]
          let obj = { coordinates : location , req: true};
          this.setState(obj);
        },
        (error) => {Alert.alert("Error in getCurrentLocation()")},
        { enableHighAccuracy: (this.state.req ? false : true), timeout: 3000, maximumAge : 10000},
      );
    }

    componentDidMount() {
      MapboxGL.setTelemetryEnabled(false);
      this.getCurrentLocation();
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
             <MapboxGL.ShapeSource id={'some-feature'} shape={zone}>
                <MapboxGL.LineLayer
                    sourceID="some-feature"
                    id="some-feature-line"
                    style={{
                        lineColor: 'red',
                        lineWidth: 3,
                    }}
                />
                <MapboxGL.FillLayer id="fill" style={{ fillColor: "#b9f2ff", fillOpacity: 0.7  }} />
            </MapboxGL.ShapeSource>
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