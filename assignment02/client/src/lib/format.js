const pluralRules = new Intl.PluralRules('en');
const numberFormat = new Intl.NumberFormat('en');

export const formatNumber = (n) => numberFormat.format(n);

export const plural = (n, one, other) =>
  `${formatNumber(n)} ${pluralRules.select(n) === 'one' ? one : other}`;

export const formatStatus = (status) =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;

export const firstGrapheme = (text = '') => {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (!segmenter) return trimmed.charAt(0).toUpperCase();
  const [first] = segmenter.segment(trimmed);
  return first.segment.toUpperCase();
};
