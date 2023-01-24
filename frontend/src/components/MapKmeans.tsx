import React, { Component } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, AttributionControl, GeoJSON } from "react-leaflet";
import { zone } from '../supports/zone';
import { kmeans } from '../utils/requests';
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from 'react-leaflet-cluster';
import cluster from 'cluster';

const L = require('leaflet');

const myIcon = L.icon({
    iconUrl: require('../supports/car_icon.png'),
    iconSize: [32,32],
    iconAnchor: [32, 64],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
});


type Props = {};
//state for the nav menu
type State = {
    result: any;
    polygons: any;
    markers: any;
    dialog: any;
};

class MapKmeans extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            result: null,
            polygons: [],
            dialog: React.createRef(),
            markers: [],
        };
    }

    async componentDidMount(): Promise<void> {
        this.getPolygons();
        const result: any = await kmeans(3); //TODO: controllo numero di cluster vuoti
        const clusters_coords: any = [];
        for(let i in result) {
            clusters_coords.push(result[i].cluster);
        }   
        await this.setState({result: clusters_coords});
        this.getClusterMarkers();

    }

    private getPolygons(): any {
        const polygons: any = zone;
        if (polygons) {
            this.setState({polygons: <GeoJSON key="polygons" attribution="&copy; credits due..."  data={polygons} style={{color: "#008b8b", fillColor: "#008b8b"}}  />});
        }
    }

    private getClusterMarkers(): void {
        const n_cluster: number = this.state.result?.length;
        const clusters: any = [];
        for(let i = 0; i < n_cluster; i++) {
            const markers: any = [];
            this.state.result?.map((coords: any) => (
                coords.forEach((coord: any, index: number) => {
                    markers.push(<Marker
                        key={i + "_" + index + "_marker"}
                        position={[coord[1], coord[0]]} //reverse coords
                        title={coord[1]}
                        icon={myIcon}
                    ></Marker>)
                })
            ));
            clusters.push(<MarkerClusterGroup key={"cluster_" + i} spiderfyDistanceMultiplier={1} showCoverageOnHover={false}> {markers} </MarkerClusterGroup>);
        }
        this.setState({markers: clusters});
    }


  render() {
    return (
      <div>
        <MapContainer
          style={{ height: "100vh", opacity: "0.9" }}
          zoom={14}
          maxZoom={20}
          center={[44.495852858541745, 11.339634125175587]}
          attributionControl={false}>
          <TileLayer url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png"
            attribution="Map by <a href='http://stamen.com' target='_blank'>Stamen Design</a> | &copy; <a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors"
          />
            {this.state.polygons}
          <AttributionControl position="bottomright" prefix={false} />
            {this.state.markers}
        </MapContainer>
      </div>
    );
  }
}

export default MapKmeans;