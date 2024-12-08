import React, { useState } from "react";
import "../styles/container styles/MatrixDuplicator.css";

function MatrixDuplicator() {
  const [matrix, setMatrix] = useState(null);
  const [vector, setVector] = useState(null);
  const [solution, setSolution] = useState(null);
  const [iterations, setIterations] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [iterationResults, setIterationResults] = useState([]); // Stocke les résultats par itération

  const [epsilon, setEpsilon] = useState(0.0001); // Valeur initiale d'epsilon
  const [maxIterations, setMaxIterations] = useState(100); // Valeur initiale des itérations

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.matrix && Array.isArray(data.matrix) && data.columnVector) {
            setMatrix(data.matrix);
            setVector(data.columnVector);
            setStatusMessage("Fichier chargé avec succès.");
          } else {
            setStatusMessage("Le fichier ne contient pas une matrice ou un vecteur valide.");
          }
        } catch (error) {
          setStatusMessage("Erreur lors de la lecture du fichier JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  const gaussSeidel = (A, b, tolerance = 0.0001, maxIterations = 100) => {
    const n = A.length;
    let x = new Array(n).fill(0); // Initialisation du vecteur solution
    let xOld = [...x]; // Copie de la solution initiale pour comparaison
    const results = []; // Stocker les solutions de chaque itération

    let iter = 0;
    while (iter < maxIterations) {
      for (let i = 0; i < n; i++) {
        let sum = b[i];
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            sum -= A[i][j] * x[j];
          }
        }
        x[i] = sum / A[i][i];
      }

      results.push({ iteration: iter + 1, solution: [...x] });

      let maxError = 0;
      for (let i = 0; i < n; i++) {
        maxError = Math.max(maxError, Math.abs(x[i] - xOld[i]));
      }

      if (maxError < tolerance) {
        setSolution(x);
        setIterations(iter + 1);
        setIterationResults(results); // Enregistre toutes les itérations
        saveFinalResultsToFile(x, iter + 1, true); // Sauvegarde la solution finale avec état de convergence
        return;
      }

      xOld = [...x];
      iter++;
    }

    setSolution(x);
    setIterations(maxIterations);
    setIterationResults(results); // Enregistre toutes les itérations
    saveFinalResultsToFile(x, maxIterations, false); // Sauvegarde la solution finale sans convergence
  };

  const saveStepByStepResults = () => {
    if (!iterationResults.length) {
      setStatusMessage("Veuillez d'abord appliquer la méthode Gauss-Seidel.");
      return;
    }
  
    // Déterminer l'état de convergence à partir des résultats
    const hasConverged =
      iterations < maxIterations && iterationResults[iterations - 1];
  
    const finalText = `
  Résultats complets par itération :
  
  ${iterationResults
      .map(
        (result) =>
          `Itération ${result.iteration} :\n` +
          `Solution: ${result.solution
            .map((value, index) => `x${index + 1} = ${value.toFixed(6)}`)
            .join(", ")}\n`
      )
      .join("\n")}
  Nombre total d'itérations effectuées : ${iterations}
  Convergence : ${hasConverged ? "Oui" : "Non"}
  `;
  
    // Création du Blob contenant le texte
    const blob = new Blob([finalText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
  
    // Téléchargement automatique du fichier
    const link = document.createElement("a");
    link.href = url;
    link.download = "resultats_complets.txt";
    link.click();
  
    // Ouverture automatique dans une nouvelle fenêtre
    const newWindow = window.open();
    newWindow.document.write(`<pre>${finalText}</pre>`);
  };
  

  const saveFinalResultsToFile = (solution, iterations, hasConverged) => {
    const resultText = `
Solution finale :
${solution.map((value, index) => `x${index + 1} = ${value.toFixed(6)}`).join("\n")}

Nombre d'itérations : ${iterations}
Convergence : ${hasConverged ? "Oui" : "Non"}
`;

    const blob = new Blob([resultText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resultat_final.txt";
    link.click();
    const newWindow = window.open();
    newWindow.document.write(`<pre>${resultText}</pre>`);
  };

  const handleGaussSeidel = () => {
    if (matrix && vector) {
      gaussSeidel(matrix, vector, epsilon, maxIterations);
    } else {
      setStatusMessage("Veuillez d'abord télécharger un fichier valide.");
    }
  };

  return (
    <div className="matrix-generator-container">
      <h2>Appliquer la méthode de Gauss-Seidel</h2>
      <div className="input-container">
        <label htmlFor="file-upload">Téléchargez un fichier JSON contenant une matrice :</label>
        <input
          type="file"
          id="file-upload"
          accept="application/json"
          onChange={handleFileUpload}
        />
      </div>

      {statusMessage && <p>{statusMessage}</p>}

      <div className="input-container">
        <label htmlFor="epsilon">Epsilon (Tolérance) :</label>
        <input
          type="number"
          id="epsilon"
          value={epsilon}
          onChange={(e) => setEpsilon(parseFloat(e.target.value))}
          min="0.00001"
          step="0.00001"
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

      <button onClick={handleGaussSeidel}>Appliquer Gauss-Seidel</button>
      <button onClick={saveStepByStepResults}>Télécharger et Afficher Résultats par Étape</button>
    </div>
  );
}

export default MatrixDuplicator;
