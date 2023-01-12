import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import CardEvent from './CardEvent';
import { TransitionProps } from '@mui/material/transitions';
import { getAllEventsFromZOne, getParkings } from '../utils/requests';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
};

const FullScreenDialog =  React.forwardRef((props: Props, ref) => {
    const [open, setOpen] = React.useState(false);
    const [zone, setzone] = React.useState(0);
    const [events, setEvents] = React.useState([<></>]);
    const [n_parkings, setNParkings] = React.useState(null);

    React.useImperativeHandle(ref, () => ({
        handleClickOpen(zone: number) {
            setzone(zone);
            getParkings(zone).then((data) => {
                setNParkings(data);
            });
            getAllEventsFromZOne(zone).then((events) => {
                const allEvents: any  = events!.map((event: any, index: any) => {
                    if(event.parking_type == 'ENTERING') 
                        return (
                            <CardEvent event={event}></CardEvent>
                    );
                });
                setEvents(allEvents);
            });
            setOpen(true);
            //<CardEvent key={event.id_event+ "_" + index}></CardEvent>
        }
    }));

    const handleClose = () => {
        setOpen(false);
        setNParkings(null);
        setEvents([<></>]);
    };

    return (
        <div>
            <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
            >
            <AppBar sx={{ position: 'relative', bgcolor: "rgba(0,0,0,0.88)" }}>
                <Toolbar>
                    <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleClose}
                    aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 55, flex: 1 }} variant="h6" component="div">
                    Zone {zone}
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleClose}>
                    save
                    </Button>
                </Toolbar>
            </AppBar>
            <List>
                <ListItem button>
                    <ListItemText primary="Free parking" secondary={n_parkings} />
                </ListItem>
                <Divider />
                <Typography> There are {events.length} events in this zone </Typography>
                <Divider />
                <div>
                    <h3> Events </h3>
                    {events.map((event: any, index: any) => (
                        <div>
                            {events}
                        </div>
                    ))}
                </div>
            </List>
        </Dialog>
        </div>
    );
});
export default FullScreenDialog;