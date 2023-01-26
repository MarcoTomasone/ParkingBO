import React from 'react';
import { MapContainer, Marker, TileLayer, AttributionControl, GeoJSON } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { TextField, Card, CardContent, Typography, Switch, FormControl, Grid  } from '@mui/material';
import { kmeans, getData } from '../../utils/requests';
import "leaflet/dist/leaflet.css";
const L = require('leaflet');

//type used for determining the type of cluster to render
enum clusterType {
    AllClusters = "all_clusters",
    OnlyCentroid = "only_centroid",
}


const carIcon = L.icon({
    iconUrl: require('../../supports/car_icon.png'),
    iconSize: [45,45],
    iconAnchor: [32, 64],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
});

const markerIcon = L.icon({
    iconUrl: require('../../supports/marker_icon.png'),
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
    clusters: any;
    colorField: any;
    render: clusterType;
};

class MapKmeans extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            polygons: [],
            clusters: [],
            colorField: "primary",
            render: clusterType.AllClusters,
        };
    }

    componentDidMount(): void {
        this.getPolygons();
    }

    /**
     * This method is used to get Polygons from the zone.geojson local file
     */
    private async getPolygons(): Promise<void> {
        //get the polygons from the zone.geojson file stored in the server
        const polygons: any = await getData('zone.geojson');
        if (polygons) {
            this.setState({polygons: <GeoJSON key="polygons" attribution="&copy; credits due..."  data={polygons} style={{color: "#008b8b", fillColor: "#008b8b"}}  />});
        }
    }

    /**
     * This method check if the size is valid and then get the cluster markers or set the state to empty
     * @param value is the size of the cluster
     */
    private handleChange = (value: any): void => {
        if(value == "") this.setState({clusters: [], colorField: "primary"});
        else {
            const size = Number(value);
            if(size <= 0 || isNaN(size))
                this.setState({clusters: [], colorField: "error"});
            else {
                this.setState({colorField: "success"});
                this.getClusterMarkers(size);
            }
        }
    }

    /**
     * This method is used to handle the change of the text field
     * @param event is the event of the text field
     */
    private handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        this.handleChange(value);
    };

    /**
     * This method is used to handle the change of the switch
     * @param event is the event of the switch
     */
    private handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const checked = event.target.checked;
        if(checked) this.setState({render: clusterType.OnlyCentroid});
        else this.setState({render: clusterType.AllClusters});
        const value = (document.getElementById("size") as HTMLInputElement)?.value;
        this.handleChange(value);

    }

    /**
     * This method is used to get the cluster markers from the kmeans algorithm (backend)
     * @param size is the size of the cluster
     */
    private getClusterMarkers = async (size: number): Promise<void> => {
        await this.setState({clusters: []});
        const result: any = await kmeans(Number(size));
        let clusters: any = [];
        let cont: number = 0; //for keys
        try {
            result?.forEach((element: any, index: number) => {
                const markers: any = [];
                //if we have a cluster with no elements we throw an error
                if(element.cluster.length === 0) throw new Error("Cluster size troppo grande per il numero di dati.\n");
                
                //if we have to render only the centroid of each cluster
                if(this.state.render == clusterType.OnlyCentroid) {
                    cont++;
                    clusters.push(<MarkerClusterGroup
                        key={"cluster_" + cont}
                        spiderfyDistanceMultiplier={1}
                        showCoverageOnHover={false}>
                        <Marker
                            key={cont + "_marker"}
                            position={[element.centroid[1], element.centroid[0]]} //reverse coords
                            title={element.centroid[0]}
                            icon={markerIcon}>
                        </Marker></MarkerClusterGroup>);
                    
                }
                //if we have to render all elements of each cluster
                else {                
                    element.cluster.forEach((coord: any, index: number) => {
                        cont++;
                        markers.push(<Marker
                            key={cont + "_marker"}
                            position={[coord[1], coord[0]]} //reverse coords
                            title={coord[1]}
                            icon={carIcon}
                        ></Marker>)
                    });
                
                    clusters.push(
                        <MarkerClusterGroup
                            key={"cluster_" + cont}
                            spiderfyDistanceMultiplier={1}
                            showCoverageOnHover={false}>
                                {markers}
                        </MarkerClusterGroup>
                    );
                }
            });
            //update the state with the new clusters
            this.setState({clusters: clusters});
        } catch (error) {
            this.setState({colorField: "error", clusters: []});
            console.log(error);
            alert(error);
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
            {this.state.clusters}
        </MapContainer>
        <Card sx={{backgroundColor: "rgba(28,28,28, 0.98)", borderRadius: '25px', position: 'absolute', width: 450, height: 250, top: 300, left: 50, zIndex: 2}}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography  variant="h6" color="white" sx={{paddingTop: 3, paddingLeft: 2}}>
                            Scrivi il numero di cluster che vuoi ottenere
                        </Typography>
                        <TextField
                            id="size"
                            variant="filled"
                            required
                            label="K-Means'size"
                            color={this.state.colorField}
                            sx={{backgroundColor: "white", top: 20, left: 20, borderRadius: '5px'}}
                            onChange={this.handleFieldChange}>
                        </TextField>
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{marginTop: 5}}>
                    <Grid item xs={5}>
                        <Typography variant="h6" color={this.state.render == clusterType.AllClusters ? 'white' : 'black'}>Tutto il cluster</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <FormControl component="fieldset">
                            <Switch color="primary" onChange={this.handleSwitchChange}/>
                        </FormControl>
                    </Grid>
                    <Grid item xs={5}>
                        <Typography variant='h6' color={this.state.render == clusterType.OnlyCentroid ? 'white' : 'black'}>Solo il centroide</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
        
      </div>
    );
  }
}

export default MapKmeans;