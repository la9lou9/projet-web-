import Header from './Header';
import Footer from './Footer';
import './Resolution.css';
import Matrix from './boxes/Matrix';
import MatrixOptions from './boxes/MatrixOptions';
import MatrixUpload from './boxes/MatrixUpload';
import MatrixTypeSelector from './boxes/MatrixTypeSelector';

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
