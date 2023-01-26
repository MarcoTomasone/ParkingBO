import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { zone } from '../supports/zone';
import { getAllParkings } from '../utils/requests';
import FullScreenDialog from './FullScreenDialog';

type Props = {};
//state for the nav menu
type State = {
    n_parkings: number[];
    polygons: any;
    dialog: any;
};
//default position of the map
const position: any = [44.495852858541745, 11.339634125175587];
let n_zone : number = 0;
class Map extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            n_parkings: [0,0,0,0,0,0,0],
            polygons: null,
            dialog: React.createRef(),
        };
    }

    componentDidMount(): void {
        this.getParkings();
        this.getPolygons();
    }
    
    private getPolygons(): any {
        const polygons: any = zone;
        if (polygons) {
            this.setState({polygons: <GeoJSON key="polygons" attribution="&copy; credits due..."  data={polygons} onEachFeature={this.onEachFeature} style={{color: "#008b8b", fillColor: "#008b8b"}}  />});
        }
    }

    private async getParkings(): Promise<any> {
        const result: any | null = await getAllParkings();
        const parkings: any[] = [];
        for(let parking in result) {
            parkings.push(result[parking].parking);
        }
        if (parkings) {
            this.setState({n_parkings: parkings});
        }
        else return "The number of parking spaces in this area could not be found";
    }

    
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
        
        const resetHighlight = (e: any) => {
            let layer = e.target;
            layer.setStyle({
                color: "#008b8b",
                fillColor: "#008b8b"
            });
        };
        
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: () => { this.state.dialog.current.handleClickOpen(feature.properties.zone)}
        });
        layer.bindTooltip("Zone " + n_zone, {permanent: true, direction: "center"})

      };

    render() {
        return (
            <div>
                <MapContainer 
                    center={position}
                    zoom={14}
                    style={{height: "100vh"}}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {this.state.polygons}
                </MapContainer>
                <FullScreenDialog key="dialog" ref={this.state.dialog} />
            </div>
        );
    }
};
export default Map;