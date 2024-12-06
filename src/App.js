import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React from "react";
import Header from "./Header";
import Home from './Home';
import About from './About';
import Resolution from './Resolution';
import MSOver10Manually from './MSOver10Manually'; // Page pour taille > 10 et saisie manuelle
import Page2 from './MSOver10Random'; // Page pour taille > 10 et génération automatique
import MSUnder10Manually from './MSUnder10Manually'; // Page pour taille <= 10 et saisie manuelle
import MSUnder10Random from './MSUnder10Random'; // Page pour taille <= 10 et génération automatique

import "./styles/App.css";

function App() {
  return (
    <Router>
      <HeaderWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/resolution" element={<Resolution />} />
          <Route path="/page1" element={<MSOver10Manually />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/page3" element={<MSUnder10Manually />} />
          <Route path="/page4" element={<MSUnder10Random />} />
        </Routes>
      </HeaderWrapper>
    </Router>
  );
}

function HeaderWrapper({ children }) {
  const location = useLocation();
  const noHeaderRoutes = ['/page1', '/page2', '/page3', '/page4'];

  // Si la route actuelle est dans `noHeaderRoutes`, n'affiche pas le Header
  return (
    <div>
      {!noHeaderRoutes.includes(location.pathname) && <Header />}
      {children}
    </div>
  );
}

export default App;
