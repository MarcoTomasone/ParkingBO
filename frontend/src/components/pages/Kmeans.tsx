import * as React from 'react';
import { kmeans } from '../../utils/requests';
import MapKmeans from '../MapKmeans';

type Props = {};
//state for the nav menu
type State = {
    tmp: any;
};

class Kmeans extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            tmp: null
        };
    }

    componentDidMount(): void {
        /*const result = kmeans().then((result) => {console.log(result);});        
        this.setState({tmp: result});*/
    }

    render() {
        return (
            <MapKmeans/>
        );
    }
}
export default Kmeans;