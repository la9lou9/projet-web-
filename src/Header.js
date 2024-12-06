// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <img src="/binary.png" alt="Logo" className="logo-image" />
        <h1 className="c1">GAUSS-SEIDEL</h1>
        <h1 className="c2">MATRIX CALCULATOR</h1>
      </div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/resolution">Resolution</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
}

export default Header;
