import React, { useState, useEffect } from "react";
import "../styles/container styles/Matrix.css";
import {MatrixSolver} from "../matrix-solver.ts";

function Matrix({ generatedMatrix, onSizeChange, onResult }) {
  const initialSize = generatedMatrix ? generatedMatrix.length : 3;
  const [size, setSize] = useState(initialSize);
  const [matrix, setMatrix] = useState(
    generatedMatrix || Array(initialSize).fill(0).map(() => Array(initialSize).fill(""))
  );
  const [columnVector, setColumnVector] = useState(Array(initialSize).fill(""));
  const [matrixType, setMatrixType] = useState("");
  const [bandCount, setBandCount] = useState(1);
  const [matrixProperty, setMatrixProperty] = useState("");
  const [tolerance, setTolerance] = useState(1e-6); // Tolérance par défaut
  const [maxIterations, setMaxIterations] = useState(1000); // Iterations par défaut

  useEffect(() => {
    if (generatedMatrix) {
      setMatrix(generatedMatrix);
      setSize(generatedMatrix.length);
      setColumnVector(Array(generatedMatrix.length).fill(""));
    }
  }, [generatedMatrix]);

  useEffect(() => {
    if (matrixType === "triangulaire-inférieure") {
      setMatrix((prevMatrix) =>
        prevMatrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => (colIndex < rowIndex ? "0" : cell))
        )
      );
    } else if (matrixType === "triangulaire-supérieure") {
      setMatrix((prevMatrix) =>
        prevMatrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => (colIndex > rowIndex ? "0" : cell))
        )
      );
    }
  }, [matrixType, size]);

  const increaseSize = () => {
    if (size < 10) {
      const newSize = size + 1;
      setSize(newSize);
      onSizeChange(newSize);
      setMatrix((prevMatrix) => {
        const newMatrix = prevMatrix.map((row) => [...row, ""]);
        newMatrix.push(Array(newSize).fill(""));
        return newMatrix;
      });
      setColumnVector((prevVector) => [...prevVector, ""]);
    }
  };

  const decreaseSize = () => {
    if (size > 1) {
      const newSize = size - 1;
      setSize(newSize);
      onSizeChange(newSize);
      setMatrix((prevMatrix) =>
        prevMatrix.slice(0, -1).map((row) => row.slice(0, -1))
      );
      setColumnVector((prevVector) => prevVector.slice(0, -1));
    }
  };

  const handleCellChange = (row, col, value) => {
    const newMatrix = matrix.map((r, rowIndex) =>
      r.map((cell, colIndex) => (rowIndex === row && colIndex === col ? value : cell))
    );
    setMatrix(newMatrix);
  };

  const handleColumnChange = (index, value) => {
    const newVector = [...columnVector];
    newVector[index] = value;
    setColumnVector(newVector);
  };

  const getBorderColor = (value) => {
    if (value === "") return "gray";
    return Number.isInteger(Number(value)) ? "green" : "red";
  };

  const checkIfValid = () => {
    const isMatrixValid = matrix.every((row) =>
      row.every((cell) => Number.isFinite(Number(cell)) && cell !== "")
    );
    const isVectorValid = columnVector.every(
      (val) => Number.isFinite(Number(val)) && val !== ""
    );

    if (isMatrixValid && isVectorValid) {
      return true;
    } else {
      alert(
        "La matrice ou le vecteur contiennent des valeurs invalides. Veuillez corriger cela."
      );
      return false;
    }
  };

  // Fonction pour résoudre le système avec Gauss-Seidel
  const solveGaussSeidel = () => {
    if (!checkIfValid()) return;

    const A = matrix.map((row) => row.map((cell) => parseFloat(cell)));
    const B = columnVector.map((val) => parseFloat(val));

    let solver = new MatrixSolver(A,B);
    const X = solver.solve(tolerance,maxIterations);

    if (solver.getSolved() == "solved") {
        const solution = X.map((x) => x.toFixed(3));
        if (onResult) {
          onResult({
            solution,
            iterations: solver.getResults().length,
            converged: true,
          });
        }
        alert(`Solution trouvée : [${solution.join(", ")}]`);
        return;
    }
    if (onResult) {
      onResult({
        solution: null,
        iterations: maxIterations,
        converged: false,
      });
    }
    alert("La méthode de Gauss-Seidel n'a pas convergé.");
  };

  const clearMatrix = () => {
    setMatrix(Array(size).fill(0).map(() => Array(size).fill("")));
    setColumnVector(Array(size).fill(""));
  };

  const renderMatrix = () => {
    return matrix.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, colIndex) => (
          <input
            key={colIndex}
            type="text"
            className="cell"
            value={cell}
            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
            style={{ borderColor: getBorderColor(cell) }}
          />
        ))}
      </div>
    ));
  };
