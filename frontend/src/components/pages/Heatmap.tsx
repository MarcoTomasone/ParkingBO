import * as React from 'react';
import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';
import { TextField, Card, CardContent, Typography, Switch, FormControl, Grid  } from '@mui/material';
import {HeatmapLayer} from 'react-leaflet-heatmap-layer-v3';
import {heatmap,  getData} from '../../utils/requests';
type Props = {};
//state for the nav menu
type State = {
    points: any;
    polygons: any;
    showFullHeatmap: boolean;
};
let n_zone : number = 0;
class Heatmap extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props); 
        this.state = {
            points: [],
            polygons: null,
            showFullHeatmap: false
        };
    }

    async componentDidMount(): Promise<void> {
        const result : any  = await heatmap();
        this.setState({points: result});
        this.getPolygons();
    }

    private handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const checked = event.target.checked;
        if(checked) this.setState({showFullHeatmap: false});
        else this.setState({showFullHeatmap: true});
   }

     /**
     * This method is called for each feature of the geojson file (for each Polygon)
     */
     private onEachFeature = async (feature: any, layer: any) => {
        n_zone ++;
        if(n_zone == 8)
            n_zone = 1;
        feature.properties.zone = n_zone;
        const highlightFeature = (e: any) => {
            let layer = e.target;
            layer.setStyle({
              color: "red",
              fillColor: "red"
            });
        };
    }

  /**
     * This method is used to get the polygons from the zone.geojson file
     */
    private async getPolygons(): Promise<void> {
        //get the polygons from the zone.geojson file stored in the server
        const polygons: any = await getData('zone.geojson');
        if (polygons) {
            this.setState({polygons: <GeoJSON key="polygons" attribution="&copy; credits due..."  data={polygons} onEachFeature={this.onEachFeature} style={{color: "#008b8b", fillColor: "#008b8b"}}  />});
        }
    }

   render() {
    let heatmapLayer: any[] = []; 
    if(!this.state.showFullHeatmap == true) 
        heatmapLayer.push(<HeatmapLayer
        points={this.state.points}
        longitudeExtractor={(m : any) => m[0]}
        latitudeExtractor={(m : any) => m[1]}
        intensityExtractor={(m : any) => parseFloat(m[2])} 
        radius={10}
        />);
    else {
        //Transform the points array into a dict using zone as a key 
        let pointsDict: any = {};
        this.state.points.forEach((point: any) => {
            if(pointsDict[point[3]] == null) pointsDict[point[3]] = [];
            pointsDict[point[3]].push(point);
        });
        //Create a heatmap for each zone
        for (const [key, value] of Object.entries(pointsDict)) {
            heatmapLayer.push(<HeatmapLayer
                points={value}
                longitudeExtractor={(m : any) => m[0]}
                latitudeExtractor={(m : any) => m[1]}
                intensityExtractor={(m : any) => parseFloat(m[2])} 
                radius={10}
                />);
        }
        heatmapLayer.push(this.state.polygons);
        
    }
    return (
        <div>
          <MapContainer   
            center={[44.495852858541745, 11.339634125175587]}
            style={{ height: "100vh", opacity: "0.9" }}
            zoomSnap={0.25}
            zoom={13}
            maxZoom={20}
            attributionControl={false}>
            {heatmapLayer}
            <TileLayer
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
          </MapContainer>
          <Card sx={{backgroundColor: "rgba(28,28,28, 0.98)", borderRadius: '25px', position: 'absolute', width: 450, height: 250, top: 300, left: 50, zIndex: 2}}>
            <CardContent>
                <Grid container spacing={2} sx={{marginTop: 5}}>
                    <Grid item xs={5}>
                        <Typography variant="h6" color={this.state.showFullHeatmap == true ? 'white' : 'black'}>Heatmap per poligono</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <FormControl component="fieldset">
                            <Switch color="primary" onChange={this.handleSwitchChange}/>
                        </FormControl>
                    </Grid>
                    <Grid item xs={5}>
                        <Typography variant='h6' color={this.state.showFullHeatmap == false ? 'white' : 'black'}>Heatmap complessiva</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        </div>
      );
    }  
}
export default Heatmap;