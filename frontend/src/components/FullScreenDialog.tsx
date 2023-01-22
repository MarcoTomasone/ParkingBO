import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import CardEvent from './CardRequest';
import { TransitionProps } from '@mui/material/transitions';
import { getAllEventsFromZone, getParkings, getParkingRequestFromZone } from '../utils/requests';
import Container from '@mui/material/Container';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fffeef',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    fontSize: '20pt',
    color: 'black',
}));

type Props = {
};

const FullScreenDialog =  React.forwardRef((props: Props, ref) => {
    const [open, setOpen] = React.useState(false);
    const [zone, setzone] = React.useState(0);
    const [requests, setRequests] = React.useState([<></>]);
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
                        <CardEvent key={"card_" + request.id_request} request={request}></CardEvent>
                    );
                });
                setRequests(allRequests);
            });
            setOpen(true);
            //<CardEvent key={event.id_event+ "_" + index}></CardEvent>
        }
    }));

    const handleClose = () => {
        setOpen(false);
        setNParkings(null);
        setRequests([<></>]);
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
                    <Typography align="center" variant="h6" style={{flexGrow: 1, textAlign: 'center', fontSize: "23pt"}}>
                        Zone {zone}
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleClose} sx={{ fontSize: "14pt" }}>
                        save
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2} sx={{ paddingTop: '5px' }}>
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
                <Grid container spacing={2} sx={{ paddingTop: '30px' }}>
                    <Grid item xs={12}>
                        {requests.map((request: any, index: any) => (
                            <div>
                                {request}
                            </div>
                        ))}
                    </Grid>
                </Grid>
            </Box>
        </Dialog>
        </div>
    );
});
export default FullScreenDialog;