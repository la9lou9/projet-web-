import Matrix from "./boxes/Matrix";
import React from "react";
import MatrixUploadAuto from "./boxes/MatrixUploadAuto";
import MatrixGenerator from "./boxes/MatrixGenerator";
import HeaderBox from "./boxes/HeaderBox";
import  './Page2.css';
import MatrixDuplicator from "./boxes/MatrixDuplicator";

function Page2() {
 

  return (
    <div className="page2-container">
      <div className="page2-content">
    <HeaderBox/>
    <MatrixGenerator/>
    <MatrixDuplicator/>
    </div>
    </div>
  );
}

export default Page2;
