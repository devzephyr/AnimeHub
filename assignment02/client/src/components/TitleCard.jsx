import { Link } from 'react-router-dom';
import './TitleCard.css';

const TitleCard = ({ title }) => {
  const defaultPoster = 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <Link to={`/titles/${title._id}`} className="title-card">
      <div className="title-poster">
        <img
          src={title.poster || defaultPoster}
          alt={title.name}
          onError={(e) => {
            e.target.src = defaultPoster;
          }}
        />
        <div className="title-overlay">
          <span className="title-type">{title.type}</span>
          {title.rating?.average > 0 && (
            <span className="title-rating">★ {title.rating.average.toFixed(1)}</span>
          )}
        </div>
      </div>
      <div className="title-info">
        <h3 className="title-name">{title.name}</h3>
        <div className="title-meta">
          {title.year && <span>{title.year}</span>}
          {title.episodes && <span>{title.episodes} eps</span>}
        </div>
        {title.genres?.length > 0 && (
          <div className="title-genres">
            {title.genres.slice(0, 3).map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default TitleCard;
