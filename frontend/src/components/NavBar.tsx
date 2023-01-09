import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Link } from "react-router-dom";


type Props = {};
//state for the nav menu
type State = {
    anchorElNav: null | HTMLElement;
};


const pages: string[] = ['K-Means', 'Heatmap', 'Requests'];
 
class NavBar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            anchorElNav: null,
        };
    }
   
    
    private handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>): void => {
        this.setState({ anchorElNav: event.currentTarget });
    };

    private handleCloseNavMenu = (): void => {
        this.setState({ anchorElNav: null });
    };

    render() {
        return (
            <AppBar position="static" sx={{ bgcolor: "rgba(0,0,0,0.88)" }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Link to={"/"} style={{ textDecoration: 'none', color: "white" }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={this.handleOpenNavMenu}
                                color="inherit"
                            >
                                <DirectionsCarIcon />
                            </IconButton>
                        </ Link>
                        <Link to={"/"} style={{ textDecoration: 'none', color: "white" }} >
                            <Typography
                            style={{marginRight: 250}}
                            variant="h6"
                            noWrap
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                            >
                            ParkingBo
                            </Typography>
                        </Link>
        
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={this.handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={this.state.anchorElNav}
                                anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                                }}
                                open={Boolean(this.state.anchorElNav)}
                                onClose={this.handleCloseNavMenu}
                                sx={{
                                display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {pages.map((page) => (
                                <MenuItem key={page} onClick={this.handleCloseNavMenu}>
                                    <Link to={page} style={{ textDecoration: 'none', color: "black" }} >
                                        <Typography textAlign="center">{page}</Typography>
                                    </Link>
                                </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                    <Link to={"/"} style={{ textDecoration: 'none', color: "white" }} >
                        <Typography
                            variant="h5"
                            noWrap
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                        ParkingBo
                        </Typography>
                    </Link>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                    {pages.map((page) => (
                        <Link key={page} to={page} style={{ textDecoration: 'none', marginRight: 250}} >
                            <Button
                                style={{}}
                                key={page}
                                onClick={this.handleCloseNavMenu}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                {page}
                            </Button>
                        </Link>
                    ))}
                    </Box>
                </Toolbar>
                </Container>
            </AppBar>
        );
    }
};

export default NavBar;