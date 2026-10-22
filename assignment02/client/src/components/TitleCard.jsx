import { Link } from 'react-router-dom';
import { FALLBACK_POSTER, onPosterError } from '../lib/poster';
import { plural } from '../lib/format';
import './TitleCard.css';

const TitleCard = ({ title }) => {
  return (
    <Link to={`/titles/${title._id}`} className="title-card">
      <div className="title-card-inner">
        <div className="title-poster">
          <img
            src={title.poster || FALLBACK_POSTER}
            alt={title.name}
            loading="lazy"
            decoding="async"
            onError={onPosterError}
          />
          <div className="title-overlay">
            {title.type && <span className="title-type">{title.type}</span>}
            {title.rating?.average > 0 && (
              <span className="title-rating">★ {title.rating.average.toFixed(1)}</span>
            )}
          </div>
        </div>
        <div className="title-info">
          <h3 className="title-name">{title.name}</h3>
          <div className="title-meta">
            {title.year > 0 && <span>{title.year}</span>}
            {title.episodes > 0 && <span>{plural(title.episodes, 'ep', 'eps')}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TitleCard;
