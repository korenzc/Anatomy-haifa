import type { Course } from '../../types';
import skeletonTermsJoints from './01-skeleton-terms-joints';
import connectiveTissue from './02-connective-tissue';
import muscleTissue from './03-muscle-tissue';
import nervousSystem from './04-nervous-system';

const course: Course = {
  id: 'intro',
  title: 'מבואות',
  subtitle: 'עצבים, שריר, חיבור, חיפוי, מינוחים ומפרקים',
  icon: '🦴',
  hue: 250,
  lectures: [
    skeletonTermsJoints,
    connectiveTissue,
    muscleTissue,
    nervousSystem,
  ],
};

export default course;
