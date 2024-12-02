import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React from "react";
import Header from "./Header";
import Home from './Home';
import About from './About';
import Resolution from './Resolution';
import Page1 from './Page1'; // Page pour taille > 10 et saisie manuelle
import Page2 from './Page2'; // Page pour taille > 10 et génération automatique
import Page3 from './Page3'; // Page pour taille <= 10 et saisie manuelle
import Page4 from './Page4'; // Page pour taille <= 10 et génération automatique

import "./App.css";

function App() {
  return (
    <Router>
      <HeaderWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/resolution" element={<Resolution />} />
          <Route path="/page1" element={<Page1 />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/page4" element={<Page4 />} />
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
