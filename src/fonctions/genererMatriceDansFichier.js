export function genererMatriceDansFichier(taille, fichier, matrixType) {
    return new Promise((resolve, reject) => {
      // Vérifier si un fichier est sélectionné
      if (!fichier) {
        reject("Aucun fichier sélectionné.");
        return;
      }
  
      // Vérifier que la taille est supérieure à 10
      if (taille <= 10) {
        reject("La taille de la matrice doit être supérieure à 10.");
        return;
      }
  
      // Générer la matrice en fonction du type
      let matrice = [];
      for (let i = 0; i < taille; i++) {
        matrice.push([]);
        for (let j = 0; j < taille; j++) {
          switch (matrixType) {
            case "Matrice carrée":
              matrice[i].push(Math.floor(Math.random() * 10) + 1);
              break;
            case "Matrice diagonale":
              matrice[i].push(i === j ? Math.floor(Math.random() * 10) + 1 : 0);
              break;
            case "Matrice identité":
              matrice[i].push(i === j ? 1 : 0);
              break;
            default:
              matrice[i].push(Math.floor(Math.random() * 10) + 1);
              break;
          }
        }
      }
  
      // Créer un objet FileReader pour lire le fichier sélectionné
      const reader = new FileReader();
      reader.onload = function () {
        const contenuFichier = reader.result;
        const matriceString = JSON.stringify(matrice);
        const nouveauFichier = contenuFichier + "\n" + matriceString;
        
        // Convertir le contenu en un Blob et créer un lien pour télécharger
        const blob = new Blob([nouveauFichier], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        
        // Résoudre la promesse avec le lien du fichier modifié
        resolve(url);
      };
      reader.onerror = function (error) {
        reject("Erreur lors de la lecture du fichier: " + error);
      };
  
      reader.readAsText(fichier);  // Lire le fichier comme texte
    });
  }
  