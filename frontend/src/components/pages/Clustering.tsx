import React from 'react';
import { MapContainer, Marker, TileLayer, AttributionControl, GeoJSON } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { TextField, Card, CardContent, Typography, Switch, FormControl, Grid, Button, RadioGroup, Radio, FormControlLabel, FormLabel, Slider, styled, Checkbox, Input   } from '@mui/material';
import { kmeans, getData, dbscan } from '../../utils/requests';
import "leaflet/dist/leaflet.css";
const L = require('leaflet');


enum clusterAlgorithm {
    Kmeans = "kmeans",
    DBSCAN = "dbscan",
}

const sliders_dbscan = {epsilon: {min: 0.0001, max: 0.01, step: 0.0001}, minPts: {min: 2, max: 30} }

const carIcon = L.icon({
    iconUrl: require('../../supports/car_icon.png'),
    iconSize: [32,32],
});

type Props = {};
//state for the nav menu
type State = {
    polygons: any;
    clusters: any;
    form: any;
    colorField: any;
    epsilon: any;
    minPts: any;
    splitting: boolean;
    algorithm: clusterAlgorithm;
};

class Clustering extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            polygons: [],
            clusters: [],
            form: [],
            colorField: "primary",
            epsilon: 0.001,
            minPts: 2,
            splitting: false,
            algorithm: clusterAlgorithm.Kmeans,
        };
    }
    
    public componentDidMount(): void {
        this.getPolygons();
        const kmeans =  <TextField id="size" variant="filled" required label="K-Means'size" color={this.state.colorField} sx={{backgroundColor: "white", top: 20, left: 20, borderRadius: '5px'}} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {this.handleTextFieldChange_kmeans(event.target.value)}} />
        this.setState({form: kmeans});
    }

    
    /*--------------------------------------------INPUTS' METHODS ------------------------------------------------------- */
    
    /**
     * This method handle the change of the algorithm from the radio buttons
     * @param event is the event of the change
     */
    private handleChangeAlgorithm = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const value = (event.target as HTMLInputElement).value;
        let form;
        if(value == clusterAlgorithm.Kmeans) {
            form =  <TextField
            id="size"
            variant="filled"
                        required
                        label="K-Means'size"
                        color={this.state.colorField}
                        sx={{backgroundColor: "white", top: 20, left: 20, borderRadius: '5px'}}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {this.handleTextFieldChange_kmeans(event.target.value)}}>
                    </TextField>
        }
        else {
            form = <>
                 <Typography gutterBottom color='white'>Epsilon</Typography>
                    <Slider
                        sx={{width: '80%'}}
                        id="epsilon"
                        valueLabelDisplay="auto"
                        max={sliders_dbscan.epsilon.max}
                        min={sliders_dbscan.epsilon.min}
                        step={sliders_dbscan.epsilon.step}
                        onChange={(event: Event | React.SyntheticEvent<Element, Event>, newValue: number | number[]) => {
                            this.setState({epsilon: newValue})}}
                            onChangeCommitted={(event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]) => {
                                this.setState({epsilon: value});
                            this.handleSlidersChange_dbscan();
                        }}
                        aria-labelledby="input-slider"
                        />
            <Typography gutterBottom color='white'>Min sample</Typography>
                <Slider
                    sx={{width: '80%'}}
                    id="minPts"
                    valueLabelDisplay="auto"
                    max={sliders_dbscan.minPts.max}
                    min={sliders_dbscan.minPts.min}
                    defaultValue={sliders_dbscan.minPts.min}
                    step={1}
                    onChangeCommitted={(event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]) => {
                        this.setState({minPts: value});
                        this.handleSlidersChange_dbscan();}}
                />
            </>
        }
        this.setState({clusters: [], splitting: false, form: form, algorithm: value == clusterAlgorithm.DBSCAN ? clusterAlgorithm.DBSCAN : clusterAlgorithm.Kmeans});
    }
    
    /**
     * This method check if the size is valid and then get the cluster markers or set the state to empty
     * @param value is the size of the cluster
    */
    private handleTextFieldChange_kmeans = (value?: any): void => {
        if(value) {
            if(value == "") this.setState({clusters: [], colorField: "primary"});
            else {
                const size = Number(value);
                if(size <= 0 || isNaN(size))
                    this.setState({clusters: [], colorField: "error"});
                else {
                    this.setState({colorField: "success"});
                    this.getClusterMarkers(clusterAlgorithm.Kmeans, {size: size});
                }
            }
        }
        else {
            const value = (document.getElementById('size') as HTMLInputElement).value;
            this.handleTextFieldChange_kmeans(value);
        }
    }
    
    /**
     * This method is used to handle the change of the dbscan text fields
     * @param event is the event of the text field
     */
    private handleSlidersChange_dbscan = async (): Promise<void> => {
        const epsilon = this.state.epsilon;
        const minPts = this.state.minPts;
        if(epsilon != "" && minPts != "") {
            this.getClusterMarkers(clusterAlgorithm.DBSCAN, {epsilon: Number(epsilon), minPts: Number(minPts)});
        }
    };

    /**
     * This method is used to handle the change if the user wants visualize splitted clusters
     * @param event is the event of the checkbox
     */
    private handleCheckboxChange = async (event: React.SyntheticEvent<Element, Event>, checked: boolean): Promise<void> => {
        this.setState({splitting: checked});
        if(this.state.algorithm == clusterAlgorithm.Kmeans)
            this.handleTextFieldChange_kmeans();
        else
            this.handleSlidersChange_dbscan();
    }
    
    

    /*----------------------------------------------------OTHER METHODS---------------------------------------------------------- */
    
    /**
     * This method is used to get Polygons from the zone.geojson local file
     */
    private async getPolygons(): Promise<void> {
        //get the polygons from the zone.geojson file stored in the server
        const polygons = await getData('zone.geojson');
        if (polygons) {
            this.setState({polygons: <GeoJSON key="polygons" attribution="&copy; credits due..."  data={polygons} style={{color: "#008b8b", fillColor: "#008b8b"}}  />});
        }
    }
    /**
     * This method is used to get the cluster markers from the kmeans form (backend)
     * @param size is the size of the cluster
    */
   private getClusterMarkers = async (type: clusterAlgorithm, params: any): Promise<void> => {
        await this.setState({clusters: []});
        let result: any = [];
        if(type == clusterAlgorithm.Kmeans) result = await kmeans(params.size);
        else if(type == clusterAlgorithm.DBSCAN) result = await dbscan(params.epsilon, params.minPts);
        let clusters: any = [];
        let cont: number = 0; //for keys
        try {
            result?.forEach((element: any, index: number) => {
                const markers: any = [];
                //if we have a cluster with no elements we throw an error
                if(element.cluster.length === 0) throw new Error("Cluster size troppo grande per il numero di dati.\n");
                //if we have to render all elements of each cluster
                else {                
                    element.cluster.forEach((coord: any, index: number) => {
                        cont++;
                        markers.push(
                            <Marker
                            key={cont + "_marker"}
                            position={[coord[1], coord[0]]} //reverse coords
                                title={coord[1]}
                                icon={carIcon}
                                ></Marker>)
                            });
                
                    clusters.push(
                        <MarkerClusterGroup
                            key={"cluster_" + cont}
                            maxClusterRadius={ this.state.splitting ? (zoom: any) => {return 80} : 100000 } 
                            spiderfyDistanceMultiplier={1}
                            showCoverageOnHover={true}>
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
          zoom={14}
          maxZoom={20}
          scrollWheelZoom={false}
          center={[44.495852858541745, 11.339634125175587]}
          attributionControl={false}>
            <TileLayer url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
            />
            {this.state.polygons}
            <AttributionControl position="bottomright" prefix={false} />
            {this.state.clusters}
        </MapContainer>
        <Card sx={{backgroundColor: "rgba(28,28,28, 0.98)", borderRadius: '25px', position: 'absolute', width: 600, height: 250, top: 300, right: 50, zIndex: 2}}>
            <CardContent>
                <Grid container spacing={2} sx={{marginTop: 1}}>
                    <Grid item xs={6}>
                        <FormControl sx={{marginLeft: 5, color: 'white', fontSize: '20pt'}}>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={this.state.algorithm}
                                onChange={this.handleChangeAlgorithm}
                            >
                                <FormControlLabel value={clusterAlgorithm.Kmeans} sx={{marginTop: 2}} control={<Radio />} label="K-MEANS" />
                                <FormControlLabel value={clusterAlgorithm.DBSCAN} control={<Radio />} label="DBSCAN" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                            {this.state.form}
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl sx={{marginLeft: 5, color: 'white', fontSize: '20pt'}}>
                            <FormControlLabel control={<Checkbox checked={this.state.splitting}/>} label="Splitting on zoom" onChange={this.handleCheckboxChange} />
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
        
      </div>
    );
  }
}

export default Clustering;