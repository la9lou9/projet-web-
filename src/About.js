// src/components/Home.js
import React from 'react';
import Header from './Header';
import './styles/About.css';
import Footer from './Footer';


function About() {

    return (
        <div className="about">
            <Header/>

            <div className="contenu">
                <p>
                    <h2>À propos du projet</h2>
                    <p>
                        Ce projet a été développé par
                        <a href="https://www.linkedin.com/in/oussema-gares" class="link-red" target="_blank"> Oussema
                            Gares </a>
                        et
                        <a href="https://www.linkedin.com/in/nour-mellah" class="link-red" target="_blank"> Nour
                            Mellah </a>
                        dans le cadre de nos études en Data Engineering. Il constitue à la fois une application de nos
                        connaissances en algorithme numérique et une expérience enrichissante en développement web.
                    </p>
                </p>
            </div>
            <Footer/>
        </div>


    );
}

export default About;
