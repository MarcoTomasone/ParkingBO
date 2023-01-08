import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Position } from '../utils/types';
import { zone } from '../supports/zone';
import Typography from '@mui/material/Typography/Typography';
import { getParkingsFromZone, getData } from '../utils/requests';

type Props = {};
//state for the nav menu
type State = {
    polygons: any;
};

const position: any = [44.495852858541745, 11.339634125175587];

class Map extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            polygons: this.getPolygons() 
        };
    }
    
    private getPolygons(): any {
        getData("zone.geojson");
        const polygons: any = zone;
        if (polygons) {
            return <GeoJSON data={polygons} onEachFeature={this.onEachFeature} style={{color: "#008b8b", fillColor: "#008b8b"}}/>;
        } else {
            return null;
        }
    }

    private async getParkings(zone: number): Promise<any> {
        const parkings: number | null = await getParkingsFromZone(zone);
        if (parkings) return parkings;
        else return "The number of parking spaces in this area could not be found";
        
    }

    private onEachFeature = (feature: any, layer: any) => {
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
          mouseout: resetHighlight
        });


        layer.bindPopup('<h1>' + feature.properties + '</h1> <p> name: ' + feature.properties + '</p>');

      };

    render() {
        return (
            <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{height: "100vh"}}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {this.state.polygons}
            </MapContainer>
        );
    }
};
export default Map;