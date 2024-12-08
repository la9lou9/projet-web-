// src/components/MatrixUploadAuto.js
import React, { useState } from "react";
import "../styles/container styles/MatrixUploadAuto.css";

function MatrixUploadAuto() {
  const [matrix, setMatrix] = useState([]); // Stocker la matrice importée du 1er fichier
  const [matrixSize, setMatrixSize] = useState("11"); // Taille initiale par défaut
  const [file, setFile] = useState(null); // Fichier importé (1er fichier)
  const [secondFile, setSecondFile] = useState(null); // Fichier importé (2ème fichier)

  // Fonction pour gérer l'importation du 1er fichier
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setFile(file);
    if (file) {
      const text = await file.text(); // Lire le contenu du fichier
      try {
        const importedMatrix = JSON.parse(text); // Assurer que le fichier est bien un JSON
        if (Array.isArray(importedMatrix) && importedMatrix.length > 0) {
          setMatrix(importedMatrix);
        } else {
          alert("Le fichier doit contenir une matrice valide.");
        }
      } catch (e) {
        alert("Fichier invalide. Veuillez importer un fichier JSON contenant une matrice.");
      }
    }
  };

  // Fonction pour gérer l'importation du 2ème fichier
  const handleSecondFileChange = async (event) => {
    const file = event.target.files[0];
    setSecondFile(file);
    if (file) {
      const text = await file.text(); // Lire le contenu du fichier
      try {
        const importedMatrix = JSON.parse(text); // Assurer que le fichier est bien un JSON
        if (Array.isArray(importedMatrix) && importedMatrix.length > 0) {
          // Optionnel : Si tu veux afficher ou utiliser la matrice du 2ème fichier, tu peux l'ajouter ici
        } else {
          alert("Le fichier doit contenir une matrice valide.");
        }
      } catch (e) {
        alert("Fichier invalide. Veuillez importer un fichier JSON contenant une matrice.");
      }
    }
  };

  // Fonction pour gérer la saisie de la taille de la matrice
  const handleSizeChange = (event) => {
    const value = event.target.value;
    if (value === "" || (/^\d+$/.test(value) && Number(value) <= 10000)) {
      setMatrixSize(value);
    }
  };

  // Validation lors de la perte de focus
  const handleBlur = () => {
    if (matrixSize === "" || Number(matrixSize) < 11) {
      setMatrixSize("11");
    }
  };

  // Fonction pour multiplier la matrice par 2 et sauvegarder dans un fichier
  const handleMultiplyMatrixAndSave = () => {
    if (!file) {
      alert("Veuillez d'abord importer un fichier.");
      return;
    }

    if (matrix.length === 0) {
      alert("Aucune matrice dans le premier fichier.");
      return;
    }

    // Multiplier la matrice du premier fichier par 2
    const multipliedMatrix = matrix.map((row) =>
      row.map((value) => (typeof value === "number" ? value * 2 : value))
    );

    // Préparer le fichier JSON avec la matrice multipliée par 2
    const jsonContent = JSON.stringify(multipliedMatrix, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Créer un lien pour télécharger le fichier modifié
    const link = document.createElement("a");
    link.href = url;
    link.download = "multiplied_matrix.json"; // Nom du fichier téléchargé
    link.click(); // Déclencher le téléchargement

    // Ouvrir automatiquement le fichier modifié dans un nouvel onglet (facultatif)
    window.open(url, "_blank");

    // Nettoyer l'URL pour éviter les fuites mémoire
    URL.revokeObjectURL(url);
  };

  return (
    <div className="upload-container">
      <h3>Importer une matrice depuis un fichier (1er fichier)</h3>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".json"
        className="file-input"
      />

      <h3>Importer un autre fichier pour afficher la matrice modifiée (2ème fichier)</h3>
      <input
        type="file"
        onChange={handleSecondFileChange}
        accept=".json"
        className="file-input"
      />

      <h3>Spécifier la taille de la matrice (entre 11 et 10000) :</h3>
      <input
        type="text"
        value={matrixSize}
        onChange={handleSizeChange}
        onBlur={handleBlur}
        className="matrix-size-input"
      />
      <p>Taille spécifiée : {matrixSize} x {matrixSize}</p>

      <button
        onClick={handleMultiplyMatrixAndSave}
        className="button-faire"
        disabled={!matrix.length || !file}
      >
        Multiplier et enregistrer dans le 2ème fichier
      </button>
    </div>
  );
}

export default MatrixUploadAuto;
