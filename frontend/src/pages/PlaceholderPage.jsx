import { Link } from 'react-router-dom';
import './Inicio.css';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="inicio-container">
      <div className="welcome-card">
        <div className="welcome-header">
          <div className="avatar">{title?.charAt(0).toUpperCase()}</div>
          <div className="welcome-text">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="quick-actions">
          <Link to="/DashboardAdmin" className="action-btn">
            Volver a Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
