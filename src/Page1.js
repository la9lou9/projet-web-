import React from "react";
import Matrix from "./boxes/Matrix";
import './Page1.css';
import HeaderBox from "./boxes/HeaderBox";
import MatrixUpload1 from "./boxes/MatrixUpload1";
import MatrixUpload from "./boxes/MatrixUpload";

function Page1() {
  return (
    <div className="page1-container">
      <div className="page1-content">
      <HeaderBox className="header-box" />
      <MatrixUpload/>       
      </div>
    </div>
  );
}

export default Page1;
