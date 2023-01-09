import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar';
import Map from './components/Map';
import K_means from './components/pages/K_means';
import Heatmap from './components/pages/Heatmap';
import Requests from './components/pages/Requests';
import FullScreenDialog from './components/FullScreenDialog';

class App extends React.Component {
  render() {
    return (
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/k-means" element={<K_means />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
      </Router>
    );
  }
};
export default App;