/*************** */
const downloadStepByStepResults = () => {
  if (!checkIfValid()) return;

  const A = matrix.map((row) => row.map((cell) => parseFloat(cell)));
  const B = columnVector.map((val) => parseFloat(val));
  const X = Array(size).fill(0); // Initialisation du vecteur solution
  let resultsText = "Itérations de la méthode de Gauss-Seidel :\n\n";
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const X_old = [...X];
    for (let i = 0; i < size; i++) {
      let sum = 0;
      for (let j = 0; j < size; j++) {
        if (i !== j) sum += A[i][j] * X[j];
      }
      X[i] = (B[i] - sum) / A[i][i];
    }

    // Vérification de la convergence
    const error = Math.sqrt(
      X.reduce((acc, x, idx) => acc + (x - X_old[idx]) ** 2, 0)
    );
    
    // Ajouter le résultat de cette itération au fichier texte
    resultsText += `Itération ${iter + 1} : [${X.map((x) => x.toFixed(6)).join(", ")}]\n`;
    resultsText += `Erreur : ${error.toFixed(6)}\n\n`;

    if (error < tolerance) {
      resultsText += "La méthode a convergé.\n";
      break;
    }
  }

  // Si l'itération maximale est atteinte sans convergence
  if (resultsText.indexOf("La méthode a convergé.") === -1) {
    resultsText += "La méthode de Gauss-Seidel n'a pas convergé après " + maxIterations + " itérations.\n";
  }

  // Créer un fichier texte avec les résultats
  const blob = new Blob([resultsText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "resultats_par_etape.txt";

  // Télécharger le fichier
  link.click();

  // Ouvrir le contenu du fichier texte dans un nouvel onglet
  const newWindow = window.open();
  newWindow.document.write(`<pre>${resultsText}</pre>`);
};


  return (
    <div className="matrix-container">
      <h2>Matrice à ajouter Manuellement:</h2>
      <br />
      <div className="matrix-flex">
        <div className="matrix-and-column-vector">
          <div className="matrix">{renderMatrix()}</div>
          <div className="column-vector-container">
            <h3>Vecteur Colonne :</h3>
            <div className="n1">
              {columnVector.map((val, index) => (
                <input
                  key={index}
                  type="text"
                  className="column-cell"
                  value={val}
                  onChange={(e) => handleColumnChange(index, e.target.value)}
                  style={{ borderColor: getBorderColor(val) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <br />
      <div className="matrix-options">
        <label>Type de matrice :</label>
        <select
          value={matrixType}
          onChange={(e) => setMatrixType(e.target.value)}
        >
          <option value="">Sélectionnez un type</option>
          <option value="triangulaire-inférieure">Triangulaire inférieure</option>
          <option value="triangulaire-supérieure">Triangulaire supérieure</option>
          <option value="bande">Bande</option>
        </select>
        {matrixType === "bande" && (
          <div>
            <label>Nombre de bandes :</label>
            <input
              type="number"
              value={bandCount}
              onChange={(e) => setBandCount(Number(e.target.value))}
              min="1"
              max={size}
            />
          </div>
        )}
      </div>
      <div className="matrix-property">
        <label>Propriété de la matrice :</label>
        <select
          value={matrixProperty}
          onChange={(e) => setMatrixProperty(e.target.value)}
        >
          <option value="">Sélectionnez une propriété</option>
          <option value="diagonale-dominante">Diagonale dominante</option>
          <option value="définie-positive">Définie positive</option>
        </select>
      </div>
      <br />
      <div className="matrix-size">
        <p>Taille de la matrice: {size} x {size}</p>
      </div>
      <div className="matrix-options">
        <label>Tolérance (Epsilon) :</label>
        <input
          type="number"
          value={tolerance}
          onChange={(e) => setTolerance(Number(e.target.value))}
          step="0.000001"
        />
        <label>Nombre maximal d'itérations :</label>
        <input
          type="number"
          value={maxIterations}
          onChange={(e) => setMaxIterations(Number(e.target.value))}
          min="1"
        />
      </div>
      <div className="buttons">
        <button onClick={increaseSize} className="button" disabled={size >= 10}>
          +
        </button>
        <button onClick={decreaseSize} className="button" disabled={size <= 2}>
          -
        </button>
        <button onClick={clearMatrix} className="button">
          Clear
        </button>
        <button onClick={solveGaussSeidel} className="button">
          Gauss-Seidel
        </button>
        <button onClick={downloadStepByStepResults} className="button">
          Par étape
        </button>
      </div>
    </div>
  );
}

export default Matrix;
