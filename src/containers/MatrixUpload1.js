// src/components/MatrixUpload.js
import React, { useState } from 'react';
import './MatrixUpload.css';

function MatrixUpload1() {
  const [matrixSize, setMatrixSize] = useState(3); // Valeur initiale par défaut de la taille

  // Fonction pour gérer le fichier importé
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Lecture du fichier et traitement ici
      console.log("Fichier sélectionné:", file.name);
      // Vous pouvez ajouter ici le code pour lire le contenu du fichier
    }
  };

  // Fonction pour gérer le changement de la taille
  const handleSizeChange = (event) => {
    const value = Math.min(event.target.value, 10); // Limiter à 10 ou moins
    setMatrixSize(value);
  };

  return (
    <div className="upload-container">
      <h3>Importer une matrice depuis un fichier</h3>
      <input type="file" id="file" onChange={handleFileChange} accept='.json' />
      <pre id="file" />
      
      <h3>Spécifier la taille de la matrice (max 10) :</h3>
      <input
        type="number"
        value={matrixSize}
        onChange={handleSizeChange}
        min="2"
        max="10"
        step="1"
        className="matrix-size-input"
      />
      <br/>
      <p>Taille spécifiée : {matrixSize} x {matrixSize}</p>
    </div>
  );
}

export default MatrixUpload1;
