import Header from './Header';
import Footer from './Footer';
import './styles/Resolution.css';
import MatrixOptions from './containers/MatrixOptions';

function Resolution() {

  return (
    <div className="resolution">

      <Header />

      <div className="contenu">
      <MatrixOptions />


      </div>
      <Footer />
    </div>
  );
}

export default Resolution;
