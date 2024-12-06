import React from "react";
import "../styles/boxes/ResultBox.css";

function ResultBox({ result }) {
  if (!result) {
    return (
      <div className="result-box">
        <h2>Résultat donné par Gauss-Seidel :</h2>
        <p>Aucun résultat disponible.</p>
      </div>
    );
  }

  const { solution, iterations, converged } = result;

  return (
    <div className="result-box">
      <h2>Résultat donné par Gauss-Seidel :</h2>
      {converged ? (
        <>
          <p>Solution : [{solution.join(", ")}]</p>
          <p>Nombre d'itérations : {iterations}</p>
          <p>Convergence : Oui</p>
        </>
      ) : (
        <>
          <p>La méthode n'a pas convergé après {iterations} itérations.</p>
          <p>Convergence : Non</p>
        </>
      )}
    </div>
  );
}

export default ResultBox;


