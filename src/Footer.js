import React from 'react';
import { FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-copyright">&copy; 2024 Tous droits réservés.</p>
      <div className="footer-icons">
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebook />
        </a>
        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
          <FaLinkedin />
        </a>
        <a href="https://www.github.com" target="_blank" rel="noopener noreferrer">
          <FaGithub />
        </a>
      </div>
      
    </footer>
  );
}

export default Footer;
