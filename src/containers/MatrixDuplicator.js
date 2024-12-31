import React, { useState } from "react";
import "../styles/container styles/MatrixDuplicator.css";
import {MatrixSolver} from "../matrix-solver.ts";

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
    let solver = new MatrixSolver(A,b);
    let x = solver.solve(tolerance,maxIterations);

    setSolution(x);
    setIterations(solver.getResults.length);
    setIterationResults(solver.getResults()); // Enregistre toutes les itérations
    return solver
  };

  const saveStepByStepResults = () => {
    let solver = gaussSeidel();
  
    const hasConverged =
      solver.getSolved() !== "solved";

    let i = 1;
  
    const finalText = `
  Résultats complets par itération :
  
  ${iterationResults
      .map(
        (result) =>
          `Itération ${i++} :\n` +
          `Solution: ${result.new
            .map((value, index) => `x${index + 1} = ${value.toFixed(3)}`)
            .join(", ")}\n`
      )
      .join("\n")}
  Nombre total d'itérations effectuées : ${iterations}
  Convergence : ${hasConverged ? "Oui" : "Non"}
  `;

    console.log(finalText);
  
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
${solution.map((value, index) => `x${index + 1} = ${value.toFixed(3)}`).join("\n")}

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
      let solver = gaussSeidel(matrix, vector, epsilon, maxIterations);
      saveFinalResultsToFile(solver.getResults().at(-1).new, solver.getResults().length, solver.getSolved() === "solved"); // Sauvegarde la solution finale avec état de convergence
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
