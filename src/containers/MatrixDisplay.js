// src/components/MatrixDisplay.js
import React from "react";
import "../styles/boxes/MatrixDisplay.css";

function MatrixDisplay({ matrix }) {
  if (!matrix || matrix.length === 0) {
    return <p>Aucune matrice à afficher.</p>;
  }

  return (
    <div className="matrix-display">
      <h3>Matrice :</h3>
      <table>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MatrixDisplay;
