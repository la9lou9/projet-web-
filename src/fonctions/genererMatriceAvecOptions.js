// src/utils/genererMatriceAvecOptions.js
export const genererMatriceAvecOptions = (taille) => {
    return Array(taille)
      .fill()
      .map(() => Array(taille).fill().map(() => Math.floor(Math.random() * 9) + 1));
  };
  