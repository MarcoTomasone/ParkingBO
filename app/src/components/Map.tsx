import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MapboxGL from "@rnmapbox/maps";
const ACCESS_TOKEN: string = "sk.eyJ1IjoibHVjYWpldHQiLCJhIjoiY2w5YnBxYjZlMGIyejNwbzAxaDgyanh1dSJ9.o9IxOf7DSZpBPirPkoTUFQ"

MapboxGL.setWellKnownTileServer('Mapbox');
MapboxGL.setAccessToken(ACCESS_TOKEN);

interface IProps{}
interface IState {
    coordinates: [number, number]
}
class Map extends Component<IProps,IState> {
    constructor(props: any) {
        super(props);
       this.state= {
          coordinates: [11.346597927619127, 44.49422570257762] //coordinate base Bologna
        };
    }

    componentDidMount() {
      MapboxGL.setTelemetryEnabled(false);
      //aggiornare lo stato chiamando la funzione getCurrentLocation() fatta da Simone
      //aggiorare solo se la funzione ritorna qualcosa di sensato (mettere i controlli)
      //this.setState({coordinates: getCurrentLocation()});
    }
  
    render() {
      return (
        <View style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView style={styles.map}>
            <MapboxGL.Camera
              zoomLevel={12}
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