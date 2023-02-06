import * as React from 'react';
import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';
import { TextField, Card, CardContent, Typography, Switch, FormControl, Grid  } from '@mui/material';
import {HeatmapLayer} from 'react-leaflet-heatmap-layer-v3';
import {heatmap,  getData, eChargers} from '../../utils/requests';
import { point, polygon } from 'leaflet';
const L = require('leaflet');

enum heatmapType {
    polygonsHeatmap = "polygons_heatmap",
    fullHeatmap = "full_heatmap",
}
type Props = {
};
//state for the nav menu
type State = {
    points: any;
    polygons: any;
    heatmapType: heatmapType;
    heatmapLayer: any;
    eChargers: any;

};

const markerIcon = L.icon({
    iconUrl: require('../../supports/marker_icon.png'),
    iconSize: [32,32],
});

let n_zone : number = 0;
class Heatmap extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props); 
        this.state = {
            points: {},
            polygons: [],
            heatmapType: heatmapType.polygonsHeatmap,
            heatmapLayer: [],
            eChargers: [],
        };
    }

    async componentDidMount(): Promise<void> {
        const result : any  = await heatmap();
        await this.setState({points: result});
        await this.getPolygons();
        this.getHeatmapLayer();
        this.getEChargers();
    }

    private handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const checked = event.target.checked;
        if(checked) this.setState({heatmapType: heatmapType.fullHeatmap});
        else this.setState({heatmapType: heatmapType.polygonsHeatmap});
        this.getHeatmapLayer();
   }

  /**
     * This method is used to get the polygons from the zone.geojson file
     */
    private async getPolygons(): Promise<void> {
        //get the polygons from the zone.geojson file stored in the server
        const polygons: any = await getData('zone.geojson');
        if (polygons) {
            this.setState({polygons: <GeoJSON key="polygons" attribution="&copy; credits due..."  data={polygons} style={{color: "#008b8b", fillColor: "#008b8b"}}  />});
        }
    }

    private async getEChargers(): Promise<void> {
        const stations: any = await eChargers();
        //Create a list of marker to add to the map
        console.log(stations);
        if (stations) {
            var markers = [];
            for (const station of stations.chargers) {
            markers.push(<Marker
                    key={station.id}
                    position={[station.y, station.x,]} //reverse coords
                    icon={markerIcon}>
                     </Marker>
            )
        }   
             this.setState({eChargers: markers});
        }
    }


    async getHeatmapLayer() {
        const result : any  = await heatmap();
        await this.setState({points: result});
        let heatmapLayer: any[] = []; 
        if(this.state.heatmapType == heatmapType.polygonsHeatmap) {
            //Create a heatmap for each zone
            for (const [key, value] of Object.entries(this.state.points)) {
                heatmapLayer.push(<HeatmapLayer
                    key={key}
                    points={value}
                    longitudeExtractor={(m : any) => m[0]}
                    latitudeExtractor={(m : any) => m[1]}
                    intensityExtractor={(m : any) => parseFloat(m[2])} 
                    radius={10}
                    />);
            }
            heatmapLayer.push(this.state.polygons);    
        }
        else {
             //convert the points dict into array of all values 
             const point = Object.values(this.state.points).flat();        
             heatmapLayer.push(<HeatmapLayer
                 key={"full"}
                 points={point}
                 longitudeExtractor={(m : any) => m[0]}
                 latitudeExtractor={(m : any) => m[1]}
                 intensityExtractor={(m : any) => parseFloat(m[2])} 
                 radius={10}
             />);
        }
        this.setState({heatmapLayer: heatmapLayer});
    }   


   render() {
        return (
            <div>
            <MapContainer   
                center={[44.495852858541745, 11.339634125175587]}
                style={{ height: "100vh", opacity: "0.9" }}
                zoomSnap={0.25}
                zoom={13}
                maxZoom={20}
                attributionControl={false}>
                    {this.state.eChargers}
                    {this.state.heatmapLayer}
                <TileLayer
                url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
            </MapContainer>
            <Card sx={{backgroundColor: "rgba(28,28,28, 0.98)", borderRadius: '25px', position: 'absolute', width: 450, height: 250, top: 300, left: 50, zIndex: 2}}>
                <CardContent>
                    <Grid container spacing={2} sx={{marginTop: 5}}>
                        <Grid item xs={5}>
                            <Typography variant="h6" color={this.state.heatmapType == heatmapType.polygonsHeatmap ? 'white' : 'black'}>Heatmap per poligono</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <FormControl component="fieldset">
                                <Switch color="primary" onChange={this.handleSwitchChange}/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant='h6' color={this.state.heatmapType == heatmapType.fullHeatmap ? 'white' : 'black'}>Heatmap complessiva</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            </div>
        );
        }  
    }
export default Heatmap;