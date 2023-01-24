import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar';
import Map from './components/Map';
import K_means from './components/pages/Kmeans';
import Heatmap from './components/pages/Heatmap';
import FullScreenDialog from './components/FullScreenDialog';
import CardEvent from './components/CardRequest';

class App extends React.Component {
  render() {
    return (
      <Router>
        <NavBar />
        <Routes>
          <Route key="Map" path="/" element={<Map />} />
          <Route key="K_means" path="/k_means" element={<K_means />} />
          <Route key="Heatmap" path="/heatmap" element={<Heatmap />} />
        </Routes>
      </Router>
    );
  }
};
export default App;

