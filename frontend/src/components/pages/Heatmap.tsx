import * as React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import {HeatmapLayer} from 'react-leaflet-heatmap-layer-v3';
import {heatmap} from '../../utils/requests';
type Props = {};
//state for the nav menu
type State = {
    points: any;
};

const position: any = [44.495852858541745, 11.339634125175587];
class Heatmap extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props); 
        this.state = {
            points: []
        };
    }

    async componentDidMount(): Promise<void> {
      const result : any  = await heatmap();
      console.log(result);
      this.setState({points: result});
    }


   render() {
    return (
        <div>
          <MapContainer center={[0,0]} zoom={13}  style={{height: "100vh"}}>
            <HeatmapLayer
              fitBoundsOnLoad
              fitBoundsOnUpdate
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