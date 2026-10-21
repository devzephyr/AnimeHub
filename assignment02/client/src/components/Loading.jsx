import { m } from 'motion/react';
import { Loader2 } from 'lucide-react';
import './Loading.css';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <m.div
      className="loading-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <m.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="spinner-icon"
      >
        <Loader2 size={32} />
      </m.div>
      <m.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </m.p>
    </m.div>
  );
};

export default Loading;
