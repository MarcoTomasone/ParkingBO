import React from 'react';
import { MapContainer, Marker, TileLayer, AttributionControl, GeoJSON, ZoomControl } from "react-leaflet";
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
            epsilon: 0.001,
            minPts: 2,
            splitting: false,
            algorithm: clusterAlgorithm.Kmeans,
        };
    }
    
    public componentDidMount(): void {
        this.getPolygons();
        const kmeans = 
            <TextField id="size" variant="filled" required label="K-Means'size" sx={{backgroundColor: "white", top: 20, left: 20, borderRadius: '5px'}} />
        this.setState({form: kmeans});
    }

    
    /*--------------------------------------------INPUTS' METHODS ------------------------------------------------------- */
    
    /**
     * This method handle the change of the algorithm from the radio buttons
     * @param event is the event of the change
    */
   private handleChangeAlgorithm = (event: React.ChangeEvent<HTMLInputElement>): void => {
       const value = (event.target as HTMLInputElement).value;
       this.setState({clusters: [], splitting: false, algorithm: value == clusterAlgorithm.DBSCAN ? clusterAlgorithm.DBSCAN : clusterAlgorithm.Kmeans});
       let form;
        if(value == clusterAlgorithm.Kmeans) {
            form =      
                        <TextField
                            id="size"
                            variant="filled"
                            required
                            label="K-Means'size"
                            sx={{backgroundColor: "white", top: 20, left: 20, borderRadius: '5px'}}
                        >
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
                            onChangeCommitted={(event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]) => {this.setState({epsilon: value});}}
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
                        onChangeCommitted={(event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]) => {this.setState({minPts: value});}}
                    />
            </>
        }
        this.setState({form: form});
    }
    
    /**
     * This method check if the size is valid and then get the cluster markers or set the state to empty
     * @param value is the size of the cluster
    */
    private handle_kmeans = (): void => {
        const value = (document.getElementById('size') as HTMLInputElement).value;
        if(value != null || value != undefined) {
            if(value == "") this.setState({clusters: []});
            else {
                const size = Number(value);
                if(size <= 0 || isNaN(size))
                    this.setState({clusters: []});
                else {
                    this.getClusterMarkers(clusterAlgorithm.Kmeans, {size: size});
                }
            }
        }
    }
    
    /**
     * This method is used to handle the change of the dbscan text fields
     * @param event is the event of the text field
     */
    private handle_dbscan = (): void => {
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
    private handleCheckboxChange = (event: React.SyntheticEvent<Element, Event>, checked: boolean): void => {
        this.setState({splitting: checked});
        if(this.state.algorithm == clusterAlgorithm.Kmeans)
            this.handle_kmeans();
        else
            this.handle_dbscan();
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
            if(result?.length === 0) throw new Error("Vincolo/i troppo stringenti per il numero di dati.\n");
            result?.forEach((element: any, index: number) => {
                const markers: any = [];
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
            });
            //update the state with the new clusters
            this.setState({clusters: clusters});
        } catch (error) {
            this.setState({clusters: []});
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
            <ZoomControl position="bottomright" />
            <TileLayer url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
            />
            {this.state.polygons}
            <AttributionControl position="bottomright" prefix={false} />
            {this.state.clusters}
        </MapContainer>
        <Card sx={{backgroundColor: "rgba(28,28,28, 0.98)", borderRadius: '25px', position: 'absolute', width: 600, height: 270, top: 300, right: 50, zIndex: 2}}>
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
                    <Button variant="contained" sx={{marginLeft: 5, marginTop: 2, color: 'white'}} onClick={this.state.algorithm == clusterAlgorithm.Kmeans ? this.handle_kmeans : this.handle_dbscan}>COMPUTE</Button>
                </Grid>
            </CardContent>
        </Card>
        
      </div>
    );
  }
}

export default Clustering;