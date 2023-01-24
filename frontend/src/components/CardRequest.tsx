import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

type Props = {
    request: any
};

export default function CardEvent(props: Props) {
  return (
    <Card sx={{ display: 'flex', backgroundColor: 'white', color:  'black', marginBottom: '5px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h5">
            Parking request event: {props.request.id_request}
          </Typography>
          <Typography component="div" variant="h6">
            Position: {props.request.x}, {props.request.y}
          </Typography>
        </CardContent>
      </Box>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image="../images/parking.png"
      />
    </Card>
  );
}