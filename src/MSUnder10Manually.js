import React, {useState} from "react";
import HeaderBox from "./containers/HeaderBox";
import Matrix from "./containers/Matrix";
import ResultBox from "./containers/ResultBox";
import './styles/Page3.css';

function MSUnder10Manually() {
    const [matrixSize, setMatrixSize] = useState(3);
    const [result, setResult] = useState(null);

    const handleSizeChange = (newSize) => {
        setMatrixSize(newSize);
    };

    const handleResult = (result) => {
        setResult(result); // Met à jour les résultats obtenus
    };

    return (
        <div className="page3-container">
            <div className="page3-content">
                <h1>Page3 : Taille inférieure à 10 et saisie manuelle</h1>
                <HeaderBox/>
                <Matrix
                    onSizeChange={handleSizeChange}
                    onResult={handleResult} // Passe la fonction pour gérer les résultats
                />
                <ResultBox result={result}/> {/* Passe les résultats à ResultBox */}
            </div>
        </div>
    );
}

export default MSUnder10Manually;
