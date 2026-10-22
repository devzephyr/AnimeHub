import { Loader2 } from 'lucide-react';
import './Loading.css';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <Loader2 size={32} className="spinner-icon" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
};

export default Loading;
