import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importation du hook useNavigate
import '../styles/boxes/MatrixOptions.css';

function MatrixOptions() {
  const [sizeOption, setSizeOption] = useState('');
  const [inputOption, setInputOption] = useState('');
  const navigate = useNavigate(); // Utilisation de useNavigate pour naviguer

  // Fonction qui valide les choix et redirige
  const handleValidate = () => {
    if (sizeOption === 'sup10' && inputOption === 'manual') {
      navigate('/page1'); // Taille > 10 et saisie manuelle
    } else if (sizeOption === 'sup10' && inputOption === 'auto') {
      navigate('/page2'); // Taille > 10 et génération automatique
    } else if (sizeOption === 'inf10' && inputOption === 'manual') {
      navigate('/page3'); // Taille <= 10 et saisie manuelle
    } else if (sizeOption === 'inf10' && inputOption === 'auto') {
      navigate('/page4'); // Taille <= 10 et génération automatique
    }
  };

  return (
    <div className="main-container">
      <div className="options-box">
        <h3>Options de la matrice</h3>
        <div className="option-section">
          <h4>Taille :</h4>
          <label>
            <input 
              type="radio" 
              name="size" 
              value="sup10" 
              checked={sizeOption === 'sup10'}
              onChange={() => setSizeOption('sup10')}
            />
            Taille supérieure à 10
          </label>
          <label>
            <input 
              type="radio" 
              name="size" 
              value="inf10" 
              checked={sizeOption === 'inf10'}
              onChange={() => setSizeOption('inf10')}
            />
            Taille inférieure ou égale à 10
          </label>
        </div>
        <div className="option-section">
          <h4>Mode de saisie :</h4>
          <label>
            <input 
              type="radio" 
              name="input" 
              value="manual" 
              checked={inputOption === 'manual'}
              onChange={() => setInputOption('manual')}
            />
            Matrice à saisie manuelle
          </label>
          <label>
            <input 
              type="radio" 
              name="input" 
              value="auto" 
              checked={inputOption === 'auto'}
              onChange={() => setInputOption('auto')}
            />
            Matrice générée automatiquement
          </label>
        </div>
      </div>
      <div className="config-box">
        <h3>Configuration de la matrice</h3>
        <p><strong>Taille :</strong> {sizeOption === 'sup10' ? 'Supérieure à 10' : 'Inférieure ou égale à 10'}</p>
        <p><strong>Type d'entrée :</strong> {inputOption === 'manual' ? 'Saisie manuelle' : 'Générée automatiquement'}</p>
        <div className="buttons">
          <center>
            <button className="button" onClick={handleValidate}>
              Valider
            </button>
          </center>
        </div>
      </div>
    </div>
  );
}

export default MatrixOptions;
