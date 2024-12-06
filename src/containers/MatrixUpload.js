import React, { useState } from "react";
import "./MatrixUpload.css";

function MatrixUpload() {
  const [matrix, setMatrix] = useState([]);
  const [matrixSize, setMatrixSize] = useState("11");
  const [maxIterations, setMaxIterations] = useState("100");
  const [epsilon, setEpsilon] = useState("0.001");
  const [sizeMatchMessage, setSizeMatchMessage] = useState("");

  // Vérification de la taille de la matrice importée
  const validateMatrixSize = (importedMatrix) => {
    const isValid = importedMatrix.matrix.length === Number(matrixSize);
    setSizeMatchMessage(
      isValid
        ? "La taille de la matrice correspond à la taille spécifiée."
        : `Erreur : la taille de la matrice (${importedMatrix.matrix.length}) ne correspond pas à ${matrixSize}.`
    );
    return isValid;
  };

  // Gestion du fichier importé
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const text = await file.text();
      try {
        const importedData = JSON.parse(text);
        if (!validateMatrixSize(importedData)) {
          throw new Error("Erreur : la taille de la matrice est incorrecte !");
        }
        setMatrix(importedData);
      } catch (e) {
        alert(`Erreur : ${e.message}`);
      }
    }
  };

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  // Fonction de résolution Gauss-Seidel
  const solveGaussSeidel = (returnAllIterations = true) => {
    if (!matrix.matrix) {
      alert("Aucune matrice importée !");
      return;
    }
  
    const n = matrix.matrix.length;
    const x = new Array(n).fill(0);
    let iterations = 0;
    let converges = false;
  
    const resultsText = []; // Résultats à afficher ou sauvegarder
  
    for (iterations = 1; iterations <= Number(maxIterations); iterations++) {
      const xOld = [...x];
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          if (j !== i) sum += matrix.matrix[i][j] * x[j];
        }
        x[i] = (matrix.columnVector[i] - sum) / matrix.matrix[i][i];
      }
  
      if (returnAllIterations) {
        resultsText.push(
          `Itération ${iterations}: ${x.map((xi) => xi.toFixed(6)).join(", ")}`
        );
      }
  
      const error = Math.max(...x.map((xi, i) => Math.abs(xi - xOld[i])));
      if (error < Number(epsilon)) {
        converges = true;
        break; // Sortir immédiatement après la convergence
      }
    }
  
    let finalText;
    if (returnAllIterations) {
      resultsText.unshift(`Taille de la matrice : ${n}`);
      resultsText.unshift(`Nombre d'itérations effectuées : ${iterations}`);
      resultsText.unshift(`Convergence : ${converges ? "Oui" : "Non"}`);
      resultsText.push(
        `Solution finale : ${x.map((xi) => xi.toFixed(6)).join(", ")}`
      );
      finalText = resultsText.join("\n");
    } else {
      finalText = converges
        ? `Convergence : Oui\nNombre d'itérations effectuées : ${iterations}\nSolution finale : ${x
            .map((xi) => xi.toFixed(6))
            .join(", ")}`
        : "La matrice n'a pas convergé.";
    }
  
    const blob = new Blob([finalText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = returnAllIterations ? "resultats_complets.txt" : "solution_finale.txt";
    link.click();
  
    const newWindow = window.open();
    newWindow.document.write(`<pre>${finalText}</pre>`);
  };
  
  return (
    <div className="upload-container">
      <h3>Importer une matrice depuis un fichier</h3>
      <input type="file" onChange={handleFileChange} accept=".json" />
      <pre id="file" />
      {sizeMatchMessage && <p>{sizeMatchMessage}</p>}

      <h3>Spécifier la taille de la matrice (entre 11 et 10000) :</h3>
      <input
        type="text"
        value={matrixSize}
        onChange={handleInputChange(setMatrixSize)}
        onBlur={() => setMatrixSize((prev) => (prev === "" || Number(prev) < 11 ? "11" : prev))}
        className="matrix-size-input"
      />
      <p>Taille spécifiée : {matrixSize} x {matrixSize}</p>

      <h3>Nombre d'itérations maximum :</h3>
      <input
        type="text"
        value={maxIterations}
        onChange={handleInputChange(setMaxIterations)}
        className="matrix-size-input"
      />

      <h3>Tolérance epsilon :</h3>
      <input
        type="text"
        value={epsilon}
        onChange={handleInputChange(setEpsilon)}
        className="matrix-size-input"
      />

      <button
        onClick={() => solveGaussSeidel(true)}
        className="button-faire"
        disabled={
          matrixSize === "" ||
          Number(matrixSize) < 11 ||
          Number(matrixSize) > 10000 ||
          maxIterations === "" ||
          epsilon === ""
        }
      >
        Résoudre (toutes les itérations)
      </button>

      <button
        onClick={() => solveGaussSeidel(false)}
        className="button-faire"
      >
        Résoudre (solution finale)
      </button>
    </div>
  );
}

export default MatrixUpload;
