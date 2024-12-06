import React from 'react';
import { useNavigate } from 'react-router-dom'; // Remplacer useHistory par useNavigate
import "../styles/boxes/HeaderBox.css"
import 'font-awesome/css/font-awesome.min.css';


function HeaderBox() {
  const navigate = useNavigate(); // Hook de React Router pour la navigation

  const handleReset = () => {
    window.location.reload(); // Recharge la page pour réinitialiser
  };

  const goToResolution = () => {
    navigate('/resolution'); // Navigation vers la page Resolution
  };

  const goToHome = () => {
    navigate('/'); // Navigation vers la page Home
  };

  return (
    <div className="header-box">
      <button onClick={handleReset} className="header-box-button">  <i className="fa fa-refresh"></i> </button>
      <button onClick={goToResolution} className="header-box-button">  <i className="fa fa-arrow-left"></i> </button>
      <button className="header-box-button" onClick={goToHome}>
      <i className="fa fa-home"></i>  {/* Icône maison */}

      </button>    </div>
  );
}

export default HeaderBox;
