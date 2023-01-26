import * as React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import {HeatmapLayer} from 'react-leaflet-heatmap-layer-v3';
import {heatmap} from '../../utils/requests';
type Props = {};
//state for the nav menu
type State = {
    points: any;
};

class Heatmap extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props); 
        this.state = {
            points: []
        };
    }

    async componentDidMount(): Promise<void> {
      const result : any  = await heatmap();
      this.setState({points: result});
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
            <HeatmapLayer
              points={this.state.points}
              longitudeExtractor={(m : any) => m[0]}
              latitudeExtractor={(m : any) => m[1]}
              intensityExtractor={(m : any) => parseFloat(m[2])} 
              />
            <TileLayer
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
          </MapContainer>

        </div>
      );
    }  
}
export default Heatmap;