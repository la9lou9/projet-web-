import React from 'react';

function AutoInputSection({ optionsSelectionnees, setOptionsSelectionnees }) {
  return (
    <div className="auto-input-section">
      <h3>Configurer la matrice automatique</h3>
      <label>
        Taille de la matrice (doit être > 10):
        <input
          type="number"
          value={optionsSelectionnees.size}
          onChange={(e) =>
            setOptionsSelectionnees({ ...optionsSelectionnees, size: e.target.value })
          }
        />
      </label>
    </div>
  );
}

export default AutoInputSection;
