const gaussSeidel = (matrix, columnVector, tolerance = 0.001, maxIterations = 100) => {
    const n = matrix.length;
    let x = Array(n).fill(0); // Solution initialisée à zéro
    let xOld = [...x];
  
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          if (j !== i) {
            sum += matrix[i][j] * x[j];
          }
        }
        x[i] = (columnVector[i] - sum) / matrix[i][i];
      }
  
      // Vérifie la convergence
      const error = Math.sqrt(
        x.reduce((acc, xi, index) => acc + Math.pow(xi - xOld[index], 2), 0)
      );
      if (error < tolerance) {
        return { solution: x, iterations: iteration + 1 };
      }
  
      xOld = [...x];
    }
  
    // Si la convergence n'est pas atteinte
    return { solution: x, iterations: maxIterations, converged: false };
  };
  