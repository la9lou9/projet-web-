import React from "react";
import MatrixUpload from "./boxes/MatrixUpload";
import MatrixUploadAuto from "./boxes/MatrixUploadAuto";
import HeaderBox from "./boxes/HeaderBox";
import './Page4.css';
import MatrixGeneratorSm from "./boxes/MatrixGeneratorSm";

function Page4() {
  return (
    
      <div className="page4-container">
        <div className="page4-content">
        <HeaderBox className="header-box" />
        <MatrixGeneratorSm/>
        </div>
      </div>
    );
  
}

export default Page4;
