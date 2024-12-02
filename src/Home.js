// src/components/Home.js
import React from 'react';
import Header from './Header';
import './Home.css';
import Footer from './Footer';


function Home() {
    
    return (
    <div className="home">
      <Header />
      

      <div className="content">
      <img className="img1" src="/gaussseidel.png" alt="Logo" />
      <div className="content2">
        <h2>Bienvenue sur notre site de calcul matriciel !</h2>
        <p>
          Ici, vous pouvez résoudre des systèmes d'équations linéaires en utilisant la méthode de Gauss-Seidel. 
          Cette méthode itérative permet de trouver des solutions approchées en résolvant une matrice de manière progressive. 
          Entrez simplement votre matrice et laissez l'algorithme effectuer les calculs pas à pas. La méthode de Gauss-Seidel 
          est idéale pour des systèmes bien posés et converge rapidement sous certaines conditions, rendant le calcul plus 
          accessible et interactif pour des applications variées.
          </p>
          </div>
      </div>
      <Footer />
      </div>      

    

  );
}

export default Home;
