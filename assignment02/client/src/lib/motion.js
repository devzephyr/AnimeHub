export const EASE_OUT = [0.23, 1, 0.32, 1];

export const enter = {
  initial: { opacity: 0, transform: 'translateY(-4px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  exit: { opacity: 0, transform: 'translateY(-4px)', transition: { duration: 0.15, ease: EASE_OUT } },
  transition: { duration: 0.2, ease: EASE_OUT },
};

export const pop = {
  initial: { opacity: 0, transform: 'scale(0.95)' },
  animate: { opacity: 1, transform: 'scale(1)' },
  exit: { opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } },
  transition: { duration: 0.18, ease: EASE_OUT },
};
