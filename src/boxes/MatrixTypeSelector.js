import React, { useState } from "react";
import "./MatrixTypeSelector.css";

function MatrixTypeSelector({ matrixType, setMatrixType, generateMatrix }) {
  const [sizeInput, setSizeInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSizeChange = (e) => {
    const value = e.target.value;
    setSizeInput(value);
    if (value && value <= 10) {
      setErrorMessage("La taille doit être supérieure à 10.");
    } else {
      setErrorMessage(""); // Effacer le message d'erreur si la taille est valide
    }
  };

  return (
    <div className="options">
      <h3>Type de matrice</h3>
      
      {/* Zone de saisie pour la taille */}
      <div className="input-container">
        <label>
          Saisissez la taille (doit être > 10):
        </label>
        <input
          type="number"
          value={sizeInput}
          onChange={handleSizeChange}
          min="1"
          className="size-input"
        />
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Afficher le message d'erreur */}

      {/* Les options de type de matrice */}
      <div className="matrix-options">
        <label>
          <input
            type="radio"
            value="Matrice carrée"
            checked={matrixType === "Matrice carrée"}
            onChange={(e) => setMatrixType(e.target.value)}
          />
          Matrice carrée
        </label>
        <label>
          <input
            type="radio"
            value="Matrice diagonale"
            checked={matrixType === "Matrice diagonale"}
            onChange={(e) => setMatrixType(e.target.value)}
          />
          Matrice diagonale
        </label>
        <label>
          <input
            type="radio"
            value="Matrice identité"
            checked={matrixType === "Matrice identité"}
            onChange={(e) => setMatrixType(e.target.value)}
          />
          Matrice identité
        </label>
      </div>
      
      {/* Bouton générer automatiquement */}
      <button onClick={() => generateMatrix(sizeInput)} className="generate-button" disabled={sizeInput <= 10}>
        Générer automatiquement
      </button>
    </div>
  );
}

export default MatrixTypeSelector;
