import React, { useState } from "react";
import "./MatrixGeneratorSm.css";
import {genererSymPos} from "../fonctions/genererSymPos"
import {MatrixSolver} from "../matrix-solver.ts";

function MatrixGeneratorSm() {
  const [matrixSize, setMatrixSize] = useState(2);
  const [matrixType, setMatrixType] = useState("Random");
  const [matrixProperty, setMatrixProperty] = useState("Aucune");
  const [matrix, setMatrix] = useState([]);
  const [bandWidth, setBandWidth] = useState(1);
  const [vector, setVector] = useState([]);
  const [epsilon, setEpsilon] = useState(0.001);
  const [maxIterations, setMaxIterations] = useState(100);
  const [result, setResult] = useState(null); // Pour afficher le résultat de Gauss-Seidel
  const [isConvergent, setIsConvergent] = useState(null); // Indique si la matrice converge

  const handleSizeChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 10) {
      setMatrixSize(10);
    } else if (value < 2) {
      setMatrixSize(2);
    } else {
      setMatrixSize(value);
    }
  };

  const handleBandWidthChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > matrixSize - 1) {
      setBandWidth(matrixSize - 1);
    } else if (value < 1) {
      setBandWidth(1);
    } else {
      setBandWidth(value);
    }
  };

  const getRandomValue = () => Math.floor(Math.random() * 10) + 1;

  const applyProperty = (matrix) => {
    if (matrixProperty === "Aucune") return matrix;

    const size = matrix.length;

    if (matrixProperty === "À Diagonale Dominante") {
      for (let i = 0; i < size; i++) {
        let rowSum = 0;
        let colSum = 0;

        for (let j = 0; j < size; j++) {
          if (i !== j) {
            rowSum += Math.abs(matrix[i][j]);
            colSum += Math.abs(matrix[j][i]);
          }
        }

        if (matrix[i][i] <= rowSum || matrix[i][i] <= colSum) {
          matrix[i][i] = Math.max(rowSum, colSum) + getRandomValue();
        }
      }
    }

    return matrix;
  };

  const generateMatrix = () => {
    const size = matrixSize;
    let newMatrix = Array(size)
      .fill()
      .map(() => Array(size).fill(0));

    if ( matrixType === "Symmetric" && matrixProperty === "Définie Positive" )
      newMatrix = genererSymPos(size);
    else {
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (matrixType === "Upper Triangular" && j < i) {
            newMatrix[i][j] = 0;
          } else if (matrixType === "Lower Triangular" && j > i) {
            newMatrix[i][j] = 0;
          } else if (matrixType === "Symmetric") {
            const value = getRandomValue();
            newMatrix[i][j] = value;
            newMatrix[j][i] = value;
          } else if (matrixType === "Band") {
            newMatrix[i][j] =
                Math.abs(i - j) <= bandWidth ? getRandomValue() : 0;
          } else if (matrixType === "Upper Band") {
            newMatrix[i][j] =
                j >= i && j - i <= bandWidth ? getRandomValue() : 0;
          } else if (matrixType === "Lower Band") {
            newMatrix[i][j] =
                i >= j && i - j <= bandWidth ? getRandomValue() : 0;
          } else {
            newMatrix[i][j] = getRandomValue();
          }
        }
      }
    }

    newMatrix = applyProperty(newMatrix);
    setMatrix(newMatrix);

    const newVector = Array(size).fill().map(getRandomValue);
    setVector(newVector);

    setResult(null); // Réinitialiser les résultats précédents
    setIsConvergent(null); // Réinitialiser l'indicateur de convergence
  };

  const stepByStepGaussSeidel = () => {
    let solver = gaussSeidel();
  
    // Créer le texte final à afficher dans la fenêtre
    let i = 1;
    const finalText = solver.getResults().map((step) => {
      return `Itération ${i++} :\nSolution: ${step.new.join(", ")}\nError: ${step.error}\n\n`;
    }).join('');
  
    // Créer un fichier blob et lancer le téléchargement
    const blob = new Blob([finalText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resultats_complets.txt";
    link.click();
  
    // Ouvrir le texte dans une nouvelle fenêtre
    const newWindow = window.open();
    newWindow.document.write(`<pre>${finalText}</pre>`);
  };
  
  

  const gaussSeidel = () => {
    let solver = new MatrixSolver(matrix,vector);
    let x = solver.solve(epsilon,maxIterations);

    let iterations = solver.getResults().length;
    setResult({ solution: x, iterations });
    setIsConvergent(solver.getSolved() === "solved");
    return solver;
  };

  return (
    <div className="matrix-generator-sm-container">
      <h2>Générateur de Matrice Personnalisée</h2>
      {/* Les champs d'entrée */}
      <div className="input-container">
        <label htmlFor="matrix-size">Taille de la matrice (2-10) :</label>
        <input
          type="number"
          id="matrix-size"
          value={matrixSize}
          onChange={handleSizeChange}
          min="2"
          max="10"
        />
      </div>
      <div className="input-container">
        <label htmlFor="matrix-type">Type de matrice :</label>
        <select
          id="matrix-type"
          value={matrixType}
          onChange={(e) => setMatrixType(e.target.value)}
        >
          <option value="Random">Aléatoire</option>
          <option value="Upper Triangular">Triangulaire Supérieure</option>
          <option value="Lower Triangular">Triangulaire Inférieure</option>
          <option value="Symmetric">Symétrique</option>
          <option value="Band">Bande</option>
          <option value="Upper Band">Bande Supérieure</option>
          <option value="Lower Band">Bande Inférieure</option>
        </select>
      </div>
      {["Band", "Upper Band", "Lower Band"].includes(matrixType) && (
        <div className="input-container">
          <label htmlFor="band-width">
            Largeur de bande (1-{matrixSize - 1}) :
          </label>
          <input
            type="number"
            id="band-width"
            value={bandWidth}
            onChange={handleBandWidthChange}
            min="1"
            max={matrixSize - 1}
          />
        </div>
      )}
      <div className="input-container">
        <label htmlFor="matrix-property">Propriété de la matrice :</label>
        <select
          id="matrix-property"
          value={matrixProperty}
          onChange={(e) => setMatrixProperty(e.target.value)}
        >
          <option value="Aucune">Aucune</option>
          <option value="Définie Positive">Définie Positive</option>
          <option value="À Diagonale Dominante">À Diagonale Dominante</option>
        </select>
      </div>
      <button onClick={generateMatrix}>Générer la Matrice</button>
      {matrix.length > 0 && (
        <div className="matrix-display">
          <h3>Matrice générée :</h3>
          <table className="matrix-table">
            <tbody>
              {matrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((value, colIndex) => (
                    <td key={colIndex}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <h3>Vecteur généré :</h3>
          <table className="matrix-table">
            <tbody>
              <tr>
                {vector.map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <br />
          <div className="input-container">
            <label htmlFor="epsilon">Tolérance (ε) :</label>
            <input
              type="number"
              id="epsilon"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              step="0.0001"
              min="0"
            />
          </div>
          <div className="input-container">
            <label htmlFor="max-iterations">Nombre maximal d'itérations :</label>
            <input
              type="number"
              id="max-iterations"
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value))}
              min="1"
            />
          </div>
          <button onClick={gaussSeidel}>Appliquer Gauss-Seidel</button>
          <button onClick={stepByStepGaussSeidel}>Étape par Étape</button>

          {result && (
          <div>
            <h3>Résultats :</h3>
            <div>
              <h4>Solution :</h4>
              {result.solution.map((sol, index) => (
                <p key={index}>  {sol}</p>
              ))}
            </div>
            <p>Nombre d'itérations : {result.iterations}</p>
            <p>
              Convergence : {isConvergent ? "Oui" : "Non"}
            </p>
          </div>
        )}
        </div>
      )}
    </div>
  );
}

export default MatrixGeneratorSm;
