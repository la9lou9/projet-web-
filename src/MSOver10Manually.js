import React from "react";
import './styles/Page1.css';
import HeaderBox from "./containers/HeaderBox";
import MatrixUpload from "./containers/MatrixUpload";

function MSOver10Manually() {
    return (
        <div className="page1-container">
            <div className="page1-content">
                <HeaderBox className="header-box"/>
                <MatrixUpload/>
            </div>
        </div>
    );
}

export default MSOver10Manually;
