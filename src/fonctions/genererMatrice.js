// src/utils/genererMatrice.js
export const genererMatrice = (tailleMatrice) => {
    return Array.from({ length: tailleMatrice }, () =>
      Array.from({ length: tailleMatrice }, () => Math.floor(Math.random() * 9) + 1)
    );
  };
  