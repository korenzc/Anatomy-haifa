import type { Course } from '../../types';
import eyeOrbit from './01-eye-orbit';

const course: Course = {
  id: 'head-face-neck',
  title: 'ראש, פנים וצוואר',
  subtitle: 'העין וארובת העין',
  icon: '🧠',
  hue: 300,
  lectures: [
    eyeOrbit,
  ],
};

export default course;
