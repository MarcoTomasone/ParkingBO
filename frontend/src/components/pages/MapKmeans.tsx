import React, { Component } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, AttributionControl, GeoJSON } from "react-leaflet";
import { zone } from '../../supports/zone';
import { kmeans } from '../../utils/requests';
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from 'react-leaflet-cluster';
import TextField from '@mui/material/TextField';
import { Button, Grid, Typography } from '@mui/material';

const L = require('leaflet');

const myIcon = L.icon({
    iconUrl: require('../../supports/car_icon.png'),
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
    polygons: any;
    markers: any;
    colorField: any;
};

class MapKmeans extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            polygons: [],
            markers: [],
            colorField: "primary"
        };
    }

    async componentDidMount(): Promise<void> {
        this.getPolygons();
    }

    private getPolygons(): any {
        const polygons: any = zone;
        if (polygons) {
            this.setState({polygons: <GeoJSON key="polygons" attribution="&copy; credits due..."  data={polygons} style={{color: "#008b8b", fillColor: "#008b8b"}}  />});
        }
    }

    private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        if(value == "") this.setState({markers: [], colorField: "primary"});
        else {
            const size = Number(value);
            if(size <= 0 || isNaN(size))
                this.setState({markers: [], colorField: "error"});
            else {
                this.setState({colorField: "success"});
                this.getClusterMarkers(size);
            }
        }
    }

    private getClusterMarkers = async (size: number): Promise<void> => {
        await this.setState({markers: []});
        const result: any = await kmeans(Number(size)); //TODO: controllo numero di cluster vuoti
        const clusters: any = [];
        let cont: number = 0; //for keys
        try {
            result?.forEach((element: any, index: number) => {
                const markers: any = [];
                if(element.cluster.length === 0) throw new Error("Cluster size troppo grande per il numero di dati.\n");
                element.cluster.forEach((coord: any, index: number) => {
                    cont++;
                    markers.push(<Marker
                        key={cont + "_marker"}
                        position={[coord[1], coord[0]]} //reverse coords
                        title={coord[1]}
                        icon={myIcon}
                    ></Marker>)
                });
                clusters.push(<MarkerClusterGroup key={"cluster_" + cont} spiderfyDistanceMultiplier={1} showCoverageOnHover={false} color={"red"}> {markers} </MarkerClusterGroup>);
            });
            this.setState({markers: clusters});
        } catch (error) {
            this.setState({colorField: "error", markers: []});
            console.log(error);
            alert(error + "Ora viene settata la size a 1");
        }

    }

  render() {
    return (
      <div>
        <MapContainer
          style={{ height: "100vh", opacity: "0.9" }}
          zoomSnap={0.25}
          zoom={12.25}
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
        <div style={{backgroundColor: "rgba(28,28,28, 0.88)", borderRadius: '25px', position: 'absolute', width: 450, height: 220, top: 300, left: 50, zIndex: 2}}>
            <Typography  variant="h6" color="white" sx={{paddingTop: 5, paddingLeft: 2}}>
                Scrivi il numero di cluster che vuoi ottenere
            </Typography>
            <TextField
                id="size"
                variant="filled"
                required
                label="K-Means'size"
                color={this.state.colorField}
                sx={{backgroundColor: "white", top: 20, left: 20, borderRadius: '5px'}}
                onChange={this.handleChange}>
            </TextField>
        </div>
      </div>
    );
  }
}

export default MapKmeans;