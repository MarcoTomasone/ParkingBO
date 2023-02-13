import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import CardEvent from './CardRequest';
import { TransitionProps } from '@mui/material/transitions';
import { getParkings, getParkingRequestFromZone } from '../utils/requests';
import { CardContent, CardHeader } from '@mui/material';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'white',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    fontSize: '20pt',
    color: 'black',
}));

type Props = {
};

const FullScreenDialog =  React.forwardRef((props: Props, ref) => {
    const [open, setOpen] = React.useState(false);
    const [zone, setzone] = React.useState(0);
    const [requests, setRequests] = React.useState([]);
    const [n_parkings, setNParkings] = React.useState(null);

    React.useImperativeHandle(ref, () => ({
        handleClickOpen(zone: number) {
            setzone(zone);
            getParkings(zone).then((data) => {
                setNParkings(data);
            });
            getParkingRequestFromZone(zone).then((requests) => {
                const allRequests: any  = requests!.map((request: any, index: any) => {
                    return (
                        <CardEvent key={"card_" + index} request={request}></CardEvent>
                    );
                });
                setRequests(allRequests);
            });
            setOpen(true);
            //<CardEvent key={event.id_event+ "_" + index}></CardEvent>
        },
    }));

    const handleClose = () => {
        setOpen(false);
        setNParkings(null);
        setRequests([]);
    };

    return (
        <div>
            <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
            >
            <AppBar key={'FullScreenDialog_' + zone} sx={{ position: 'relative', bgcolor: "rgb(28,28,28)" }}>
                <Toolbar>
                    <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleClose}
                    aria-label="close"
                    size="large"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography align="center" variant="h6" style={{flexGrow: 1, textAlign: 'center', fontSize: "20pt"}}>
                        Zone {zone}
                    </Typography>
                </Toolbar>
            </AppBar>
        
            <Card sx={{margin: '25px', bgcolor: "rgb(28,28,28)", overflow:'visible'}}> 
                <CardContent>         
                    <Grid container spacing={2} sx={{ padding: '15px'}}>
                        <Grid item xs={6}>
                            <Item>Free parking:</Item>
                        </Grid>
                        <Grid item xs={6}>
                            <Item>{n_parkings}</Item>
                        </Grid>
                        <Grid item xs={6}>
                            <Item> Requests in this zone:</Item>
                        </Grid>
                        <Grid item xs={6}>
                            <Item> {requests.length} </Item>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {requests.length > 0 &&
            <Card className="card_content" sx={{margin: '25px', bgcolor: "rgb(28,28,28)", overflow: 'auto'}}>
                <CardContent >
                    <Grid container spacing={2} sx={{ padding: '15px' }}>
                        <Grid item xs={12} >
                            {requests.map((request: any, index: any) => (
                                <>
                                    {request}
                                </>
                            ))}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        }
        </Dialog>
        </div>
    );
});
export default FullScreenDialog;