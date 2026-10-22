export const FALLBACK_POSTER = '/no-poster.svg';

export const onPosterError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_POSTER;
};
