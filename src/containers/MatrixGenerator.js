import React, { useState } from "react";
import "./MatrixGenerator.css";
import {genererSymPos} from "../fonctions/genererSymPos";

// Fonction pour générer une valeur aléatoire
const getRandomValue = () => Math.floor(Math.random() * 10) + 1;

function MatrixGenerator() {
  const [matrixSize, setMatrixSize] = useState(11); // Taille par défaut
  const [matrixType, setMatrixType] = useState("Random"); // Type de matrice
  const [matrixProperty, setMatrixProperty] = useState(""); // Propriété de la matrice
  const [numBands, setNumBands] = useState(1); // Nombre de bandes pour la matrice de type bande

  // Fonction pour contrôler le nombre de bandes
  const handleNumBandsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setNumBands(value > matrixSize ? matrixSize : value); // Ne peut pas dépasser la taille
  };

  // Fonction pour générer une matrice
  const generateMatrix = () => {
    const size = parseInt(matrixSize);
    let matrix = [];
    let vector = [];

    if (matrixType === "Symmetric" && matrixProperty==="Définie Positive") {
      matrix = genererSymPos(size);
    } else {

      // Initialisation de la matrice avec des valeurs aléatoires
      for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
          if (matrixType === "Upper Triangular" && j < i) {
            row.push(0); // Partie inférieure de la matrice (triangulaire supérieure)
          } else if (matrixType === "Lower Triangular" && j > i) {
            row.push(0); // Partie supérieure de la matrice (triangulaire inférieure)
          } else if (matrixType === "Band" && Math.abs(i - j) > numBands) {
            row.push(0); // Éléments hors bande spécifiée
          } else if (matrixType === "Diagonal" && i !== j) {
            row.push(0); // Seulement la diagonale a des valeurs
          } else if (matrixType === "Upper Band" && (i - j) > numBands) {
            row.push(0); // Éléments hors de la bande supérieure
          } else if (matrixType === "Lower Band" && (j - i) > numBands) {
            row.push(0); // Éléments hors de la bande inférieure
          } else {
            row.push(getRandomValue()); // Valeurs aléatoires
          }
        }
        matrix.push(row);
      }

    }
    for (let i = 0; i < size; i++) {
      vector.push(getRandomValue()); // Génère un vecteur colonne
    }

    // Appliquer les propriétés après la génération initiale
    if (matrixProperty === "Diagonale Dominante") {
      makeMatrixDiagonallyDominant(matrix);
    }
    saveToFile(matrix, vector); // Sauvegarde dans un fichier JSON
  };

  // Fonction pour rendre la matrice diagonale dominante
  const makeMatrixDiagonallyDominant = (matrix) => {
    for (let i = 0; i < matrix.length; i++) {
      let rowSum = 0;
      // Calculer la somme des éléments non diagonaux de la ligne
      for (let j = 0; j < matrix[i].length; j++) {
        if (i !== j) rowSum += Math.abs(matrix[i][j]);
      }
      // Si la diagonale n'est pas dominante, l'ajuster
      if (matrix[i][i] <= rowSum) {
        matrix[i][i] = rowSum + 1;
      }
    }
  };

  // Fonction pour rendre la matrice définie positive
  const makeMatrixPositiveDefinite = (matrix) => {
    for (let i = 0; i < matrix.length; i++) {
      matrix[i][i] = matrix[i][i] + 10; // Augmenter les éléments diagonaux pour garantir la positivité
    }
  };

  // Fonction pour sauvegarder la matrice et le vecteur dans un fichier JSON
  const saveToFile = (matrix, vector) => {
    const data = {
      type: matrixType,
      property: matrixProperty,
      matrix,
      columnVector: vector,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "matrix_data.json";
    link.click();
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  return (
    <div className="matrix-generator-container">
      <h2>Générateur de Matrice Aléatoire</h2>
      <div className="input-container">
        <label htmlFor="matrix-size">Taille de la matrice :</label>
        <input
          type="number"
          id="matrix-size"
          value={matrixSize}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            setMatrixSize(value || ""); 
          }}
          onBlur={() => {
            if (matrixSize < 11 || matrixSize === "") {
              setMatrixSize(11);
            }
          }}
          min="1"
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
          <option value="Diagonal">Diagonale</option>
        </select>
      </div>

      {(matrixType === "Band" ||
        matrixType === "Upper Band" ||
        matrixType === "Lower Band") && (
        <div className="input-container">
          <label htmlFor="num-bands">Nombre de bandes :</label>
          <input
            type="number"
            id="num-bands"
            value={numBands}
            onChange={handleNumBandsChange}
            min="1"
            max={matrixSize}
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
          <option value="">Aucune</option>
          <option value="Diagonale Dominante">Diagonale Dominante</option>
          <option value="Définie Positive">Définie Positive</option>
        </select>
      </div>

      <button onClick={generateMatrix}>Générer la matrice</button>
    </div>
  );
}

export default MatrixGenerator;
