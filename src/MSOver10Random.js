import React from "react";
import MatrixGenerator from "./containers/MatrixGenerator";
import HeaderBox from "./containers/HeaderBox";
import './styles/Page2.css';
import MatrixDuplicator from "./containers/MatrixDuplicator";

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
