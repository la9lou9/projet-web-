import React from "react";
import HeaderBox from "./containers/HeaderBox";
import './styles/Page4.css';
import MatrixGeneratorSm from "./containers/MatrixGeneratorSm";

function MSUnder10Random() {
  return (
    
      <div className="page4-container">
        <div className="page4-content">
        <HeaderBox className="header-box" />
        <MatrixGeneratorSm/>
        </div>
      </div>
    );
  
}

export default MSUnder10Random;
