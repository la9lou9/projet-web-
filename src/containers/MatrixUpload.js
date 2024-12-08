import React, { useState } from "react";
import "./MatrixUpload.css";
import { MatrixSolver } from "../matrix-solver.ts";

function MatrixUpload() {
  const [matrix, setMatrix] = useState([]);
  const [matrixSize, setMatrixSize] = useState("11");
  const [maxIterations, setMaxIterations] = useState("100");
  const [epsilon, setEpsilon] = useState("0.001");
  const [sizeMatchMessage, setSizeMatchMessage] = useState("");

  // Verify matrix size
  const validateMatrixSize = (importedMatrix) => {
    const isValid = importedMatrix.matrix.length === Number(matrixSize);
    setSizeMatchMessage(
        isValid
            ? "La taille de la matrice correspond à la taille spécifiée."
            : `Erreur : la taille de la matrice (${importedMatrix.matrix.length}) ne correspond pas à ${matrixSize}.`
    );
    return isValid;
  };

  // Handle file upload
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

  // Solve the matrix using MatrixSolver
  const solveMatrix = (returnAllIterations = true) => {
    if (!matrix.matrix || !matrix.columnVector) {
      alert("Aucune matrice importée !");
      return;
    }

    try {
      const solver = new MatrixSolver(matrix.matrix, matrix.columnVector, true);
      const solution = solver.solve(Number(epsilon), Number(maxIterations));

      let finalText = `Taille de la matrice : ${matrix.matrix.length}\n`;
      finalText += `Nombre d'itérations effectuées : ${
          solver.getResults()?.length || "N/A"
      }\n`;
      finalText += `Convergence : ${
          solver.getSolved() === "solved" ? "Oui" : "Non"
      }\n`;
      finalText += `Solution finale : ${solution
          .map((xi) => xi.toFixed(3))
          .join(", ")}\n`;

      if (returnAllIterations && solver.getResults()) {
        finalText += "\nDétails des itérations :\n";
        finalText += solver
            .getResults()
            .map(
                (result, index) =>
                    `Itération ${index + 1}: ${result.new
                        .map((xi) => xi.toFixed(6))
                        .join(", ")} (Erreur: ${result.error.toFixed(6)})`
            )
            .join("\n");
      }

      const blob = new Blob([finalText], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = returnAllIterations
          ? "resultats_complets.txt"
          : "solution_finale.txt";
      link.click();

      const newWindow = window.open();
      newWindow.document.write(`<pre>${finalText}</pre>`);
    } catch (error) {
      alert(`Erreur lors de la résolution : ${error.message}`);
    }
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
            onClick={() => solveMatrix(true)}
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
            onClick={() => solveMatrix(false)}
            className="button-faire"
        >
          Résoudre (solution finale)
        </button>
      </div>
  );
}

export default MatrixUpload;
